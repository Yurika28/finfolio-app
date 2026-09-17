const jwt = require('jsonwebtoken')
const prisma = require('../config/prisma')

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token provided' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Reject tokens issued before the user's last logout/revocation — lets
    // us kill a 7-day token early instead of waiting out its expiry.
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { tokenVersion: true }
    })
    if (!user || user.tokenVersion !== decoded.tv) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    req.user = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

module.exports = authMiddleware
