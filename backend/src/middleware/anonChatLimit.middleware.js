const crypto = require('crypto')
const prisma = require('../config/prisma')

const COOKIE_NAME = 'finfolio_anon_id'
const COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
const FREE_MESSAGE_LIMIT = 3

// Gates POST /api/chat for anonymous (not-logged-in) users to FREE_MESSAGE_LIMIT
// messages total, tracked by an httpOnly cookie + DB row (not in-memory, so it
// survives restarts and works across multiple backend instances).
// Logged-in users (req.user set by optionalAuth) are unlimited and skip this.
const anonChatLimit = async (req, res, next) => {
  if (req.user) return next()

  let sessionId = req.cookies?.[COOKIE_NAME]
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    res.cookie(COOKIE_NAME, sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: COOKIE_MAX_AGE_MS
    })
  }

  await prisma.anonymousChatSession.upsert({
    where: { id: sessionId },
    update: {},
    create: { id: sessionId }
  })

  // Claim a slot atomically (increment only if still under the limit) before
  // calling Gemini — checking messageCount and incrementing it as two
  // separate steps lets concurrent requests from the same session all pass
  // the check before either one increments, going over the free limit.
  const claimed = await prisma.$queryRaw`
    UPDATE anonymous_chat_sessions
    SET "messageCount" = "messageCount" + 1, "updatedAt" = NOW()
    WHERE id = ${sessionId} AND "messageCount" < ${FREE_MESSAGE_LIMIT}
    RETURNING "messageCount"
  `

  if (claimed.length === 0) {
    return res.status(403).json({
      error: 'Free message limit reached. Sign up or log in to keep chatting.',
      code: 'ANON_LIMIT_REACHED'
    })
  }

  req.anonSessionId = sessionId
  req.anonMessageCount = claimed[0].messageCount
  next()
}

module.exports = { anonChatLimit, FREE_MESSAGE_LIMIT }
