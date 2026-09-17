require('dotenv').config()
const { createServer } = require('http')
const { initSocket } = require('./src/config/socket')
const app = require('./src/app')
const prisma = require('./src/config/prisma')

const PORT = process.env.PORT || 3001
const httpServer = createServer(app)
initSocket(httpServer)

// A cron job or any code outside a request/response cycle has no errorHandler to catch it —
// without this, one uncaught error silently kills the process (and all scheduled jobs with it).
process.on('unhandledRejection', (reason) => {
  console.error('[Fatal] Unhandled promise rejection:', reason)
  process.exit(1)
})
process.on('uncaughtException', (err) => {
  console.error('[Fatal] Uncaught exception:', err)
  process.exit(1)
})

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

// Platform restarts/redeploys send SIGTERM — stop accepting new connections,
// let in-flight requests finish, then close the DB pool cleanly instead of
// having them cut off mid-request/mid-transaction.
const shutdown = (signal) => {
  console.log(`[Server] ${signal} received, shutting down gracefully...`)
  httpServer.close(async () => {
    await prisma.$disconnect()
    console.log('[Server] Closed out remaining connections')
    process.exit(0)
  })
  setTimeout(() => {
    console.error('[Server] Forced shutdown after timeout')
    process.exit(1)
  }, 10000).unref()
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
