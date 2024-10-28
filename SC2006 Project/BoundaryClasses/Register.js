const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const userData = require('./Database')

router.get('/', (req, res) => {
    res.render('register.ejs')
})

router.post('/', async (req, res) => {
    //creating new user input and adding to database
    try {
        const existingUser = await userData.findOne({ email: req.body.email });
        if (existingUser) {
            return res.render('register', { messages: { error: "Email already registered. Please use another email." } });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new userData({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });

        await newUser.save();
        console.log("User saved to MongoDB:", newUser);
        res.redirect('/login');
    } catch (error) {
        console.error("Error saving user to MongoDB:", error);
        res.redirect('/register');
    }
})

module.exports = router
