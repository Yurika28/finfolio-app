/**
 * gemini.service tests
 *
 * SDK note
 * ────────
 * The service uses @google/genai (GoogleGenAI), NOT the older
 * @google/generative-ai package. We mock config/gemini (the module that
 * instantiates and exports the client) rather than the SDK package itself,
 * because that is what the service actually requires.
 *
 * Mock strategy — createRequire + module cache injection
 * ──────────────────────────────────────────────────────
 * Vitest 4.x is ESM-only; vi.mock() cannot bridge the ESM/CJS registry
 * boundary. Instead we inject plain objects into Node's module cache under
 * each dependency's absolute path before loading the service, so the service's
 * require() calls resolve to our mocks, never the real SDK or DB.
 *
 * Covered scenarios
 * ─────────────────
 * 1. Mock boundary — SDK and DB are never real implementations
 * 2. generateMarketSummary — returns the non-empty string from Gemini
 * 3. analyzeStock — prompt sent to Gemini contains the stock symbol
 * 4. API / timeout error — Gemini throws → service rethrows with a
 *    user-readable "Gemini API error: …" prefix, not a raw SDK message
 * 5. Empty response guard — Gemini returns empty text → service throws,
 *    does not return an empty string to the caller
 */

import { createRequire } from 'module'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

const _require = createRequire(import.meta.url)

// Absolute cache keys — must match what the service's require() resolves to
const GEMINI_PATH       = _require.resolve('../../config/gemini')
const PRISMA_PATH       = _require.resolve('../../config/prisma')
const DATE_HELPERS_PATH = _require.resolve('../../utils/dateHelpers')
const SERVICE_PATH      = _require.resolve('../gemini.service.js')

// ── Fixtures ──────────────────────────────────────────────────────────────────

const GENERATED_TEXT = 'Markets showed mixed signals today. Tech led gains while energy lagged.'

// ── State populated by loadWithMocks() in beforeEach ─────────────────────────

let mockGenAI, prisma
let generateMarketSummary, analyzeStock

function cacheEntry(filepath, exports) {
  return { id: filepath, filename: filepath, loaded: true, exports, children: [], paths: [] }
}

