const cron = require('node-cron')
const { generateMarketSummary } = require('../services/gemini.service')
const { withJobLock } = require('../utils/jobLock')

// 7am daily — Gemini generates daily summary → caches in DB
cron.schedule('0 7 * * *', withJobLock('MarketSummary', 5 * 60 * 1000, async () => {
  console.log('[MarketSummary] Generating daily summary...')
  try {
    await generateMarketSummary()
    console.log('[MarketSummary] Done')
  } catch (err) {
    console.error('[MarketSummary] Failed:', err.message)
  }
}))
