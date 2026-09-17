/**
 * trading.service tests
 *
 * Mocking strategy — createRequire + module cache injection (same pattern as
 * the other services in this suite; vi.mock() cannot bridge Vitest 4's ESM
 * runner to this project's CJS services).
 *
 * prisma.$transaction is mocked to just invoke its callback with a `tx` object
 * exposing the same mocked model methods as `prisma` itself — good enough to
 * assert on interactions without a real DB transaction.
 *
 * buyAsset/sellAsset use an atomic conditional updateMany (WHERE cashBalance
 * >= total / WHERE quantity >= quantity) instead of a read-then-write check,
 * so tests drive behavior through updateMany's returned `{ count }`.
 */

import { createRequire } from 'module'
import { vi, describe, it, expect, beforeEach } from 'vitest'

const _require = createRequire(import.meta.url)

const PRISMA_PATH  = _require.resolve('../../config/prisma')
const SERVICE_PATH = _require.resolve('../trading.service.js')

function cacheEntry(filepath, exports) {
  return { id: filepath, filename: filepath, loaded: true, exports, children: [], paths: [] }
}

let prisma, tx
let getCurrentPrice, buyAsset, sellAsset, TradingError

function loadWithMocks() {
  delete _require.cache[PRISMA_PATH]
  delete _require.cache[SERVICE_PATH]

  tx = {
    user:        { findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    holding:     { findUnique: vi.fn(), update: vi.fn(), create: vi.fn(), delete: vi.fn(), updateMany: vi.fn() },
    transaction: { create: vi.fn() },
  }

  prisma = {
    stockPrice:         { findUnique: vi.fn() },
    cryptoCurrencyRate: { findUnique: vi.fn() },
    forexPrice:         { findFirst: vi.fn() },
    $transaction: vi.fn((callback) => callback(tx)),
  }

  _require.cache[PRISMA_PATH] = cacheEntry(PRISMA_PATH, prisma)

  const svc = _require(SERVICE_PATH)
  getCurrentPrice = svc.getCurrentPrice
  buyAsset        = svc.buyAsset
  sellAsset       = svc.sellAsset
  TradingError    = svc.TradingError
}

beforeEach(loadWithMocks)

describe('trading.service', () => {
  describe('getCurrentPrice', () => {
    it('reads STOCK price from stockPrice.close', async () => {
      prisma.stockPrice.findUnique.mockResolvedValue({ close: 150 })
      expect(await getCurrentPrice('STOCK', 'AAPL')).toBe(150)
      expect(prisma.stockPrice.findUnique).toHaveBeenCalledWith({ where: { symbol: 'AAPL' } })
    })

    it('reads CRYPTO price from cryptoCurrencyRate.exchangeRate quoted in USD', async () => {
      prisma.cryptoCurrencyRate.findUnique.mockResolvedValue({ exchangeRate: 65000 })
      expect(await getCurrentPrice('CRYPTO', 'BTC')).toBe(65000)
      expect(prisma.cryptoCurrencyRate.findUnique).toHaveBeenCalledWith({
        where: { fromSymbol_toSymbol: { fromSymbol: 'BTC', toSymbol: 'USD' } }
      })
    })

    it('reads FOREX price from the most recent forexPrice row', async () => {
      prisma.forexPrice.findFirst.mockResolvedValue({ close: 1.08 })
      expect(await getCurrentPrice('FOREX', 'EUR')).toBe(1.08)
      expect(prisma.forexPrice.findFirst).toHaveBeenCalledWith({
        where: { fromSymbol: 'EUR', toSymbol: 'USD' },
        orderBy: { date: 'desc' }
      })
    })

    it('returns null when no price row exists', async () => {
      prisma.stockPrice.findUnique.mockResolvedValue(null)
      expect(await getCurrentPrice('STOCK', 'ZZZZ')).toBeNull()
    })

    it('throws TradingError for an unsupported asset type', async () => {
      await expect(getCurrentPrice('BOND', 'X')).rejects.toThrow(TradingError)
    })
  })

  describe('buyAsset', () => {
    it('rejects a non-positive quantity before touching the DB', async () => {
      await expect(buyAsset(1, 'STOCK', 'AAPL', 0)).rejects.toThrow('Quantity must be a positive number')
      expect(prisma.$transaction).not.toHaveBeenCalled()
    })

    it('rejects NaN quantity before touching the DB', async () => {
      await expect(buyAsset(1, 'STOCK', 'AAPL', NaN)).rejects.toThrow('Quantity must be a positive number')
      expect(prisma.$transaction).not.toHaveBeenCalled()
    })

    it('rejects Infinity quantity before touching the DB', async () => {
      await expect(buyAsset(1, 'STOCK', 'AAPL', Infinity)).rejects.toThrow('Quantity must be a positive number')
      expect(prisma.$transaction).not.toHaveBeenCalled()
    })

    it('rejects a non-numeric quantity (e.g. parseFloat("abc") = NaN) before touching the DB', async () => {
      await expect(buyAsset(1, 'STOCK', 'AAPL', parseFloat('abc'))).rejects.toThrow('Quantity must be a positive number')
    })

    it('throws 404 when the asset has no current price', async () => {
      prisma.stockPrice.findUnique.mockResolvedValue(null)
      await expect(buyAsset(1, 'STOCK', 'ZZZZ', 1)).rejects.toThrow('No current price available')
    })

    it('rejects when the atomic cash debit affects zero rows (insufficient balance)', async () => {
      prisma.stockPrice.findUnique.mockResolvedValue({ close: 150 })
      tx.user.updateMany.mockResolvedValue({ count: 0 })
      tx.user.findUnique.mockResolvedValue({ id: 1, cashBalance: 100 })

      await expect(buyAsset(1, 'STOCK', 'AAPL', 1)).rejects.toThrow('Insufficient balance')
      expect(tx.user.updateMany).toHaveBeenCalledWith({
        where: { id: 1, cashBalance: { gte: 150 } },
        data: { cashBalance: { decrement: 150 } }
      })
      expect(tx.holding.create).not.toHaveBeenCalled()
    })

    it('debits cash atomically, creates a new holding, and logs a BUY transaction', async () => {
      prisma.stockPrice.findUnique.mockResolvedValue({ close: 150 })
      tx.user.updateMany.mockResolvedValue({ count: 1 })
      tx.holding.findUnique.mockResolvedValue(null)
      tx.holding.create.mockResolvedValue({ id: 1, quantity: 2, avgCost: 150 })
      tx.transaction.create.mockResolvedValue({ id: 1 })

      await buyAsset(1, 'STOCK', 'AAPL', 2)

      expect(tx.user.updateMany).toHaveBeenCalledWith({
        where: { id: 1, cashBalance: { gte: 300 } },
        data: { cashBalance: { decrement: 300 } }
      })
      expect(tx.holding.create).toHaveBeenCalledWith({
        data: { userId: 1, assetType: 'STOCK', symbol: 'AAPL', quantity: 2, avgCost: 150 }
      })
      expect(tx.transaction.create).toHaveBeenCalledWith({
        data: { userId: 1, assetType: 'STOCK', symbol: 'AAPL', side: 'BUY', quantity: 2, price: 150, total: 300 }
      })
    })

    it('averages cost basis into an existing holding rather than overwriting it', async () => {
      prisma.stockPrice.findUnique.mockResolvedValue({ close: 200 })
      tx.user.updateMany.mockResolvedValue({ count: 1 })
      // Existing lot: 2 shares @ 100 = 200 cost basis. Buying 2 more @ 200 = 400.
      // New average: (200 + 400) / 4 = 150
      tx.holding.findUnique.mockResolvedValue({ id: 5, quantity: 2, avgCost: 100 })
      tx.holding.update.mockResolvedValue({ id: 5, quantity: 4, avgCost: 150 })

      await buyAsset(1, 'STOCK', 'AAPL', 2)

      expect(tx.holding.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { quantity: 4, avgCost: 150 }
      })
    })
  })

  describe('sellAsset', () => {
    it('rejects a non-positive quantity before touching the DB', async () => {
      await expect(sellAsset(1, 'STOCK', 'AAPL', 0)).rejects.toThrow('Quantity must be a positive number')
      expect(prisma.$transaction).not.toHaveBeenCalled()
    })

    it('rejects NaN quantity before touching the DB', async () => {
      await expect(sellAsset(1, 'STOCK', 'AAPL', NaN)).rejects.toThrow('Quantity must be a positive number')
      expect(prisma.$transaction).not.toHaveBeenCalled()
    })

    it('rejects selling more than is held (atomic decrement affects zero rows)', async () => {
      prisma.stockPrice.findUnique.mockResolvedValue({ close: 150 })
      tx.holding.updateMany.mockResolvedValue({ count: 0 })
      tx.holding.findUnique.mockResolvedValue({ id: 1, quantity: 1, avgCost: 100 })

      await expect(sellAsset(1, 'STOCK', 'AAPL', 5)).rejects.toThrow('Insufficient holdings')
      expect(tx.holding.updateMany).toHaveBeenCalledWith({
        where: { userId: 1, assetType: 'STOCK', symbol: 'AAPL', quantity: { gte: 5 } },
        data: { quantity: { decrement: 5 } }
      })
      expect(tx.user.update).not.toHaveBeenCalled()
    })

    it('rejects selling an asset with no holding at all', async () => {
      prisma.stockPrice.findUnique.mockResolvedValue({ close: 150 })
      tx.holding.updateMany.mockResolvedValue({ count: 0 })
      tx.holding.findUnique.mockResolvedValue(null)

      await expect(sellAsset(1, 'STOCK', 'AAPL', 1)).rejects.toThrow('Insufficient holdings')
    })

    it('deletes the holding and credits cash when selling the full position', async () => {
      prisma.stockPrice.findUnique.mockResolvedValue({ close: 150 })
      tx.holding.updateMany.mockResolvedValue({ count: 1 })
      tx.holding.findUnique.mockResolvedValue({ id: 1, quantity: 0, avgCost: 100 })
      tx.holding.delete.mockResolvedValue({ id: 1 })
      tx.transaction.create.mockResolvedValue({ id: 1 })

      await sellAsset(1, 'STOCK', 'AAPL', 2)

      expect(tx.holding.delete).toHaveBeenCalledWith({ where: { id: 1 } })
      expect(tx.user.update).toHaveBeenCalledWith({
        where: { id: 1 }, data: { cashBalance: { increment: 300 } }
      })
      expect(tx.transaction.create).toHaveBeenCalledWith({
        data: { userId: 1, assetType: 'STOCK', symbol: 'AAPL', side: 'SELL', quantity: 2, price: 150, total: 300 }
      })
    })

    it('reduces quantity without deleting the holding on a partial sell', async () => {
      prisma.stockPrice.findUnique.mockResolvedValue({ close: 150 })
      tx.holding.updateMany.mockResolvedValue({ count: 1 })
      tx.holding.findUnique.mockResolvedValue({ id: 1, quantity: 3, avgCost: 100 })

      await sellAsset(1, 'STOCK', 'AAPL', 2)

      expect(tx.holding.delete).not.toHaveBeenCalled()
      expect(tx.user.update).toHaveBeenCalledWith({
        where: { id: 1 }, data: { cashBalance: { increment: 300 } }
      })
    })
  })
})
