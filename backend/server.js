require('dotenv').config()
const { createServer } = require('http')
const { initSocket } = require('./src/config/socket')
const app = require('./src/app')

const PORT = process.env.PORT || 3001
const httpServer = createServer(app)
initSocket(httpServer)

// Register all cron jobs after server starts
require('./src/jobs/priceSync.job')
require('./src/jobs/cryptoSync.job')
require('./src/jobs/forexSync.job')
require('./src/jobs/chartSync.job')
require('./src/jobs/newsSync.job')
require('./src/jobs/marketSummary.job')

httpServer.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT} (${process.env.NODE_ENV})`)
})
