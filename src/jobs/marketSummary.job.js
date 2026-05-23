const cron = require('node-cron')
const { generateMarketSummary } = require('../services/gemini.service')

// 7am daily — Gemini generates daily summary → caches in DB
cron.schedule('0 7 * * *', async () => {
  console.log('[MarketSummary] Generating daily summary...')
  try {
    await generateMarketSummary()
    console.log('[MarketSummary] Done')
  } catch (err) {
    console.error('[MarketSummary] Failed:', err.message)
  }
})
