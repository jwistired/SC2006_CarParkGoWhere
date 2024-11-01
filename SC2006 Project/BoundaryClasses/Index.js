const express = require('express')
const router = express.Router()
const {checkAuthenticated, checkNotAuthenticated} = require('./Authenticator.js')
const database = require('./Database.js')

router.get('/', checkAuthenticated, (req, res) => {
    console.log('User object:', req.user)
    history = database.getHistory(req.user.email);
    database.updateHistory(newHistory.email, newHistory)
    res.render('index.ejs', { name: req.user.name, email: req.user.email, history: history })
})

//get user name
router.get('/name', (req, res) => {
    const userName = req.user.name;
    res.render('index.ejs', { name: userName });
})

//get email maybe use when database is implemented
// router.get('/email', (req, res) => {
//     if (req.user && req.user.email) {
//         const userEmail = req.user.email;
//         res.render('index.ejs', { email: userEmail });
//     } else {
//         res.status(400).send('Email not found');
//     }
// })

router.delete('/logout', (req, res, next) => {
    req.logOut(function(err) {
        if (err) { 
            return next(err) 
        }
        res.redirect('/login')
    })
})

module.exports = router