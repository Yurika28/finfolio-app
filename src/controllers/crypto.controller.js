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

module.exports = { getAllCrypto, getCryptoRate }
