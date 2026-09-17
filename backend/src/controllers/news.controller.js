const finnhubService = require('../services/finnhub.service')
const prisma = require('../config/prisma')

// GET /api/news — general market news, 6hr cache
const getMarketNews = async (req, res, next) => {
  try {
    const data = await finnhubService.getMarketNews()
    res.json(data)
  } catch (err) {
    next(err)
  }
}

// GET /api/news/:symbol — company-specific news, 6hr cache
const getCompanyNews = async (req, res, next) => {
  try {
    const { symbol } = req.params
    const data = await finnhubService.getCompanyNews(symbol.toUpperCase())
    res.json(data)
  } catch (err) {
    next(err)
  }
}

// GET /api/news/sentiment — latest AV sentiment rows, most recent first
// Optional ?symbol=CRYPTO:BTC for an exact match, or ?symbolPrefix=CRYPTO: to match a family of tickers
const getNewsSentiment = async (req, res, next) => {
  try {
    const { symbol, symbolPrefix } = req.query
    const where = symbol
      ? { symbol }
      : symbolPrefix
        ? { symbol: { startsWith: symbolPrefix } }
        : undefined

    const data = await prisma.newsSentiment.findMany({
      where,
      orderBy: { fetchedAt: 'desc' },
      take: 50,
    })
    res.json(data)
  } catch (err) {
    next(err)
  }
}

module.exports = { getMarketNews, getCompanyNews, getNewsSentiment }
