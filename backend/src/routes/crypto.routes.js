const express = require('express')
const router = express.Router()
const controller = require('../controllers/crypto.controller')

router.get('/',        controller.getAllCrypto)
router.get('/:symbol', controller.getCryptoRate)

module.exports = router
