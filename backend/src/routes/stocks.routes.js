const express = require('express')
const router = express.Router()
const controller = require('../controllers/stocks.controller')

router.get('/',                controller.getAllStocks)
router.get('/:symbol',         controller.getStockQuote)
router.get('/:symbol/chart',   controller.getStockChart)
router.get('/:symbol/profile', controller.getCompanyProfile)

module.exports = router
