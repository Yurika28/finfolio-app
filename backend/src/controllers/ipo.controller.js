const finnhubService = require('../services/finnhub.service')

// GET /api/ipo/calendar — next 30 days of IPOs, 24hr cache
const getIpoCalendar = async (req, res, next) => {
  try {
    const data = await finnhubService.getIPO()
    res.json(data)
  } catch (err) {
    next(err)
  }
}

module.exports = { getIpoCalendar }
