const express = require('express')
const router = express.Router()
const testController = require('../app/controllers/TestController')
const multer = require("multer")

const upload = multer()


router.post('/category', testController.category)

router.post('/create', testController.create)

router.post('/convert-file-to-text', upload.single("file"), testController.convertFileToText)

router.patch('/update', testController.update)

router.post('/response', testController.response)

router.patch('/answer', testController.answer)

router.post('/delete', testController.delete)

router.post('/get', testController.test)





module.exports = router