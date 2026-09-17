const prisma = require('../config/prisma')
const { generateMarketSummary, analyzeStock, UnsafeOutputError } = require('../services/gemini.service')

// GET /api/insights/market — public
const getMarketSummary = async (req, res, next) => {
  try {
    const cached = await prisma.insight.findFirst({ where: { type: 'daily_summary' } })
    if (cached) return res.json({ content: cached.content, generatedAt: cached.generatedAt })

    // No cached summary yet — generate on demand (first call of the day)
    const content = await generateMarketSummary()
    res.json({ content, generatedAt: new Date() })
  } catch (err) {
    // Gemini quota exhausted, or output failed the safety check — serve stale cache rather than crashing
    if (err instanceof UnsafeOutputError || err.message?.includes('429') || err.message?.includes('quota')) {
      const stale = await prisma.insight.findFirst({ where: { type: 'daily_summary' } }).catch(() => null)
      if (stale) return res.json({ content: stale.content, generatedAt: stale.generatedAt, stale: true })
      return res.status(503).json({ error: 'Market summary temporarily unavailable. Try again later.' })
    }
    next(err)
  }
}

// POST /api/insights/stock/:symbol — auth protected
const getStockAnalysis = async (req, res, next) => {
  const symbol = req.params.symbol.toUpperCase()
  try {
    const content = await analyzeStock(symbol)
    res.json({ symbol, content })
  } catch (err) {
    if (err instanceof UnsafeOutputError) {
      const stale = await prisma.insight.findFirst({ where: { type: `stock:${symbol}` } }).catch(() => null)
      if (stale) return res.json({ symbol, content: stale.content, stale: true })
      return res.status(503).json({ error: 'Analysis temporarily unavailable. Try again later.' })
    }
    next(err)
  }
}

module.exports = { getMarketSummary, getStockAnalysis }
