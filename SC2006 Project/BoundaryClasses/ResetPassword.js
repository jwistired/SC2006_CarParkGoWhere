const passport = require('passport');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const otpExpiryTime = 5 * 60 * 1000; // Time for OTP expiry, adjust first parameter
const { checkAuthenticated, checkNotAuthenticated, terminateAuthentication} = require('./Authenticator.js');

router.get('/', checkAuthenticated, (req, res) => {
    res.render('resetPassword.ejs', { email: req.user.email });
});

router.get('/successResetPassword', checkNotAuthenticated, (req, res) => {
    res.render('successResetPassword.ejs');
});

router.post('/', async (req, res, next) => {
    var userOTP = req.body.OTP;
    var otpGeneratedAt = req.session.OTPGeneratedAt;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
    // Check if OTP is expired
    var isExpired = (Date.now() - otpGeneratedAt) > otpExpiryTime;
    console.log(isExpired, otpExpiryTime, otpGeneratedAt)
    if (isExpired) {
        terminateAuthentication(req)
        req.flash('error', 'OTP has expired')
        return res.redirect('/forgetPassword')
    }
    
    // Check if OTP is correct
    if (userOTP == req.session.generatedOTP) {
        req.user.password = hashedPassword
        console.log('hashing password')
        req.logOut(function (err) {
            if (err) {
                console.log('error')
                return next(err);  // Handle error if logout fails
            }
            console.log('redirect success')
            return res.redirect('/resetPassword/successResetPassword')  // Redirect after logout
        });
    } else {
        req.flash('error', 'OTP incorrect');
        return res.redirect('/resetPassword')  // Refresh page if OTP is incorrect
    }
});

module.exports = router;