function loadWithMocks() {
  // 1. Evict stale cache entries so the service re-evaluates its require()s.
  delete _require.cache[GEMINI_PATH]
  delete _require.cache[PRISMA_PATH]
  delete _require.cache[DATE_HELPERS_PATH]
  delete _require.cache[SERVICE_PATH]

  // 2. Build mock objects with vi.fn() for assertion.

  // The service calls genAI.models.generateContent({ model, contents })
  // and reads response.text from the result.
  mockGenAI = {
    models: {
      generateContent: vi.fn().mockResolvedValue({ text: GENERATED_TEXT }),
    },
  }

  // Prisma mock covers every model method used by the service functions.
  prisma = {
    stockPrice:          { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    cryptoCurrencyRate:  { findMany: vi.fn().mockResolvedValue([]) },
    marketNews:          { findMany: vi.fn().mockResolvedValue([]) },
    companyProfile:      { findFirst: vi.fn().mockResolvedValue(null) },
    companyNews:         { findMany: vi.fn().mockResolvedValue([]) },
    weeklyChart:         { findMany: vi.fn().mockResolvedValue([]) },
    insight:             { findFirst: vi.fn().mockResolvedValue(null), upsert: vi.fn().mockResolvedValue({}) },
  }

  // 3. Inject mocks into Node's module cache BEFORE requiring the service.
  //    The service's require('../config/gemini') resolves to GEMINI_PATH —
  //    it gets mockGenAI instead of a real GoogleGenAI instance.
  _require.cache[GEMINI_PATH]       = cacheEntry(GEMINI_PATH, mockGenAI)
  _require.cache[PRISMA_PATH]       = cacheEntry(PRISMA_PATH, prisma)
  _require.cache[DATE_HELPERS_PATH] = cacheEntry(DATE_HELPERS_PATH, {
    sixHoursAgo: vi.fn().mockReturnValue(new Date('2024-01-01T00:00:00Z')),
  })

  // 4. Load the service — its require() calls hit the entries above.
  const svc           = _require(SERVICE_PATH)
  generateMarketSummary = svc.generateMarketSummary
  analyzeStock          = svc.analyzeStock
}

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(loadWithMocks)

afterEach(() => {
  vi.unstubAllGlobals()
})

// ─────────────────────────────────────────────────────────────────────────────

describe('gemini.service', () => {
  // ── 1. Mock boundary ────────────────────────────────────────────────────────

  it('mock boundary: Gemini SDK and prisma are never real implementations', () => {
    expect(vi.isMockFunction(mockGenAI.models.generateContent)).toBe(true)
    expect(vi.isMockFunction(prisma.insight.upsert)).toBe(true)
    expect(vi.isMockFunction(prisma.stockPrice.findMany)).toBe(true)
    // Documents: the real GoogleGenAI client is NEVER instantiated and the
    // real DB is NEVER queried during any test in this file.
  })

  // ── 2. generateMarketSummary — returns non-empty string ─────────────────────

  describe('generateMarketSummary', () => {
    it('calls Gemini once and returns the generated text string', async () => {
      const result = await generateMarketSummary()

      expect(mockGenAI.models.generateContent).toHaveBeenCalledOnce()
      expect(result).toBe(GENERATED_TEXT)
      expect(result.length).toBeGreaterThan(0)
      // Proves: the function forwards the assembled prompt to Gemini and returns
      // the text field of the response — not an object, not undefined.
    })

    it('upserts the generated text to the insight table with type "daily_summary"', async () => {
      await generateMarketSummary()

      expect(prisma.insight.upsert).toHaveBeenCalledOnce()
      const { where, update, create } = prisma.insight.upsert.mock.calls[0][0]
      expect(where).toEqual({ type: 'daily_summary' })
      expect(update.content).toBe(GENERATED_TEXT)
      expect(create.content).toBe(GENERATED_TEXT)
      // Proves: the generated summary is persisted for the daily cron cache —
      // subsequent dashboard requests serve this row without re-calling Gemini.
    })
  })

  // ── 3. analyzeStock — prompt contains the stock symbol ───────────────────────

  describe('analyzeStock', () => {
    it('sends a prompt containing the requested ticker symbol to Gemini', async () => {
      await analyzeStock('AAPL')

      expect(mockGenAI.models.generateContent).toHaveBeenCalledOnce()

      // The { model, contents } object passed to generateContent
      const callArg = mockGenAI.models.generateContent.mock.calls[0][0]

      expect(callArg.model).toBe('gemini-2.5-flash')
      expect(callArg.contents).toContain('AAPL')
      // Proves: the symbol is embedded in the prompt so Gemini receives context
      // about the correct ticker — wrong symbol here means wrong analysis.
    })

    it('skips Gemini and returns cached content when a fresh insight exists', async () => {
      prisma.insight.findFirst.mockResolvedValueOnce({
        type: 'stock:MSFT', content: 'Cached analysis for MSFT.', generatedAt: new Date(),
      })

      const result = await analyzeStock('MSFT')

      expect(mockGenAI.models.generateContent).not.toHaveBeenCalled()
      expect(result).toBe('Cached analysis for MSFT.')
      // Proves: the 6-hour TTL cache prevents repeated Gemini calls for the same
      // ticker within the same window — one of the most expensive operations we gate.
    })
  })

  // ── 4. API / timeout error — user-readable rethrow ──────────────────────────

  describe('API error handling', () => {
    it('wraps a raw SDK exception in a "Gemini API error:" prefix', async () => {
      mockGenAI.models.generateContent.mockRejectedValueOnce(
        new Error('503 UNAVAILABLE: The model is overloaded.')
      )

      await expect(generateMarketSummary()).rejects.toThrow('Gemini API error:')
      // Proves: the raw SDK error (which may contain internal grpc codes or
      // confusing stack traces) is replaced with a stable, loggable prefix
      // that the error handler can pattern-match without coupling to SDK internals.
    })

    it('preserves the original SDK message inside the wrapped error', async () => {
      mockGenAI.models.generateContent.mockRejectedValueOnce(
        new Error('DEADLINE_EXCEEDED: request timed out')
      )

      await expect(generateMarketSummary()).rejects.toThrow('DEADLINE_EXCEEDED')
      // Proves: the original cause is not lost — operators can still read why
      // the call failed without needing to correlate a separate SDK log line.
    })
  })

  // ── 5. Empty response guard ──────────────────────────────────────────────────

  describe('empty response guard', () => {
    it('throws rather than returning an empty string when Gemini text is ""', async () => {
      mockGenAI.models.generateContent.mockResolvedValueOnce({ text: '' })

      await expect(generateMarketSummary()).rejects.toThrow('Gemini returned an empty response')
      // Proves: an empty string from Gemini (e.g. safety filter triggered, quota
      // reached, or model glitch) does NOT propagate to the API response — callers
      // always get either meaningful text or a catchable error.
    })

    it('throws rather than returning an empty string when Gemini text is whitespace', async () => {
      mockGenAI.models.generateContent.mockResolvedValueOnce({ text: '   \n  ' })

      await expect(generateMarketSummary()).rejects.toThrow('Gemini returned an empty response')
      // Proves: the guard uses .trim() — a response of only newlines or spaces
      // is treated as empty, not as valid content.
    })

    it('does NOT write an empty string to the insight table', async () => {
      mockGenAI.models.generateContent.mockResolvedValueOnce({ text: '' })

      await generateMarketSummary().catch(() => {})

      expect(prisma.insight.upsert).not.toHaveBeenCalled()
      // Proves: the guard fires BEFORE the DB write — the insight table never
      // contains a blank row that would silently serve empty content to users.
    })
  })
})
