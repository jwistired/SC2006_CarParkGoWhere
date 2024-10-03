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
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require("express-session")
const methodOverride = require("method-override")


const Register = require('./BoundaryClasses/Register.js')
const Login = require('./BoundaryClasses/Login.js')
const Guest = require('./BoundaryClasses/Guest.js')
const ForgetPassword = require('./BoundaryClasses/ForgetPassword.js')
const Index = require('./BoundaryClasses/Index.js')
const {checkAuthenticated, checkNotAuthenticated} = require('./BoundaryClasses/Authenticator.js')
const initialisePassport = require("./passport-config")
initialisePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)
const users = []
const app = express()

app.set('view-engine', 'ejs')
//app.set('views', path.join(__dirname, '/Boundary Classes'));

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

// gets page to service user as response
app.use('/', Index)
app.use('/guest', checkNotAuthenticated, Guest)
app.use('/login', checkNotAuthenticated, Login)
app.use('/register', checkNotAuthenticated, (req, res, next) => {req.users = users, next()}, Register)
app.use('/forgetPassword', checkNotAuthenticated, ForgetPassword)



app.listen(3000)