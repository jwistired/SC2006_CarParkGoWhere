const User = require('./User')
const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')

router.get('/', (req, res) => {
    res.render('register.ejs')
})

router.post('/', async (req, res) => {
    //creating new user input and adding to database
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const newUser = new User(req.body.name, req.body.email, hashedPassword)
        req.users.push(newUser)
        res.redirect('/login')
    } catch (error) {
        console.error(error)
        res.redirect('/register')
    } 
    console.log(req.users)
})

module.exports = router
