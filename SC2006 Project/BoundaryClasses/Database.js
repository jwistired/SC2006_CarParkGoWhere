require('dotenv').config();  // Load environment variables from .env file
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/CarparkgoWhere')
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
}, { collection: 'userData' });  // Explicit collection name

const userData = mongoose.model("userData", userSchema);

// Test insertion function
async function testInsert() {
    try {
        const testUser = new userData({
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

module.exports = userData;
