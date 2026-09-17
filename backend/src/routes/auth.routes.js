const express = require('express')
const router = express.Router()
const controller = require('../controllers/auth.controller')
const authMiddleware = require('../middleware/auth.middleware')
const validate = require('../middleware/validate.middleware')
const { authRateLimiter } = require('../middleware/rateLimiter.middleware')

router.post('/register', authRateLimiter, validate(['name', 'email', 'password']), controller.register)
router.post('/login',    authRateLimiter, validate(['email', 'password']),          controller.login)
router.get('/me',        authMiddleware,                            controller.getMe)
router.post('/logout',   authMiddleware,                            controller.logout)

module.exports = router
