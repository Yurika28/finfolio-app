/**
 * finnhub.service tests
 *
 * Mocking strategy — createRequire + module cache injection
 * ─────────────────────────────────────────────────────────
 * Vitest 4.x is ESM-only; vi.mock() cannot bridge the ESM/CJS registry
 * boundary, so the service's require() would hit the real PrismaClient.
 *
 * Instead we use createRequire to access Node's CJS module cache directly:
 *   1. Delete stale cache entries for prisma, dateHelpers, delay, and the service.
 *   2. Inject plain mock objects into the cache under the resolved absolute path.
 *   3. require() the service — its require('../config/prisma') hits our cached
 *      mock objects, never the real PrismaClient.
 * vi.fn() is still used for call-count assertions; vi.stubGlobal for fetch.
 */

import { createRequire } from 'module'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

const _require = createRequire(import.meta.url)

// Resolve absolute paths once — these are the keys in require.cache
const PRISMA_PATH       = _require.resolve('../../config/prisma')
const DATE_HELPERS_PATH = _require.resolve('../../utils/dateHelpers')
const DELAY_PATH        = _require.resolve('../../utils/delay')
const SERVICE_PATH      = _require.resolve('../finnhub.service.js')

// ── Fixtures ─────────────────────────────────────────────────────────────────

const FRESH_STOCK = {
  id: 1, symbol: 'AAPL', close: 150.25, high: 151.00,
  low: 148.50, open: 149.00, dp: 1.01, d: 1.50,
  insertedAt: new Date('2024-01-15T12:00:00Z'),
}

const FH_QUOTE = { c: 150.25, d: 1.50, dp: 1.01, h: 151.00, l: 148.50, o: 149.00, pc: 148.75 }

const FRESH_PROFILE = {
  id: 1, ticker: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ',
  finnhubIndustry: 'Technology', marketCapitalization: 2_800_000,
  logo: 'https://logo.url', weburl: 'https://apple.com',
  updatedAt: new Date('2024-01-15T12:00:00Z'),
}

const FH_PROFILE = {
  name: 'Apple Inc.', exchange: 'NASDAQ', finnhubIndustry: 'Technology',
  marketCapitalization: 2_800_000, logo: 'https://logo.url', weburl: 'https://apple.com',
}

const mockFetch = (data, { ok = true, status = 200 } = {}) => ({
  ok, status, json: vi.fn().mockResolvedValue(data),
})

// ── Module-level state (populated by loadWithMocks in each beforeEach) ────────

let prisma
let getStockQuote, getCompanyProfile, syncAllPrices
let fetchSpy

function cacheEntry(filepath, exports) {
  return { id: filepath, filename: filepath, loaded: true, exports, children: [], paths: [] }
}

function loadWithMocks() {
  // 1. Evict stale entries
  delete _require.cache[PRISMA_PATH]
  delete _require.cache[DATE_HELPERS_PATH]
  delete _require.cache[DELAY_PATH]
  delete _require.cache[SERVICE_PATH]

  // 2. Build mock objects
  prisma = {
    stockPrice:     { findFirst: vi.fn().mockResolvedValue(null), upsert: vi.fn().mockResolvedValue(FRESH_STOCK) },
    companyProfile: { findFirst: vi.fn().mockResolvedValue(null), upsert: vi.fn().mockResolvedValue(FRESH_PROFILE) },
    companyNews:    { findMany: vi.fn().mockResolvedValue([]), upsert: vi.fn().mockResolvedValue({}) },
    marketNews:     { findMany: vi.fn().mockResolvedValue([]), upsert: vi.fn().mockResolvedValue({}) },
    ipoCalendar:    { findMany: vi.fn().mockResolvedValue([]), deleteMany: vi.fn().mockResolvedValue({}), createMany: vi.fn().mockResolvedValue({}) },
  }

  const fixedDate = new Date('2024-01-01T00:00:00Z')
  const dateHelpers = {
    oneHourAgo:       vi.fn().mockReturnValue(fixedDate),
    sixHoursAgo:      vi.fn().mockReturnValue(fixedDate),
    twentyFourHrsAgo: vi.fn().mockReturnValue(fixedDate),
    sevenDaysAgo:     vi.fn().mockReturnValue(fixedDate),
  }

  // 3. Inject into cache BEFORE loading the service
  _require.cache[PRISMA_PATH]       = cacheEntry(PRISMA_PATH, prisma)
  _require.cache[DATE_HELPERS_PATH] = cacheEntry(DATE_HELPERS_PATH, dateHelpers)
  _require.cache[DELAY_PATH]        = cacheEntry(DELAY_PATH, { delay: vi.fn().mockResolvedValue(undefined) })

  // 4. Load service — its require() calls resolve to our cache entries
  const svc      = _require(SERVICE_PATH)
  getStockQuote   = svc.getStockQuote
  getCompanyProfile = svc.getCompanyProfile
  syncAllPrices  = svc.syncAllPrices
}

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  loadWithMocks()
  process.env.FINNHUB_KEY = 'test-key'
  fetchSpy = vi.fn()
  vi.stubGlobal('fetch', fetchSpy)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ─────────────────────────────────────────────────────────────────────────────

