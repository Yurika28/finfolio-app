const prisma = require('../config/prisma')

class TradingError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
  }
}

// All rates in StockPrice/CryptoCurrencyRate/ForexPrice are quoted against USD,
// so every asset type resolves to a single "price in USD per unit" number.
const getCurrentPrice = async (assetType, symbol) => {
  if (assetType === 'STOCK') {
    const row = await prisma.stockPrice.findUnique({ where: { symbol } })
    return row?.close ?? null
  }
  if (assetType === 'CRYPTO') {
    const row = await prisma.cryptoCurrencyRate.findUnique({
      where: { fromSymbol_toSymbol: { fromSymbol: symbol, toSymbol: 'USD' } }
    })
    return row?.exchangeRate ?? null
  }
  if (assetType === 'FOREX') {
    const row = await prisma.forexPrice.findFirst({
      where: { fromSymbol: symbol, toSymbol: 'USD' },
      orderBy: { date: 'desc' }
    })
    return row?.close ?? null
  }
  throw new TradingError(`Unsupported asset type: ${assetType}`, 400)
}

const assertValidQuantity = (quantity) => {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new TradingError('Quantity must be a positive number', 400)
  }
}

const buyAsset = async (userId, assetType, symbol, quantity) => {
  assertValidQuantity(quantity)

  const price = await getCurrentPrice(assetType, symbol)
  if (price == null) throw new TradingError(`No current price available for ${symbol}`, 404)

  const total = price * quantity

  return prisma.$transaction(async (tx) => {
    // Atomic conditional debit: a single UPDATE ... WHERE cashBalance >= total.
    // Two concurrent buys can't both read the same starting balance and both
    // succeed — Postgres serializes writes to the same row, so the second
    // request's WHERE clause sees the already-decremented balance.
    const debited = await tx.user.updateMany({
      where: { id: userId, cashBalance: { gte: total } },
      data: { cashBalance: { decrement: total } }
    })

    if (debited.count === 0) {
      const user = await tx.user.findUnique({ where: { id: userId } })
      throw new TradingError(
        `Insufficient balance: need $${total.toFixed(2)}, have $${(user?.cashBalance ?? 0).toFixed(2)}`,
        400
      )
    }

    const existing = await tx.holding.findUnique({
      where: { userId_assetType_symbol: { userId, assetType, symbol } }
    })

    const holding = existing
      ? await tx.holding.update({
          where: { id: existing.id },
          data: {
            quantity: existing.quantity + quantity,
            // Weighted average cost across the old and new lots
            avgCost: (existing.avgCost * existing.quantity + total) / (existing.quantity + quantity)
          }
        })
      : await tx.holding.create({
          data: { userId, assetType, symbol, quantity, avgCost: price }
        })

    const transaction = await tx.transaction.create({
      data: { userId, assetType, symbol, side: 'BUY', quantity, price, total }
    })

    return { holding, transaction }
  })
}

const sellAsset = async (userId, assetType, symbol, quantity) => {
  assertValidQuantity(quantity)

  const price = await getCurrentPrice(assetType, symbol)
  if (price == null) throw new TradingError(`No current price available for ${symbol}`, 404)

  const total = price * quantity

  return prisma.$transaction(async (tx) => {
    // Atomic conditional decrement: a single UPDATE ... WHERE quantity >= X.
    // Two concurrent sells of the same holding can't both pass a stale
    // quantity check and oversell it into the negative.
    const debited = await tx.holding.updateMany({
      where: { userId, assetType, symbol, quantity: { gte: quantity } },
      data: { quantity: { decrement: quantity } }
    })

    if (debited.count === 0) {
      const existing = await tx.holding.findUnique({
        where: { userId_assetType_symbol: { userId, assetType, symbol } }
      })
      throw new TradingError(
        `Insufficient holdings: trying to sell ${quantity}, have ${existing?.quantity ?? 0}`,
        400
      )
    }

    let holding = await tx.holding.findUnique({
      where: { userId_assetType_symbol: { userId, assetType, symbol } }
    })

    if (holding.quantity === 0) {
      holding = await tx.holding.delete({ where: { id: holding.id } })
    }

    await tx.user.update({
      where: { id: userId },
      data: { cashBalance: { increment: total } }
    })

    const transaction = await tx.transaction.create({
      data: { userId, assetType, symbol, side: 'SELL', quantity, price, total }
    })

    return { holding, transaction }
  })
}

module.exports = { getCurrentPrice, buyAsset, sellAsset, TradingError }
