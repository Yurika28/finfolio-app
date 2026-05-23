const cron = require('node-cron')
const { getMarketNews } = require('../services/finnhub.service')
const { getNewsSentiment } = require('../services/alphaVantage.service')

// Every 4 hours — Finnhub is unlimited, pre-warms the 6hr cache so user requests are instant
cron.schedule('0 */4 * * *', async () => {
  console.log('[NewsSync] Refreshing market news...')
  try {
    await getMarketNews()
    console.log('[NewsSync] Market news updated')
  } catch (err) {
    console.error('[NewsSync] Market news failed:', err.message)
  }
})

// 6am daily — Alpha Vantage sentiment (counts as 2 of our 22 daily calls)
// Articles are returned for Gemini context — not persisted to DB
cron.schedule('0 6 * * *', async () => {
  console.log('[NewsSync] Fetching AV sentiment...')
  try {
    const articles = await getNewsSentiment()
    console.log(`[NewsSync] Sentiment fetched: ${articles.length} articles`)
  } catch (err) {
    console.error('[NewsSync] Sentiment failed:', err.message)
  }
})
