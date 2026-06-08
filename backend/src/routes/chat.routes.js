const express = require('express')
const router = express.Router()
const controller = require('../controllers/chat.controller')
const authMiddleware = require('../middleware/auth.middleware')
const validate = require('../middleware/validate.middleware')

router.post('/', authMiddleware, validate(['message']), controller.sendMessage)

module.exports = router
