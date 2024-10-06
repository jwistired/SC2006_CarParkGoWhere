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



// Load environment variables if not in production
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const path = require('path');
const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require("express-session");
const methodOverride = require("method-override");
const ResetPassword = require('./BoundaryClasses/ResetPassword.js');

const Register = require('./BoundaryClasses/Register.js');
const Login = require('./BoundaryClasses/Login.js');
const Guest = require('./BoundaryClasses/Guest.js');
const ForgetPassword = require('./BoundaryClasses/ForgetPassword.js');
const Index = require('./BoundaryClasses/Index.js');
const { checkAuthenticated, checkNotAuthenticated } = require('./BoundaryClasses/Authenticator.js');
const initialisePassport = require("./passport-config");


// In-memory users array (could be replaced with a database)
const users = [];

// Initialize Passport with user lookup functions
initialisePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
);

const app = express();

const cookieParser = require('cookie-parser');

// Use cookie-parser middleware
app.use(cookieParser());

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: false }));

// Flash messages middleware
app.use(flash());

// Session middleware (ensure SESSION_SECRET is defined in .env)
app.use(session({
    secret: process.env.SESSION_SECRET || 'j43hk2398f23jndfljk23nfsd23lfjksd',  // Replace with your secret
    resave: false,
    saveUninitialized: false
}));

// Initialize Passport for user authentication
app.use(passport.initialize());
app.use(passport.session());

// Allow method overriding for forms (e.g., using DELETE)
app.use(methodOverride('_method'));

// Serve static files (CSS, images, etc.) from the "public" directory (optional)
app.use(express.static(path.join(__dirname, 'public')));

// gets page to service user as response
app.use('/', Index)
app.use('/guest', checkNotAuthenticated, Guest)
app.use('/login', checkNotAuthenticated, Login)
app.use('/register', checkNotAuthenticated, (req, res, next) => {req.users = users, next()}, Register)
app.use('/forgetPassword', (req, res, next) => {req.users = users, next()}, ForgetPassword)
app.use('/resetPassword', ResetPassword)

// Start the server on port 3000
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
