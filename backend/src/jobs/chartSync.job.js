const cron = require('node-cron')
const { syncWeeklyChart } = require('../services/alphaVantage.service')
const { STOCK_SYMBOLS } = require('../config/symbols')

// 2am daily — rotates through symbols in batches of 4 to stay within 4 calls/day
// Day 0 → AAPL TSLA MSFT GOOGL, Day 1 → AMZN NVDA META NFLX, Day 2 → UBER AMD AAPL TSLA ...
cron.schedule('0 2 * * *', async () => {
  const batchSize = 4
  const day = Math.floor(Date.now() / 86400000) % Math.ceil(STOCK_SYMBOLS.length / batchSize)
  const batch = STOCK_SYMBOLS.slice(day * batchSize, day * batchSize + batchSize)
  console.log(`[ChartSync] Syncing ${batch.join(', ')}`)
  try {
    await syncWeeklyChart(batch)
    console.log('[ChartSync] Done')
  } catch (err) {
    console.error('[ChartSync] Failed:', err.message)
  }
})
