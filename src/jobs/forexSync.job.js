const cron = require('node-cron')
const { syncForexRates } = require('../services/alphaVantage.service')
const { FOREX_PAIRS } = require('../config/symbols')

// 9am + 9pm — 2 pairs × 2 runs = 4 Alpha Vantage calls/day
cron.schedule('0 9,21 * * *', async () => {
  console.log('[ForexSync] Running...')
  try {
    await syncForexRates(FOREX_PAIRS)
    console.log('[ForexSync] Done')
  } catch (err) {
    console.error('[ForexSync] Failed:', err.message)
  }
})
