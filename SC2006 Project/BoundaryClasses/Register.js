const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { userLogin } = require('./Database');
const passwordCriteria = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/;

router.get('/', (req, res) => {
    res.render('register.ejs');
});

router.post('/', async (req, res) => {
    try {
        const { name, email, password, passwordConfirm } = req.body;

        // Check if the email already exists
        const existingUser = await userLogin.findOne({ email: email });
        if (existingUser) {
            return res.render('register', { messages: { error: "Email already registered. Please use another email." } });
        }

        // Password validation
        if (!passwordCriteria.test(password)) {
            return res.render('register', { 
                messages: { 
                    error: "Password must be between 8 and 20 characters, include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character." 
                } 
            });
        }
        // Check that passwords match
        if (password !== passwordConfirm) {
            return res.render('register', { 
                messages: { 
                    error: "Passwords do not match. Please make sure both password fields are identical." 
                } 
            });
        }

        // Hash the password and save the new user to the database
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new userLogin({
            name: name,
            email: email,
            password: hashedPassword
        });

        await newUser.save();
        console.log("User saved to MongoDB:", newUser);
        res.redirect('/login');
    } catch (error) {
        console.error("Error saving user to MongoDB:", error);
        res.redirect('/register');
    }
});

module.exports = router;