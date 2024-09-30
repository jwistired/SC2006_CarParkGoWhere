const passport = require('passport')
const express = require('express')
const router = express.Router()

//Load register page
router.get('/', (req, res) => {
    res.render('login.ejs')
});

//Validate registration
router.post('/',passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: 'login',
    failureFlash: true
}))

module.exports = router
