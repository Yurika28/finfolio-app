const cron = require('node-cron')
const { syncAllPrices } = require('../services/finnhub.service')
const { emitPriceUpdate } = require('../services/socket.service')
const { STOCK_SYMBOLS } = require('../config/symbols')

// Every hour — Finnhub is unlimited free, no budget concern
cron.schedule('0 * * * *', async () => {
  console.log('[PriceSync] Running...')
  try {
    const results = await syncAllPrices(STOCK_SYMBOLS)
    const ok = results.filter((r) => r.status === 'ok').map((r) => r.data)
    emitPriceUpdate(ok)
    console.log(`[PriceSync] ${ok.length}/${STOCK_SYMBOLS.length} updated`)
  } catch (err) {
    console.error('[PriceSync] Failed:', err.message)
  }
})
