const express = require('express')
const router = express.Router()
const authController = require('../app/controllers/AuthController')



router.post('/login',authController.login)

router.post('/forgot-password',authController.forgotPassword)

router.get('/reset/:token',authController.resetPassword)

router.post('/reset/:token',authController.resetPasswordPost)

router.get('/logout',authController.logout)

router.post('/signup',authController.signup)

router.post('/change-info',authController.changeInfo)


router.get('/',authController.auth)


module.exports = router