const express = require('express')
const router = express.Router()
const controller = require('../controllers/forex.controller')

router.get('/',      controller.getAllForex)
router.get('/:pair', controller.getForexPair)

module.exports = router
