const express = require('express')
const router = express.Router()
const controller = require('../controllers/insights.controller')
const authMiddleware = require('../middleware/auth.middleware')

router.get('/market',         controller.getMarketSummary)
router.post('/stock/:symbol', authMiddleware, controller.getStockAnalysis)

module.exports = router
