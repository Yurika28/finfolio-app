const prisma = require('../config/prisma')
const { buyAsset, sellAsset, getCurrentPrice, TradingError } = require('../services/trading.service')

// GET /api/portfolio/watchlist
const getWatchlist = async (req, res, next) => {
  try {
    const items = await prisma.watchlist.findMany({
      where: { userId: req.user.id },
      orderBy: { addedAt: 'desc' }
    })
    res.json(items)
  } catch (err) {
    next(err)
  }
}

// POST /api/portfolio/watchlist  { symbol }
const addToWatchlist = async (req, res, next) => {
  try {
    const symbol = req.body.symbol.toUpperCase()
    const item = await prisma.watchlist.upsert({
      where: { userId_symbol: { userId: req.user.id, symbol } },
      update: {},
      create: { userId: req.user.id, symbol }
    })
    res.status(201).json(item)
  } catch (err) {
    next(err)
  }
}

// DELETE /api/portfolio/watchlist/:symbol
const removeFromWatchlist = async (req, res, next) => {
  try {
    const symbol = req.params.symbol.toUpperCase()
    await prisma.watchlist.deleteMany({
      where: { userId: req.user.id, symbol }
    })
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}

// GET /api/portfolio/holdings — current positions with live market value
const getHoldings = async (req, res, next) => {
  try {
    const holdings = await prisma.holding.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' }
    })

    const withMarketValue = await Promise.all(
      holdings.map(async (h) => {
        const currentPrice = await getCurrentPrice(h.assetType, h.symbol)
        const marketValue = currentPrice != null ? currentPrice * h.quantity : null
        const costBasis = h.avgCost * h.quantity
        return {
          ...h,
          currentPrice,
          marketValue,
          gainLoss: marketValue != null ? marketValue - costBasis : null
        }
      })
    )

    res.json(withMarketValue)
  } catch (err) {
    next(err)
  }
}

// GET /api/portfolio/balance
const getBalance = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { cashBalance: true }
    })
    res.json({ cashBalance: user.cashBalance })
  } catch (err) {
    next(err)
  }
}

// GET /api/portfolio/transactions
const getTransactions = async (req, res, next) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    })
    res.json(transactions)
  } catch (err) {
    next(err)
  }
}

// POST /api/portfolio/buy  { assetType, symbol, quantity }
const buy = async (req, res, next) => {
  try {
    const { assetType, symbol, quantity } = req.body
    const result = await buyAsset(req.user.id, assetType.toUpperCase(), symbol.toUpperCase(), parseFloat(quantity))
    res.status(201).json(result)
  } catch (err) {
    if (err instanceof TradingError) return res.status(err.statusCode).json({ error: err.message })
    next(err)
  }
}

// POST /api/portfolio/sell  { assetType, symbol, quantity }
const sell = async (req, res, next) => {
  try {
    const { assetType, symbol, quantity } = req.body
    const result = await sellAsset(req.user.id, assetType.toUpperCase(), symbol.toUpperCase(), parseFloat(quantity))
    res.status(200).json(result)
  } catch (err) {
    if (err instanceof TradingError) return res.status(err.statusCode).json({ error: err.message })
    next(err)
  }
}

module.exports = {
  getWatchlist, addToWatchlist, removeFromWatchlist,
  getHoldings, getBalance, getTransactions, buy, sell
}
