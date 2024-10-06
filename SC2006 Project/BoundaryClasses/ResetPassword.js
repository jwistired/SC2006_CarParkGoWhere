const passport = require('passport')
const express = require('express')
const router = express.Router()
const otp = require('otp-generator')
const bcrypt = require('bcrypt')

router.get('/', (req, res) => {
    res.render('resetPassword.ejs', { email: req.user.email })
})

router.post('/', async (req, res) => {
    console.log("Resetpassword otp: " + req.session.generatedOTP)
    var userOTP = req.body.OTP
    console.log("Entered otp: " + userOTP)
    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10)

    if(userOTP == req.session.generatedOTP){
        req.user.password = hashedPassword
        console.log(user)
    } else {
        res.status(400).send("Invalid OTP")
        res.redirect('/resetPassword')
    }
})

module.exports = router
