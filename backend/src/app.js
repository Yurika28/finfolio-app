const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const { rateLimiter } = require('./middleware/rateLimiter.middleware')
const errorHandler = require('./middleware/errorHandler.middleware')

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))
app.use(rateLimiter)
app.use(express.json())

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
