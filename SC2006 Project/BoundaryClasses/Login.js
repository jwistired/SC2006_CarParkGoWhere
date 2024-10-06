const passport = require('passport')
const express = require('express')
const router = express.Router()

//Load register page
router.get('/', (req, res) => {
    res.render('login.ejs')
});

//Validate registration
router.post('/',passport.authenticate('local-login', {
    //successRedirect: '/',
    failureRedirect: 'login',
    failureFlash: true
}), (req,res) => {
    console.log(req.body) // Log the body to see form data
    res.redirect('/')
})

module.exports = router
