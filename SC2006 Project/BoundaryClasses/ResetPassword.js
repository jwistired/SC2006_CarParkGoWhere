const passport = require('passport');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { getByEmail } = require('./Database')
const otpExpiryTime = 5 * 60 * 1000; // Time for OTP expiry, adjust first parameter
const { checkAuthenticated, checkNotAuthenticated, terminateAuthentication} = require('./Authenticator.js');
const passwordCriteria = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/;


router.get('/', checkAuthenticated, (req, res) => {
    res.render('resetPassword.ejs', { email: req.user.email });
});

router.get('/successResetPassword', checkNotAuthenticated, (req, res) => {
    res.render('successResetPassword.ejs');
});

router.post('/', async (req, res, next) => {
    var userOTP = req.body.OTP;
    var otpGeneratedAt = req.session.OTPGeneratedAt;
    var confirmPassword = req.body.confirmPassword;
    var password = req.body.password
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
        // Password validation
        if (!passwordCriteria.test(password)) {
            req.flash('error', "Password must be between 8 and 20 characters, include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character." );
            return res.redirect('/resetPassword')
        }
        // Check that passwords match
        if (password !== confirmPassword) {
            req.flash('error', "Passwords do not match. Please make sure both password fields are identical.")
            return res.redirect('/resetPassword')
        }
        //console.log(req.session.email)
        // inititate user by checking email 
        const user = await getByEmail(req.session.email)
        //console.log(user)
        user.password = hashedPassword
        user.save() // save updated password in mongoDB
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
