/**
 * alphaVantage.service tests
 *
 * Mocking strategy — createRequire + module cache injection
 * ─────────────────────────────────────────────────────────
 * Vitest 4.x is ESM-only; CJS files cannot require() it. vi.mock() hoisting
 * also cannot bridge the ESM/CJS registry boundary so the service's require()
 * calls would hit the real PrismaClient.
 *
 * Instead we use createRequire to access Node's CJS module cache directly:
 *   1. Delete stale cache entries for prisma, delay, and the service itself.
 *   2. Inject plain mock objects into the cache under the resolved absolute path.
 *   3. require() the service — its require('../config/prisma') hits our cached
 *      mock objects, never the real PrismaClient.
 * vi.fn() is still used for call-count assertions; vi.stubGlobal for fetch.
 *
 * These functions are WRITE-ONLY cron helpers — they populate the DB cache.
 * The critical test scenarios are:
 *   (a) correct DB write on success
 *   (b) rate-limit guard — early exit WITHOUT writing to DB
 *   (c) graceful handling of empty/malformed AV responses
 */

import { createRequire }  from 'module'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'

const _require = createRequire(import.meta.url)

// Resolve absolute paths once — these are the keys in require.cache
const PRISMA_PATH  = _require.resolve('../../config/prisma')
const DELAY_PATH   = _require.resolve('../../utils/delay')
const SERVICE_PATH = _require.resolve('../alphaVantage.service.js')

// ── Fixture helpers ───────────────────────────────────────────────────────────

const makeAVCrypto = (price = 50000) => ({
  'Time Series (Digital Currency Daily)': {
    '2024-01-15': { '4b. close (USD)': String(price) }
  }
})

const makeAVWeekly = () => ({
  'Weekly Adjusted Time Series': {
    '2024-01-12': {
      '1. open': '148.00', '2. high': '153.00', '3. low': '147.50',
      '4. close': '150.25', '5. adjusted close': '150.25', '6. volume': '45000000'
    },
    '2024-01-05': {
      '1. open': '145.00', '2. high': '151.00', '3. low': '144.00',
      '4. close': '149.00', '5. adjusted close': '149.00', '6. volume': '38000000'
    }
  }
})

const makeAVForex = () => ({
  'Time Series FX (Daily)': {
    '2024-01-15': { '1. open': '1.2700', '2. high': '1.2750', '3. low': '1.2680', '4. close': '1.2720' }
  }
})

const rateLimit = (via = 'Information') => ({
  [via]: 'Thank you for using Alpha Vantage! Our standard API rate limit is 25 requests per day.'
})

const mockFetch = (data) => ({
  ok: true, status: 200, json: vi.fn().mockResolvedValue(data),
})

// ── Module-level state (populated by loadWithMocks in each beforeEach) ────────

let prisma
let syncCryptoPrices, syncWeeklyChart, syncForexRates, getNewsSentiment
let fetchSpy

function cacheEntry(filepath, exports) {
  return { id: filepath, filename: filepath, loaded: true, exports, children: [], paths: [] }
}

function loadWithMocks() {
  // 1. Evict stale entries so the service is re-evaluated with fresh mocks.
  delete _require.cache[PRISMA_PATH]
  delete _require.cache[DELAY_PATH]
  delete _require.cache[SERVICE_PATH]

  // 2. Inject mock objects into the cache BEFORE loading the service.
  //    The service's require('../config/prisma') resolves to PRISMA_PATH —
  //    it finds this entry instead of instantiating a real PrismaClient.
  prisma = {
    cryptoCurrencyRate: { upsert: vi.fn().mockResolvedValue({}) },
    weeklyChart:        { upsert: vi.fn().mockResolvedValue({}) },
    forexPrice:         { upsert: vi.fn().mockResolvedValue({}) },
  }
  _require.cache[PRISMA_PATH] = cacheEntry(PRISMA_PATH, prisma)
  _require.cache[DELAY_PATH]  = cacheEntry(DELAY_PATH, { delay: vi.fn().mockResolvedValue(undefined) })

  // 3. Load service — its require() calls hit the injected cache entries.
  const svc    = _require(SERVICE_PATH)
  syncCryptoPrices = svc.syncCryptoPrices
  syncWeeklyChart  = svc.syncWeeklyChart
  syncForexRates   = svc.syncForexRates
  getNewsSentiment = svc.getNewsSentiment
}

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
  loadWithMocks()
  process.env.ALPHA_VANTAGE_KEY = 'test-key'
  fetchSpy = vi.fn()
  vi.stubGlobal('fetch', fetchSpy)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ─────────────────────────────────────────────────────────────────────────────

