const passport = require('passport')
const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer')
const otp = require('otp-generator')
var generatedOTP

var message
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'carparkgowhere@gmail.com', 
        pass: process.env.APP_PASSWORD
    }
})

router.get('/', (req, res) => {
    res.render('forgetPasswordTest.ejs', { error: req.flash('error') })
})

router.post('/', (req, res, next) => {

    passport.authenticate('local-forget-password', {
        failureRedirect: '/forgetPassword',
        failureFlash: true
    })(req, res, next);
    }, (req, res) => {
    console.log("Authentication successful, sending OTP...");
    generatedOTP = otp.generate(6,{digits:true, alphabets:false, upperCase:false, specialChars:false})
    console.log("generated otp:" + generatedOTP)
    req.session.generatedOTP = generatedOTP;
    console.log("session otp:" + req.session.generatedOTP)

    const message = {
        from: "CarparkGoWhere <carparkgowhere@gmail.com>",
        to: req.user.email,  // Use authenticated user's email
        subject: "CarparkGoWhere reset password",
        text: `Your OTP is: ${generatedOTP}`
    };

    transporter.sendMail(message, (error, info) => {
        if (error) {
            console.error("Error sending OTP:", error);
            return res.status(500).send("Error sending OTP");
        }
        console.log('Email sent: ' + info.response);
        res.redirect('/resetPassword');
    });
});

module.exports = router