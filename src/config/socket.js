const { Server } = require('socket.io')
let io

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: process.env.FRONTEND_URL, credentials: true }
  })
  io.on('connection', (socket) => {
    console.log('[Socket] Client connected:', socket.id)
    socket.on('disconnect', () => console.log('[Socket] Disconnected:', socket.id))
  })
  return io
}

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized — call initSocket first')
  return io
}

module.exports = { initSocket, getIO }
