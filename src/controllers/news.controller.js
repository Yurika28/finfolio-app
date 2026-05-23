const finnhubService = require('../services/finnhub.service')

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

module.exports = { getMarketNews, getCompanyNews }
