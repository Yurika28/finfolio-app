const { getIO } = require('../config/socket')

// Called by priceSync.job after every Finnhub batch — pushes to all connected clients
const emitPriceUpdate = (prices) => {
  getIO().emit('prices:update', prices)
}

// Called by portfolio/budget logic (Phase 3) — pushes to a single user's socket room
const emitAlertToUser = (userId, message) => {
  getIO().to(`user:${userId}`).emit('alert', { message, timestamp: new Date() })
}

module.exports = { emitPriceUpdate, emitAlertToUser }
