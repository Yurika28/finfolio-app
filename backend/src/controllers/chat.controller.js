const prisma = require('../config/prisma')
const { chatWithContext } = require('../services/gemini.service')

// POST /api/chat — auth protected
const sendMessage = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body
    const userId = req.user.id

    const reply = await chatWithContext(message, history)

    await prisma.chatMessage.createMany({
      data: [
        { userId, role: 'user',      content: message },
        { userId, role: 'assistant', content: reply }
      ]
    })

    res.json({ reply })
  } catch (err) {
    next(err)
  }
}

module.exports = { sendMessage }
