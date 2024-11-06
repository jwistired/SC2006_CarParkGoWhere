const passport = require('passport');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { getByEmail } = require('./Database');
const { checkNotAuthenticated } = require('./Authenticator.js');
const passwordCriteria = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/;

// Middleware to check if OTP was sent and has not expired
function checkOtpSent(req, res, next) {
    const OTP_VALIDITY_PERIOD = 0.1 * 60 * 1000; // 5 minutes in milliseconds
    const otpGeneratedAt = req.session.OTPGeneratedAt;

    if (req.session.otpSent && otpGeneratedAt) {
        const currentTime = Date.now();

        // Check if the OTP has expired
        if (currentTime - otpGeneratedAt <= OTP_VALIDITY_PERIOD) {
            return next(); // Allow access if OTP is still valid
        } else {
            // OTP has expired, reset otpSent flag and clear OTP session data
            req.session.otpSent = false;
            req.session.generatedOTP = null;
            req.session.OTPGeneratedAt = null;
            req.flash('error', 'Your OTP has expired. Please request a new one.');
            return res.redirect('/forgetPassword'); // Redirect to request new OTP
        }
    }

    res.redirect('/forgetPassword'); // Redirect if OTP was not sent
}

// Route for resetting password
router.get('/', checkOtpSent, (req, res) => {
    res.render('resetPassword.ejs', { email: req.session.email });
});

router.get('/successResetPassword', checkNotAuthenticated, (req, res) => {
    res.render('successResetPassword.ejs');
});

router.post('/', async (req, res, next) => {
    var userOTP = req.body.OTP;
    var confirmPassword = req.body.confirmPassword;
    var password = req.body.password;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    
    // Check if OTP is correct
    if (userOTP === req.session.generatedOTP) {
        // Password validation
        if (!passwordCriteria.test(password)) {
            req.flash('error', "Password must be between 8 and 20 characters, include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.");
            return res.redirect('/resetPassword');
        }
        
        // Check that passwords match
        if (password !== confirmPassword) {
            req.flash('error', "Passwords do not match. Please make sure both password fields are identical.");
            return res.redirect('/resetPassword');
        }

        // Initiate user by checking email 
        const user = await getByEmail(req.session.email);
        user.password = hashedPassword;
        await user.save(); // Save updated password in MongoDB
        console.log('Password hashed and saved');

        // Clear session data and redirect to success page
        req.logOut(function (err) {
            if (err) {
                console.log('Logout error:', err);
                return next(err);  // Handle error if logout fails
            }
            console.log('Redirecting to success page');
            return res.redirect('/resetPassword/successResetPassword');  // Redirect after logout
        });
    } else {
        req.flash('error', 'OTP incorrect');
        return res.redirect('/resetPassword');  // Refresh page if OTP is incorrect
    }
});

module.exports = router;
