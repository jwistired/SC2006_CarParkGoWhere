const express = require('express')
const router = express.Router()
const {checkAuthenticated, checkNotAuthenticated} = require('./Authenticator.js')

router.get('/', checkAuthenticated, (req, res) => {
    console.log('User object:', req.user)
    res.render('index.ejs', { name: req.user.name })
})

//get user name
router.get('/name', (req, res) => {
    res.send(req.user.name)
})

//get email
router.get('/email', (req, res) => {
    res.send(req.user.email)
})


router.delete('/logout', (req, res, next) => {
    req.logOut(function(err) {
        if (err) { 
            return next(err) 
        }
        res.redirect('/login')
    })
})

module.exports = router