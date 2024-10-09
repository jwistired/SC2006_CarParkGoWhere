const passport = require('passport')
const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const {checkAuthenticated, checkNotAuthenticated} = require('./Authenticator.js')


router.get('/',checkAuthenticated ,(req, res) => {
    res.render('resetPassword.ejs', { email: req.user.email })
})

router.get('/successResetPassword', checkNotAuthenticated, (req,res) => {
    res.render('successResetPassword.ejs')
})

router.post('/', async (req, res) => {
    var userOTP = req.body.OTP
    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    if(userOTP == req.session.generatedOTP){
        req.user.password = hashedPassword
        req.logOut(function(err) {
            if (err) { 
                return next(err) 
            }
            res.redirect('/resetPassword/successResetPassword')
        })
    } else {
        req.flash('error', 'OTP incorrect')
        res.redirect('/resetPassword')
    }
})
//logout and deauthenticate user once password has been reset

module.exports = router
