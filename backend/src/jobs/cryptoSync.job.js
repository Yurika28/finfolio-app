const cron = require('node-cron')
const { syncCryptoPrices } = require('../services/alphaVantage.service')
const { CRYPTO_SYMBOLS } = require('../config/symbols')

// 8am + 8pm — 6 symbols × 2 runs = 12 Alpha Vantage calls/day
cron.schedule('0 8,20 * * *', async () => {
  console.log('[CryptoSync] Running...')
  try {
    await syncCryptoPrices(CRYPTO_SYMBOLS)
    console.log('[CryptoSync] Done')
  } catch (err) {
    console.error('[CryptoSync] Failed:', err.message)
  }
})
