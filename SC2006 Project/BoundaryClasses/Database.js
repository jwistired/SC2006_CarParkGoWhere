require('dotenv').config();  // Load environment variables from .env file
const mongoose = require('mongoose');

const LOCAL_CONNECTION = "mongodb://JingWoon:nAsb4BXZmUKq@augentum.party:27017/CarParkGoWhere"
const USER_LOGIN = "userData"
const USER_HISTORY = "userHistory"

// Connect to MongoDB
mongoose.connect(LOCAL_CONNECTION)
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
}, { collection: USER_LOGIN});  // Explicit collection name

const historySchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    car_park_no: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    x_cord: {
        type: Number,
        require: true
    },
    y_cord: {
        type: Number,
        require: true
    },
    time: { 
        type: Date, 
        default: Date.now
    }
})

const userHistory = mongoose.model(USER_HISTORY, historySchema);
// get user from mongoDB through email
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
// get all user history
const getHistory = async (email) => {
    try {
        const history = await userHistory.find({ email: email })
        return history;  // return the array of userHistory records; access through history[i]
    } catch (error) {
        console.error("Error fetching user history by email:", error)
        return null
    }
}


const updateHistory = async (email, newHistory) => {
    try {
        // Get user history sorted by time in ascending order (oldest first)
        const history = await userHistory.find({ email: email }).sort({ time: 1 });

        if (history.length >= 3) {
            // If history has 3 or more records, delete the oldest one
            await userHistory.deleteOne({ _id: history[0]._id });
        }

        // Add the new history document
        const historyRecord = new userHistory({
            email: email,
            car_park_no: newHistory.car_park_no,
            address: newHistory.address,
            x_cord: newHistory.x_cord,
            y_cord: newHistory.y_cord,
        });

        await historyRecord.save();
        console.log("History updated successfully");

    } catch (error) {
        console.error("Error updating history:", error);
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

module.exports = {userLogin, getByEmail, getByID, getHistory, updateHistory}
