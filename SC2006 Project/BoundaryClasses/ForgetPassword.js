const passport = require('passport')
const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer')
const otp = require('otp-generator')
const {getByEmail} = require('./Database.js')

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
    res.render('forgetPassword.ejs', { error: req.flash('error') })
})

router.post('/', (req, res, next) => {
    //if user does not exist in mongodb database
    console.log(req.body.email)
    if (getByEmail(req.body.email) == null) {
        return res.render('forgetPassword', { messages: { error: "No user with matching email" } });
    }
    console.log("Email found, sending OTP... ")
    generatedOTP = otp.generate(6,{digits: true, alphabets:false, upperCase:false, specialChars:false})
    console.log(generatedOTP)
    req.session.OTPGeneratedAt = Date.now()
    req.session.email = req.body.email
    req.session.generatedOTP = generatedOTP
    req.session.otpSent = true;
    // create message for sending
    const message = {
        from: "CarparkGoWhere <carparkgowhere@gmail.com>",
        to: req.body.email,
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
