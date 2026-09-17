const prisma = require('../config/prisma')

// GET /api/crypto — all cached crypto rates ordered alphabetically
const getAllCrypto = async (req, res, next) => {
  try {
    const rates = await prisma.cryptoCurrencyRate.findMany({
      orderBy: { fromSymbol: 'asc' }
    })
    res.json(rates)
  } catch (err) {
    next(err)
  }
}

// GET /api/crypto/:symbol — single rate (USD market only)
// Returns 404 with a clear message if cryptoSync.job.js has not run yet
const getCryptoRate = async (req, res, next) => {
  try {
    const { symbol } = req.params
    const rate = await prisma.cryptoCurrencyRate.findFirst({
      where: { fromSymbol: symbol.toUpperCase(), toSymbol: 'USD' }
    })
    if (!rate) {
      return res.status(404).json({ error: `No data for ${symbol.toUpperCase()}/USD — cryptoSync.job.js may not have run yet` })
    }
    res.json(rate)
  } catch (err) {
    next(err)
  }
}

// GET /api/crypto/:symbol/chart?limit=365 — daily OHLC bars from DB only
// NEVER triggers Alpha Vantage — chart data is populated exclusively by cryptoSync.job.js
const getCryptoChart = async (req, res, next) => {
  try {
    const { symbol } = req.params
    const limit = Math.min(parseInt(req.query.limit) || 365, 1825) // cap at 5 years

    const rows = await prisma.cryptoChart.findMany({
      where: { symbol: symbol.toUpperCase() },
      orderBy: { date: 'asc' },
      take: limit,
      select: { date: true, open: true, high: true, low: true, close: true, volume: true }
    })

    if (!rows.length) {
      return res.status(404).json({ error: `No chart data for ${symbol} — cryptoSync.job.js may not have run yet` })
    }

    res.json(rows)
  } catch (err) {
    next(err)
  }
}

module.exports = { getAllCrypto, getCryptoRate, getCryptoChart }
