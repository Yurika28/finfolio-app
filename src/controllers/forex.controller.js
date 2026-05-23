const prisma = require('../config/prisma')

// GET /api/forex — most recent rate for each tracked pair
const getAllForex = async (req, res, next) => {
  try {
    // distinct picks one row per pair; orderBy: date desc ensures it's the most recent
    const rates = await prisma.forexPrice.findMany({
      distinct: ['fromSymbol', 'toSymbol'],
      orderBy: { date: 'desc' }
    })
    res.json(rates)
  } catch (err) {
    next(err)
  }
}

// GET /api/forex/:pair — last 30 days for a specific pair
// Accepts "GBP-USD" or "GBP" (defaults to USD)
const getForexPair = async (req, res, next) => {
  try {
    const parts = req.params.pair.toUpperCase().split('-')
    const fromSymbol = parts[0]
    const toSymbol = parts[1] || 'USD'

    const rows = await prisma.forexPrice.findMany({
      where: { fromSymbol, toSymbol },
      orderBy: { date: 'desc' },
      take: 30
    })

    if (!rows.length) {
      return res.status(404).json({ error: `No data for ${fromSymbol}/${toSymbol} — forexSync.job.js may not have run yet` })
    }

    res.json(rows)
  } catch (err) {
    next(err)
  }
}

module.exports = { getAllForex, getForexPair }
