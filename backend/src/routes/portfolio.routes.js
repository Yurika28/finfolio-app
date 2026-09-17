const express = require('express')
const router = express.Router()
const controller = require('../controllers/portfolio.controller')
const authMiddleware = require('../middleware/auth.middleware')
const validate = require('../middleware/validate.middleware')

router.use(authMiddleware)

router.get('/watchlist',            controller.getWatchlist)
router.post('/watchlist',           validate(['symbol']), controller.addToWatchlist)
router.delete('/watchlist/:symbol', controller.removeFromWatchlist)

router.get('/holdings',             controller.getHoldings)
router.get('/balance',              controller.getBalance)
router.get('/transactions',         controller.getTransactions)
router.post('/buy',                 validate(['assetType', 'symbol', 'quantity']), controller.buy)
router.post('/sell',                validate(['assetType', 'symbol', 'quantity']), controller.sell)

module.exports = router
