require('dotenv').config();  // Load environment variables from .env file
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://JingWoon:nAsb4BXZmUKq@augentum.party:27017/CarParkGoWhere')
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB", err);
    });

// Define schema and model
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, { collection: 'userLogin' });  // Explicit collection name

const userLogin = mongoose.model("userLogin", userSchema);

//get user from mongoDB through email
const getByEmail = async (email) => {
    try {
        return await userLogin.findOne({ email: email })
    } catch (error) {
        console.error("Error fetching user by email:", error)
        return null
    }
}

//get user from mongoDB through _id
const getByID = async (id) => {
    try {
        return await userLogin.findById(id);
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        return null;
    }
};
// Test insertion function
async function testInsert() {
    try {
        const testUser = new userLogin({
            name: 'Test User',
            email: 'testuser@example.com',
            password: 'testpassword'
        });
        
        await testUser.save();
        console.log("Test user inserted");
    } catch (err) {
        console.error("Failed to insert test user", err);
    } finally {
        mongoose.connection.close(); // Close the connection after insertion
    }
}


//testInsert();

module.exports = {userLogin, getByEmail, getByID}
