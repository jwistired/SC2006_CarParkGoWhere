const passport = require('passport')
const express = require('express')
const router = express.Router()
const otp = require('otp-generator')
const bcrypt = require('bcrypt')

router.get('/', (req, res) => {
    res.render('resetPassword.ejs', { email: req.user.email })
})

router.post('/', async (req, res) => {
    var userOTP = req.body.OTP
    console.log(req.body.password)
    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    if(userOTP == req.session.generatedOTP){
        req.user.password = hashedPassword
        res.redirect('/login')
    } else {
        res.status(400).send("Invalid OTP")
        res.redirect('/resetPassword')
    }
})

module.exports = router
