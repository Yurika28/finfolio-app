const jwt = require('jsonwebtoken')
const prisma = require('../config/prisma')

// Unlike auth.middleware, a missing/invalid token is not an error here —
// it just means the request continues as anonymous (req.user stays unset).
// Routes that allow both logged-in and anonymous access (e.g. chat with a
// free-message limit) use this instead of the hard-required authMiddleware.
const optionalAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return next()

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { tokenVersion: true }
    })
    if (user && user.tokenVersion === decoded.tv) {
      req.user = decoded
    }
  } catch {
    // Invalid/expired/revoked token on an optional route — proceed as
    // anonymous rather than blocking the request.
  }
  next()
}

module.exports = optionalAuth
