const User = require('./User')
const express = require('express')
const router = express.Router()

//Load register page
router.get('/', (req, res) => {
    res.render('register.ejs')
});

//Validate registration
router.post('/', async (req, res) => {
    try {
        const hashedPassword = await User.hashPassword(req.body.password)
        const newUser = new User(req.body.name, req.body.email, hashedPassword, req.body.securityQuestion, req.body.securityAnswer)
        req.users.push(newUser)
        res.redirect('/login')
    } catch (error) {
        console.error(error)
        res.redirect('/Register')
    } 
    console.log(req.users)
})

module.exports = router
