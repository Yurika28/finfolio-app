const prisma = require('../config/prisma')
const { chatWithContext } = require('../services/gemini.service')
const { FREE_MESSAGE_LIMIT } = require('../middleware/anonChatLimit.middleware')

// POST /api/chat — logged-in users are unlimited; anonymous users are capped
// upstream by anonChatLimit, which already claimed (incremented) this
// request's slot against the limit before we get here.
const sendMessage = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body
    let reply
    try {
      reply = await chatWithContext(message, history)
    } catch (err) {
      // Gemini failed after anonChatLimit already spent the user's slot —
      // give it back so a provider error doesn't cost them a free message.
      if (!req.user && req.anonSessionId) {
        await prisma.anonymousChatSession.update({
          where: { id: req.anonSessionId },
          data: { messageCount: { decrement: 1 } }
        })
      }
      throw err
    }

    if (req.user) {
      await prisma.chatMessage.createMany({
        data: [
          { userId: req.user.id, role: 'user',      content: message },
          { userId: req.user.id, role: 'assistant', content: reply }
        ]
      })
      return res.json({ reply })
    }

    res.json({ reply, remaining: Math.max(0, FREE_MESSAGE_LIMIT - req.anonMessageCount) })
  } catch (err) {
    next(err)
  }
}

module.exports = { sendMessage }
