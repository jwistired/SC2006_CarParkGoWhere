const passport = require('passport')
const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer')
const otp = require('otp-generator')
var generatedOTP
// Standardise email for onemaps and OTP sending
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.ONEMAP_EMAIL, 
        pass: process.env.ONEMAP_EMAIL_APPPASSWORD
    }
})

router.get('/', (req, res) => {
    res.render('forgetPasswordTest.ejs', { error: req.flash('error') })
})

router.post('/', (req, res, next) => {
    //check if email exists within our users array
    passport.authenticate('local-forget-password', {
        failureRedirect: '/forgetPassword',
        failureFlash: true
    })(req, res, next)
    }, (req, res) => {
    console.log("Authentication successful, sending OTP...");
    generatedOTP = otp.generate(6,{digits: true, alphabets:false, upperCase:false, specialChars:false})
    req.session.OTPGeneratedAt = Date.now()
    req.session.email = req.body.email
    req.session.generatedOTP = generatedOTP
    // create message for sending
    const message = {
        from: "CarparkGoWhere <carparkgowhere@gmail.com>",
        to: req.user.email,
        subject: "CarparkGoWhere reset password",
        text: `Your OTP is: ${generatedOTP}. Token will expire in 5 minute`
    };
    //send mail
    transporter.sendMail(message, (error, info) => {
        if (error) {
            console.error("Error sending OTP:", error)
            return res.status(500).send("Error sending OTP")
        }
        console.log('Email sent: ' + info.response)
        //console.log(generatedOTP)
        res.redirect('/resetPassword')
    })
})

module.exports = router