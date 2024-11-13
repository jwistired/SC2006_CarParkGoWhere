require('dotenv').config();  // Load environment variables from .env file
const userSchema = require('../models/User.js')
const historySchema = require('../models/CarPark.js')
const mongoose = require('mongoose');

const LOCAL_CONNECTION = '' //Insert your local connection string here
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

const userLogin = mongoose.model(USER_LOGIN, userSchema)
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
        console.log("PRINT USER HISTORY: ", history);
        return history;  // return the array of userHistory records; access through history[i]
    } catch (error) {
        console.error("Error fetching user history by email:", error)
        return null
    }
}

// update new user history
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
        
        // Return the newly created history record including its ID
        return historyRecord; // Now includes the generated _id

    } catch (error) {
        console.error("Error updating history:", error);
    }
};

// Delete a history entry from DB
const removeHistory = async (historyId) => {
    try {
        console.log("Current records before deletion:");
        const allRecordsBefore = await userHistory.find();
        console.log(allRecordsBefore);

        const deletedRecord = await userHistory.findByIdAndDelete(historyId);

        console.log("Deleted record:", deletedRecord);

        console.log("Current records after deletion:");
        const allRecordsAfter = await userHistory.find();
        console.log(allRecordsAfter);

        return deletedRecord;
    } catch (error) {
        console.error("Error removing history by ID:", error);
        return null;
    }
};

module.exports = {userLogin, getByEmail, getByID, getHistory, updateHistory, removeHistory}
