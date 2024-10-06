const passport = require('passport')
const express = require('express')
const router = express.Router()
const otp = require('otp-generator')
const bcrypt = require('bcrypt')

router.get('/', (req, res) => {
    otp.generate(6,{digits:true, alphabets:false, upperCase:false, specialChars:false})
    res.render('resetPassword.ejs')
})

router.post('/', async (req, res) => {
    const userOTP = req.body.otp
    const hashedPassword = await bcrypt(req.body.newPassword, 10)

    if(userOTP === req.session.generatedOTP){
        req.user.password = hashedPassword
    } else {
        res.status(400).send("Invalid OTP")
        res.redirect('/resetPassword')
    }
})

module.exports = router