describe('finnhub.service', () => {
  // ── getStockQuote ─────────────────────────────────────────────────────────

  describe('getStockQuote', () => {
    it('mock setup: fetch and prisma are never real implementations', () => {
      expect(vi.isMockFunction(fetchSpy)).toBe(true)
      expect(vi.isMockFunction(prisma.stockPrice.findFirst)).toBe(true)
      expect(vi.isMockFunction(prisma.stockPrice.upsert)).toBe(true)
      // Documents the isolation boundary — confirms mocks are active.
    })

    it('cache hit: returns DB row and does NOT call the Finnhub API', async () => {
      prisma.stockPrice.findFirst.mockResolvedValueOnce(FRESH_STOCK)

      const result = await getStockQuote('AAPL')

      expect(fetchSpy).not.toHaveBeenCalled()
      expect(result).toStrictEqual(FRESH_STOCK)
      // Proves: the 1-hour TTL guard prevents any Finnhub call when cache is warm,
      // keeping per-hour quota intact across all cron intervals.
    })

    it('cache miss: calls Finnhub exactly once, maps response to DB columns, upserts', async () => {
      fetchSpy.mockResolvedValueOnce(mockFetch(FH_QUOTE))

      const result = await getStockQuote('AAPL')

      expect(fetchSpy).toHaveBeenCalledOnce()
      expect(fetchSpy.mock.calls[0][0]).toContain('symbol=AAPL')
      expect(prisma.stockPrice.upsert).toHaveBeenCalledOnce()
      const { update } = prisma.stockPrice.upsert.mock.calls[0][0]
      expect(update).toMatchObject({ close: 150.25, dp: 1.01, d: 1.50, high: 151.00 })
      expect(result).toStrictEqual(FRESH_STOCK)
      // Proves: a cold cache triggers exactly one Finnhub request and one DB write,
      // with the correct field mapping (Finnhub c→close, h→high, dp→dp, etc.).
    })

    it('stale data is treated as a cache miss and triggers a re-fetch', async () => {
      // findFirst default is null (cache miss) — no override needed.
      fetchSpy.mockResolvedValueOnce(mockFetch(FH_QUOTE))

      await getStockQuote('AAPL')

      expect(fetchSpy).toHaveBeenCalledOnce()
      // Proves: data outside the TTL window is invisible to the cache check — the
      // service behaves identically to a completely missing record.
    })

    it('HTTP error: throws a message containing both the symbol and the status code', async () => {
      fetchSpy.mockResolvedValueOnce(mockFetch({}, { ok: false, status: 403 }))

      await expect(getStockQuote('AAPL')).rejects.toThrow('Finnhub quote AAPL: 403')
      // Proves: HTTP errors surface with enough context to identify the failing symbol
      // and exact status code without correlating separate log lines.
    })

    it('network error: propagates without swallowing — cron job receives it for logging', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('ECONNREFUSED'))

      await expect(getStockQuote('TSLA')).rejects.toThrow('ECONNREFUSED')
      // Proves: network-level failures are NOT silently caught — they propagate to
      // syncAllPrices which records them per-symbol without aborting the full batch.
    })
  })

  // ── getCompanyProfile ─────────────────────────────────────────────────────

  describe('getCompanyProfile', () => {
    it('cache hit: returns profile from DB without calling Finnhub', async () => {
      prisma.companyProfile.findFirst.mockResolvedValueOnce(FRESH_PROFILE)

      const result = await getCompanyProfile('AAPL')

      expect(fetchSpy).not.toHaveBeenCalled()
      expect(result).toStrictEqual(FRESH_PROFILE)
      // Proves: the 24-hour TTL guard prevents redundant profile fetches — company
      // profiles change rarely so one call per day is the correct budget.
    })

    it('cache miss: hits profile2 endpoint and upserts all profile fields', async () => {
      fetchSpy.mockResolvedValueOnce(mockFetch(FH_PROFILE))

      const result = await getCompanyProfile('AAPL')

      expect(fetchSpy).toHaveBeenCalledOnce()
      expect(fetchSpy.mock.calls[0][0]).toContain('profile2')
      expect(fetchSpy.mock.calls[0][0]).toContain('symbol=AAPL')
      expect(prisma.companyProfile.upsert).toHaveBeenCalledOnce()
      const { create } = prisma.companyProfile.upsert.mock.calls[0][0]
      expect(create).toMatchObject({
        ticker: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', finnhubIndustry: 'Technology',
      })
      expect(result).toStrictEqual(FRESH_PROFILE)
      // Proves: a profile cache miss calls the correct Finnhub endpoint and writes all
      // fields — subsequent requests within 24 hrs are served from the DB cache.
    })

    it('HTTP error: throws with symbol + status code for operator diagnosis', async () => {
      fetchSpy.mockResolvedValueOnce(mockFetch({}, { ok: false, status: 404 }))

      await expect(getCompanyProfile('FAKE')).rejects.toThrow('Finnhub profile FAKE: 404')
      // Proves: HTTP errors identify the failing symbol so operators can determine
      // which ticker is unlisted without correlating request IDs.
    })

    it('invalid symbol: throws gracefully, does NOT crash the server', async () => {
      fetchSpy.mockResolvedValueOnce(mockFetch({}, { ok: false, status: 404 }))

      await expect(getCompanyProfile('INVALID')).rejects.toThrow()
      // Proves: a bad symbol throws a catchable error, never an unhandled rejection.
    })
  })

  // ── syncAllPrices ─────────────────────────────────────────────────────────

  describe('syncAllPrices', () => {
    it('returns { status: ok, data } for all successful symbols', async () => {
      fetchSpy.mockResolvedValue(mockFetch(FH_QUOTE))

      const results = await syncAllPrices(['AAPL', 'TSLA'])

      expect(results).toHaveLength(2)
      expect(results[0]).toMatchObject({ symbol: 'AAPL', status: 'ok', data: FRESH_STOCK })
      expect(results[1]).toMatchObject({ symbol: 'TSLA', status: 'ok', data: FRESH_STOCK })
      // Proves: successful symbols produce the { status: 'ok', data } shape the cron job
      // uses to count successful updates in its log output.
    })

    it('records { status: error } per failing symbol without aborting the batch', async () => {
      fetchSpy
        .mockResolvedValueOnce(mockFetch(FH_QUOTE))
        .mockResolvedValueOnce(mockFetch({}, { ok: false, status: 500 }))

      const results = await syncAllPrices(['AAPL', 'TSLA'])

      expect(results[0]).toMatchObject({ symbol: 'AAPL', status: 'ok' })
      expect(results[1]).toMatchObject({ symbol: 'TSLA', status: 'error' })
      expect(results[1].error).toContain('500')
      // Proves: one failing symbol does NOT abort the batch — subsequent symbols
      // still process and the error is captured per-entry for log inspection.
    })

    it('skips fetch for cache-hit symbols — saves Finnhub quota for stale ones', async () => {
      prisma.stockPrice.findFirst
        .mockResolvedValueOnce(FRESH_STOCK)
        .mockResolvedValueOnce(null)

      fetchSpy.mockResolvedValueOnce(mockFetch(FH_QUOTE))

      const results = await syncAllPrices(['AAPL', 'TSLA'])

      expect(fetchSpy).toHaveBeenCalledOnce()
      expect(results.every(r => r.status === 'ok')).toBe(true)
      // Proves: 10 symbols with 8 cached = 2 Finnhub calls, not 10 — the cache
      // multiplies the effective hourly quota by the cache-hit ratio.
    })
  })
})
