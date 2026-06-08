const express = require('express')
const router = express.Router()
const controller = require('../controllers/auth.controller')
const authMiddleware = require('../middleware/auth.middleware')
const validate = require('../middleware/validate.middleware')

router.post('/register', validate(['name', 'email', 'password']), controller.register)
router.post('/login',    validate(['email', 'password']),          controller.login)
router.get('/me',        authMiddleware,                            controller.getMe)

module.exports = router
