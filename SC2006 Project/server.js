/*
// server.js
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const carParkRoutes = require('./routes/carParkRoutes');
const passport = require('passport');
require('./config/passport-config')(passport);

const app = express();

// Set up middleware
app.use(express.json());
app.use(express
*/



if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const path = require('path')
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require("express-session")
const methodOverride = require("method-override")

const initialisePassport = require("./passport-config")
initialisePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = []

app.set('view-engine', 'ejs')
app.set('views', path.join(__dirname, '/Boundary Classes'));

app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated,(req, res) => {
    res.render('index.ejs', {name: req.user.name})
})

app.get('/guest', checkNotAuthenticated,(req, res) => {
    res.render('guest.ejs')
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated,passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: 'login',
    failureFlash: true
}))

app.get('/Register',checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/Register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch {
        res.redirect('/Register')
    }
    console.log(users)
})

app.delete('/logout',(req, res) => {
    req.logOut(function(err) {
        if (err) { 
            return next(err) 
        }
        res.redirect('/login')
    })
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}
app.listen(3000)