const express = require('express')
const router = express.Router()
const {checkAuthenticated, checkNotAuthenticated} = require('./Authenticator.js')

router.get('/', checkAuthenticated, (req, res) => {
    console.log('User object:', req.user)
    res.render('index.ejs', { name: req.user.name })
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