const express = require('express')
const router = express.Router()
const controller = require('../controllers/chat.controller')
const optionalAuth = require('../middleware/optionalAuth.middleware')
const { anonChatLimit } = require('../middleware/anonChatLimit.middleware')
const validate = require('../middleware/validate.middleware')

// Logged-in users: unlimited. Anonymous: capped at FREE_MESSAGE_LIMIT messages
// (tracked by anonChatLimit), then must sign up/log in to continue.
router.post('/', optionalAuth, anonChatLimit, validate(['message']), controller.sendMessage)

module.exports = router
