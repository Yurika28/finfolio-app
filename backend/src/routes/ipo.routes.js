const express = require('express')
const router = express.Router()
const controller = require('../controllers/ipo.controller')

router.get('/calendar', controller.getIpoCalendar)

module.exports = router
