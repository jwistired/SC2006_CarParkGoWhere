const passport = require('passport')
const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer')
const otp = require('otp-generator')
const generatedOTP = otp.generate(6,{digits:true, alphabets:false, upperCase:false, specialChars:false})
var message
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'carparkgowhere@gmail.com', 
        pass: '${APP_PASSWORD}'
    }
})

router.get('/', (req, res) => {
    res.render('forgetPasswordTest.ejs')
})

router.post('/', passport.authenticate('local-forget-password', {
    sucessRedirect: '/resetPassword',
    failureRedirect: '/forgetPassword',
    failureFlash: true
    }), 
    (req, res) => {
        req.session.generatedOTP = generatedOTP
        message = {
            from: "CarparkGoWhere <carparkgowhere@gmail.com>",
            to: `${req.body.email}`,
            subject: "CarparkGoWhere reset password",
            text: `Your OTP is: ${generatedOTP}`
        }
        transporter.sendMail(message, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(500).send("Error sending OTP");
            }
            console.log('Email sent: ' + info.response)
        })
    }
)

module.exports = router