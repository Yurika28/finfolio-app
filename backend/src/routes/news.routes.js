const express = require('express')
const router = express.Router()
const controller = require('../controllers/news.controller')

router.get('/',          controller.getMarketNews)
router.get('/sentiment', controller.getNewsSentiment)
router.get('/:symbol',   controller.getCompanyNews)

module.exports = router
