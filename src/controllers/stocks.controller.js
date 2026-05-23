const prisma = require('../config/prisma')
const finnhubService = require('../services/finnhub.service')

// GET /api/stocks — all cached prices, sorted by biggest movers first
const getAllStocks = async (req, res, next) => {
  try {
    const stocks = await prisma.stockPrice.findMany({
      orderBy: { dp: 'desc' }
    })
    res.json(stocks)
  } catch (err) {
    next(err)
  }
}

// GET /api/stocks/:symbol — single quote, hits Finnhub if 1hr cache is stale
const getStockQuote = async (req, res, next) => {
  try {
    const { symbol } = req.params
    const data = await finnhubService.getStockQuote(symbol.toUpperCase())
    res.json(data)
  } catch (err) {
    next(err)
  }
}

// GET /api/stocks/:symbol/chart?limit=52 — weekly OHLC bars from DB only
// NEVER triggers Alpha Vantage — chart data is populated exclusively by chartSync.job.js
const getStockChart = async (req, res, next) => {
  try {
    const { symbol } = req.params
    const limit = Math.min(parseInt(req.query.limit) || 52, 260) // cap at 5 years

    const rows = await prisma.weeklyChart.findMany({
      where: { symbol: symbol.toUpperCase() },
      orderBy: { date: 'asc' },
      take: limit,
      select: { date: true, open: true, high: true, low: true, close: true, adjustedClose: true, volume: true }
    })

    if (!rows.length) {
      return res.status(404).json({ error: `No chart data for ${symbol} — chartSync.job.js may not have run yet` })
    }

    // BigInt (volume) cannot be JSON-serialised natively — convert to Number
    res.json(rows.map((r) => ({ ...r, volume: r.volume !== null ? Number(r.volume) : null })))
  } catch (err) {
    next(err)
  }
}

// GET /api/stocks/:symbol/profile — company info, hits Finnhub if 24hr cache is stale
const getCompanyProfile = async (req, res, next) => {
  try {
    const { symbol } = req.params
    const data = await finnhubService.getCompanyProfile(symbol.toUpperCase())
    res.json(data)
  } catch (err) {
    next(err)
  }
}

module.exports = { getAllStocks, getStockQuote, getStockChart, getCompanyProfile }
