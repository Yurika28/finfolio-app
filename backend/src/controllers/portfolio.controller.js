const prisma = require('../config/prisma')

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

// GET /api/portfolio/holdings
const getHoldings = async (req, res, next) => {
  try {
    const holdings = await prisma.holding.findMany({
      where: { userId: req.user.id },
      orderBy: { buyDate: 'desc' }
    })
    res.json(holdings)
  } catch (err) {
    next(err)
  }
}

// POST /api/portfolio/holdings  { symbol, shares, buyPrice, buyDate }
const addHolding = async (req, res, next) => {
  try {
    const { symbol, shares, buyPrice, buyDate } = req.body
    const holding = await prisma.holding.create({
      data: {
        userId:   req.user.id,
        symbol:   symbol.toUpperCase(),
        shares:   parseFloat(shares),
        buyPrice: parseFloat(buyPrice),
        buyDate:  new Date(buyDate)
      }
    })
    res.status(201).json(holding)
  } catch (err) {
    next(err)
  }
}

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist, getHoldings, addHolding }