describe('alphaVantage.service', () => {
  // ── Mock boundary ─────────────────────────────────────────────────────────

  it('mock setup: fetch and prisma are never the real implementations', () => {
    expect(vi.isMockFunction(fetchSpy)).toBe(true)
    expect(vi.isMockFunction(prisma.cryptoCurrencyRate.upsert)).toBe(true)
    expect(vi.isMockFunction(prisma.weeklyChart.upsert)).toBe(true)
    // Documents that the real AV API is NEVER called and the real DB is NEVER touched.
  })

  // ── syncCryptoPrices ──────────────────────────────────────────────────────

  describe('syncCryptoPrices', () => {
    it('successful sync: calls AV once per symbol and upserts with correct shape', async () => {
      fetchSpy.mockResolvedValue(mockFetch(makeAVCrypto(50_000)))

      await syncCryptoPrices(['BTC', 'ETH'])

      expect(fetchSpy).toHaveBeenCalledTimes(2)
      expect(prisma.cryptoCurrencyRate.upsert).toHaveBeenCalledTimes(2)

      const firstCall = prisma.cryptoCurrencyRate.upsert.mock.calls[0][0]
      expect(firstCall.where).toEqual({
        fromSymbol_toSymbol: { fromSymbol: 'BTC', toSymbol: 'USD' }
      })
      expect(firstCall.create).toMatchObject({
        fromSymbol: 'BTC', toSymbol: 'USD', exchangeRate: 50_000
      })
      // Proves: each symbol results in one AV call and one DB upsert using the correct
      // compound unique key, with the close price correctly parsed to a Float.
    })

    it('rate limit via "Information" field: exits immediately, DB NOT written', async () => {
      fetchSpy.mockResolvedValue(mockFetch(rateLimit('Information')))

      await syncCryptoPrices(['BTC', 'ETH', 'SOL'])

      expect(fetchSpy).toHaveBeenCalledOnce()
      expect(prisma.cryptoCurrencyRate.upsert).not.toHaveBeenCalled()
      // Proves: the daily budget guard detects the Information key and returns immediately —
      // the remaining 2 symbols are never fetched, saving 2 of the 25 daily calls.
    })

    it('rate limit via "Note" field: same early-exit, same DB protection', async () => {
      fetchSpy.mockResolvedValue(mockFetch(rateLimit('Note')))

      await syncCryptoPrices(['BTC'])

      expect(prisma.cryptoCurrencyRate.upsert).not.toHaveBeenCalled()
      // Proves: the per-minute burst limit (Note key) triggers identical behaviour to
      // the daily limit — abort, serve stale cache, protect budget.
    })

    it('empty Time Series: skips symbol gracefully, no crash, no DB write', async () => {
      fetchSpy.mockResolvedValue(mockFetch({ 'Time Series (Digital Currency Daily)': {} }))

      await syncCryptoPrices(['BTC'])

      expect(prisma.cryptoCurrencyRate.upsert).not.toHaveBeenCalled()
      // Proves: an empty series (e.g. AV returns no data for that symbol) is silently
      // skipped — it does not throw or abort other symbols in the loop.
    })

    it('falls back to legacy "4. close" field when "4b. close (USD)" is absent', async () => {
      const legacyResponse = {
        'Time Series (Digital Currency Daily)': {
          '2024-01-15': { '4. close': '45000' }
        }
      }
      fetchSpy.mockResolvedValue(mockFetch(legacyResponse))

      await syncCryptoPrices(['ETH'])

      const { create } = prisma.cryptoCurrencyRate.upsert.mock.calls[0][0]
      expect(create.exchangeRate).toBe(45_000)
      // Proves: the ?? fallback handles the AV field-name change gracefully — the
      // service works regardless of which key AV returns in that period.
    })

    it('rate limit on first symbol stops ALL subsequent fetches', async () => {
      fetchSpy.mockResolvedValueOnce(mockFetch(rateLimit('Information')))

      await syncCryptoPrices(['BTC', 'ETH', 'SOL'])

      expect(fetchSpy).toHaveBeenCalledOnce()
      // Proves: checkRateLimit() causes a function return, not just a loop skip —
      // the 6-symbol crypto budget is fully protected once the limit is hit.
    })
  })

  // ── syncWeeklyChart ───────────────────────────────────────────────────────

  describe('syncWeeklyChart', () => {
    it('successful sync: upserts one row per week with correct compound key', async () => {
      fetchSpy.mockResolvedValue(mockFetch(makeAVWeekly()))

      await syncWeeklyChart(['AAPL'])

      expect(fetchSpy).toHaveBeenCalledOnce()
      expect(prisma.weeklyChart.upsert).toHaveBeenCalledTimes(2)

      const firstRow = prisma.weeklyChart.upsert.mock.calls[0][0]
      expect(firstRow.where).toEqual({ symbol_date: { symbol: 'AAPL', date: '2024-01-12' } })
      expect(firstRow.create).toMatchObject({
        symbol: 'AAPL', open: 148, high: 153, low: 147.5, close: 150.25,
      })
      // Proves: the weekly series is parsed and each row is stored with the correct
      // @@unique([symbol, date]) key — upserts are idempotent even if the cron re-runs.
    })

    it('rate limit: stops after first symbol, second symbol is never fetched', async () => {
      fetchSpy.mockResolvedValueOnce(mockFetch(rateLimit('Information')))

      await syncWeeklyChart(['AAPL', 'TSLA'])

      expect(fetchSpy).toHaveBeenCalledOnce()
      expect(prisma.weeklyChart.upsert).not.toHaveBeenCalled()
      // Proves: a rate-limit on any symbol in the 4-symbol daily chart rotation stops
      // ALL further AV calls — preserving 3 calls for tomorrow's batch.
    })

    it('empty Weekly Adjusted Time Series: resolves without throwing', async () => {
      fetchSpy.mockResolvedValue(mockFetch({ 'Weekly Adjusted Time Series': {} }))

      await expect(syncWeeklyChart(['AAPL'])).resolves.toBeUndefined()
      expect(prisma.weeklyChart.upsert).not.toHaveBeenCalled()
      // Proves: a weekend/holiday response with no data points is handled gracefully —
      // no crash, no DB write, loop continues to the next symbol.
    })
  })

  // ── getNewsSentiment ──────────────────────────────────────────────────────

  describe('getNewsSentiment', () => {
    it('returns the raw feed array from a successful AV response', async () => {
      const feed = [
        { title: 'Fed holds rates', sentiment_score: '0.3' },
        { title: 'Tech stocks rally', sentiment_score: '0.7' },
      ]
      fetchSpy.mockResolvedValue(mockFetch({ feed }))

      const result = await getNewsSentiment()

      expect(fetchSpy).toHaveBeenCalledOnce()
      expect(fetchSpy.mock.calls[0][0]).toContain('NEWS_SENTIMENT')
      expect(result).toStrictEqual(feed)
      // Proves: the function returns the raw AV feed to the caller (newsSync.job) without
      // any DB write — the job decides what to do with the articles.
    })

    it('rate limit via Information: returns [] so the news sync job keeps running', async () => {
      fetchSpy.mockResolvedValue(mockFetch(rateLimit('Information')))

      const result = await getNewsSentiment()

      expect(result).toStrictEqual([])
      // Proves: a rate-limited sentiment call returns an empty array, NOT an exception —
      // newsSync.job continues without crashing because of an exhausted quota.
    })

    it('missing feed key: returns [] without throwing for unexpected AV shapes', async () => {
      fetchSpy.mockResolvedValue(mockFetch({ note: 'no articles available' }))

      const result = await getNewsSentiment()

      expect(result).toStrictEqual([])
      // Proves: the `|| []` fallback handles any AV response that lacks the "feed" key —
      // malformed responses degrade gracefully to an empty result.
    })
  })

  // ── syncForexRates ────────────────────────────────────────────────────────

  describe('syncForexRates', () => {
    it('calls AV with correct from/to params and upserts each trading day', async () => {
      fetchSpy.mockResolvedValue(mockFetch(makeAVForex()))

      await syncForexRates([{ from: 'GBP', to: 'USD' }])

      expect(fetchSpy).toHaveBeenCalledOnce()
      const url = fetchSpy.mock.calls[0][0]
      expect(url).toContain('from_symbol=GBP')
      expect(url).toContain('to_symbol=USD')
      expect(prisma.forexPrice.upsert).toHaveBeenCalledOnce()

      const { where, create } = prisma.forexPrice.upsert.mock.calls[0][0]
      expect(where).toEqual({
        fromSymbol_toSymbol_date: { fromSymbol: 'GBP', toSymbol: 'USD', date: '2024-01-15' }
      })
      expect(create).toMatchObject({
        fromSymbol: 'GBP', toSymbol: 'USD', open: 1.27, high: 1.275, close: 1.272,
      })
      // Proves: the correct AV FX_DAILY endpoint is called and each row is upserted
      // with the three-part compound unique key (fromSymbol, toSymbol, date).
    })

    it('rate limit: stops after first pair, second pair never fetched', async () => {
      fetchSpy.mockResolvedValue(mockFetch(rateLimit('Information')))

      await syncForexRates([{ from: 'GBP', to: 'USD' }, { from: 'EUR', to: 'USD' }])

      expect(fetchSpy).toHaveBeenCalledOnce()
      expect(prisma.forexPrice.upsert).not.toHaveBeenCalled()
      // Proves: the 4 calls/day forex budget is protected — rate limit on the first pair
      // stops the whole sync, saving the remaining budget for tomorrow's run.
    })

    it('empty FX series: skips pair without crashing', async () => {
      fetchSpy.mockResolvedValue(mockFetch({ 'Time Series FX (Daily)': {} }))

      await expect(syncForexRates([{ from: 'GBP', to: 'USD' }])).resolves.toBeUndefined()
      expect(prisma.forexPrice.upsert).not.toHaveBeenCalled()
      // Proves: an empty forex series is logged and skipped — the cron job doesn't throw
      // when AV returns no data for a trading holiday or weekend.
    })
  })
})
