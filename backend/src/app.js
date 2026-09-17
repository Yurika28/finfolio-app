const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { rateLimiter } = require('./middleware/rateLimiter.middleware')
const errorHandler = require('./middleware/errorHandler.middleware')

const app = express()

// Railway (and most PaaS) terminate TLS at a reverse proxy in front of us —
// without this, req.ip resolves to the proxy's address for every client,
// which collapses express-rate-limit's per-IP buckets into one shared bucket.
app.set('trust proxy', 1)

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use(helmet())
app.use(cors({
  origin: (origin, callback) => {
    // No Origin header (server-to-server, curl, health checks) — allow.
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
app.use(rateLimiter)
app.use(express.json())
app.use(cookieParser())

// Railway health check
app.get('/health', (req, res) =>
  res.json({ status: 'ok', env: process.env.NODE_ENV, ts: new Date().toISOString() })
)

app.use('/api/auth',      require('./routes/auth.routes'))
app.use('/api/stocks',    require('./routes/stocks.routes'))
app.use('/api/crypto',    require('./routes/crypto.routes'))
app.use('/api/forex',     require('./routes/forex.routes'))
app.use('/api/news',      require('./routes/news.routes'))
app.use('/api/ipo',       require('./routes/ipo.routes'))
app.use('/api/insights',  require('./routes/insights.routes'))
app.use('/api/chat',      require('./routes/chat.routes'))
app.use('/api/portfolio', require('./routes/portfolio.routes'))

app.use(errorHandler) // ALWAYS last — never move this

module.exports = app
