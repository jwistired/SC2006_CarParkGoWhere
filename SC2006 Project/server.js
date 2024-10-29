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

/*
//Connecting to MongoDB database (userLogin)

mongoose.connect('mongodb://localhost:27017/userLogin');
.then(() => {
console.log('Connected to MongoDB');
})
.catch((err) => {
    console.error('Error connecting to MongoDB', err);
});

//Define userLogin schema
const userLoginSchema = new mongoose.Schema({
    username: String,
    password: String,
    name: String,
    email: String
});

//Create UserLogin model
const UserLogin = mongoose.model('UserLogin', userLoginSchema);

-> Maybe need to add middleware to handle bcrypt hashing of password

-> Maybe need to add middleware to parse JSON body


Guide : https://medium.com/@ravipatel.it/building-a-secure-user-registration-and-login-api-with-express-js-mongodb-and-jwt-10b6f8f3741d
*/


// Load environment variables if not in production
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
const mongoose = require('mongoose')

const Register = require('./BoundaryClasses/Register.js')
const Login = require('./BoundaryClasses/Login.js')
const Guest = require('./BoundaryClasses/Guest.js')
const ForgetPassword = require('./BoundaryClasses/ForgetPassword.js')
const Index = require('./BoundaryClasses/Index.js')
const ResetPassword = require('./BoundaryClasses/ResetPassword.js')
const { checkAuthenticated, checkNotAuthenticated } = require('./BoundaryClasses/Authenticator.js')
const initialisePassport = require("./passport-config")
const Database = require('./BoundaryClasses/Database.js')

const getToken = require('./getOneMapToken.js'); //get onemap token 
const carparkFunctions = require('./BoundaryClasses/Hdb_Api.js'); // Ensure you have the correct path

//get distance information
const getDistanceInformation = require('./BoundaryClasses/getDistanceInformation');

// In-memory users array (could be replaced with a database)
const users = [];

// Initialize Passport with user lookup functions
initialisePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

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
    saveUninitialized: false,
    
}));

// Initialize Passport for user authentication
app.use(passport.initialize());
app.use(passport.session());

// Allow method overriding for forms (e.g., using DELETE)
app.use(methodOverride('_method'));

// Serve static files (CSS, images, etc.) from the "public" directory (optional)
app.use(express.static(path.join(__dirname, 'public')));

// gets page to service user as response
app.use('/',Index)
app.use('/guest', checkNotAuthenticated, Guest)
app.use('/login', checkNotAuthenticated, Login)
app.use('/register', checkNotAuthenticated, (req, res, next) => {req.users = users, next()}, Register)
app.use('/forgetPassword', checkNotAuthenticated, 
    (req, res, next) => {req.users = users, next()}, 
    ForgetPassword)
app.use('/resetPassword', ResetPassword)

//getOneMapToken
app.get('/api/token', async (req, res) => {
    try {
        const token = await getToken();
        res.json({ token });
    } catch (error) {
        console.error('Error fetching token:', error);
        res.status(500).json({ error: 'Failed to fetch token' });
    }
});

// Routes
app.get('/api/carpark-details/:carParkNo', async (req, res) => {
    const carParkNo = req.params.carParkNo;
    const carParkDetails = await carparkFunctions.getHdbCarParkDetails(carParkNo);
    if (carParkDetails) {
        res.json(carParkDetails);
    } else {
        res.status(404).json({ error: `Car park ${carParkNo} not found.` });
    }
});

app.get('/api/carpark-coordinates/:carParkNo', async (req, res) => {
    const carParkNo = req.params.carParkNo;
    const coordinates = await carparkFunctions.getCarparkCoor(carParkNo);
    if (coordinates) {
        res.json(coordinates);
    } else {
        res.status(404).json({ error: `Coordinates for car park ${carParkNo} not found.` });
    }
});

app.get('/api/carpark-availability', async (req, res) => {
    const availability = await carparkFunctions.fetchCarparkAvailability();
    res.json(availability);
});

app.get('/api/carpark-numbers', async (req, res) => {
    const carparkNumbers = await carparkFunctions.getAllCarparkNumbers();
    res.json(carparkNumbers);
});

app.get('/api/carpark-lots-details/:carparkNumber', async (req, res) => {
    const carparkNumber = req.params.carparkNumber; // Get carpark number from URL parameters
    const carparkName = req.query.carparkName; // Get carpark name from query parameters

    // Log the request details for debugging
    console.log(`Server requesting details for carpark: ${carparkNumber}, Name: ${carparkName}`);

    try {
        // Pass both carparkNumber and carparkName to the function
        const lotsDetails = await carparkFunctions.getCarparkLotsDetails(carparkNumber, carparkName);

        if (lotsDetails) {
            res.json(lotsDetails); // Send back the details in JSON format
        } else {
            res.status(404).json({ error: `Details for car park number ${carparkNumber} not found.` });
        }
    } catch (error) {
        console.error('Error fetching carpark lots details:', error);
        res.status(500).json({ error: 'Internal server error' }); // Handle any errors gracefully
    }
});


app.get('/api/carpark-coordinates', async (req, res) => {
    const coordinates = await carparkFunctions.getAllCarparkCoor_HDB();
    res.json(coordinates);
});

app.get('/api/find-nearby-carparks', async (req, res) => {
    const { lat, lon } = req.query; // Expect lat and lon as query parameters
    const destinationCoords = `${lat}, ${lon}`;
    const nearbyCarparks = await carparkFunctions.findNearbyCarparks_HDB(destinationCoords, 500);
    res.json(nearbyCarparks);
});


app.get('/calculate-distance', async (req, res) => {
    const { lat1, lon1, lat2, lon2 } = req.query;
    const distance = await getDistanceInformation(
        parseFloat(lat1),
        parseFloat(lon1),
        parseFloat(lat2),
        parseFloat(lon2)
    );
    res.json({ distance })  
});

// Start the server on port 3000
app.listen(3000, () => {
    console.log('Server running on localhost:3000')
})
