const express = require('express')
const router = express.Router()
const {checkAuthenticated, checkNotAuthenticated} = require('./Authenticator.js')
const database = require('./Database.js')  // imports the database "class"

router.get('/', checkAuthenticated, async (req, res) => {
    //console.log('User object:', req.user)
    history = await database.getHistory(req.user.email);  // loading of the history from mongoDB based on user email using req.user.email
    res.render('index.ejs', { name: req.user.name, email: req.user.email, history: history })
})

//get user name
router.get('/name', (req, res) => {
    const userName = req.user.name;
    res.render('index.ejs', { name: userName });
})

// get email
// router.get('/email', (req, res) => {
//     if (req.user && req.user.email) {
//         const userEmail = req.user.email;
//         res.render('index.ejs', { email: userEmail });
//     } else {
//         res.status(400).send('Email not found');
//     }
// })

// Update history endpoint
router.post('/updateHistory', async (req, res) => {
    const {email, car_park_no, address, x_cord, y_cord } = req.body;
    try {
        // Call the updateHistory function and store the returned record
        const newRecord = await database.updateHistory(email, { car_park_no, address, x_cord, y_cord });

        // Return the new record, including the ID
        res.status(200).json(newRecord); // This will send the entire new record back to the client
    } catch (error) {
        console.error("Error updating history:", error);
        res.status(500).json({ error: "Failed to update history" });
    }
});

// Delete all history for a user
router.delete('/deleteHistory', checkAuthenticated, async (req, res) => {
    const email = req.user.email;

    try {
        await database.userHistory.deleteMany({ email: email });
        res.status(200).json({ message: "History deleted successfully" });
    } catch (error) {
        console.error("Error deleting history:", error);
        res.status(500).json({ error: "Failed to delete history" });
    }
});

// Delete specific history
router.delete('/deleteHistory/:id', async (req, res) => {
    const historyId = req.params.id;
    const result = await database.removeHistory(historyId);
    if (result) {
        res.status(200).json({ message: "History entry deleted successfully" });
    } else {
        res.status(404).json({ message: "History entry not found" });
    }
});

// Get all user history by email
router.get('/userHistory/:email', async (req, res) => {
    const email = req.params.email; // Get email from request parameters
    try {
        const history = await database.getHistory(email); // Call your getHistory function
        if (history) {
            res.status(200).json(history); // Return the history as a JSON response
        } else {
            res.status(404).json({ message: "No history found for this email" }); // Handle case where no history is found
        }
    } catch (error) {
        console.error("Error fetching user history:", error);
        res.status(500).json({ error: "Failed to fetch user history" }); // Handle server errors
    }
});


router.delete('/logout', (req, res, next) => {
    req.logOut(function(err) {
        if (err) { 
            return next(err) 
        }
        res.redirect('/login')
    })
})

module.exports = router