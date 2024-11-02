const express = require('express')
const router = express.Router()
const {checkAuthenticated, checkNotAuthenticated} = require('./Authenticator.js')
const database = require('./Database.js')

router.get('/', checkAuthenticated, (req, res) => {
    console.log('User object:', req.user)
    history = database.getHistory(req.user.email);
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
        await database.updateHistory(email, { car_park_no, address, x_cord, y_cord });
        res.status(200).json({ message: "History updated successfully" });
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
router.delete('/deletehistory/:id', async (req, res) => {
    const historyId = req.params.id;
    const result = await database.removeHistory(historyId);
    if (result) {
        res.status(200).json({ message: "History entry deleted successfully" });
    } else {
        res.status(404).json({ message: "History entry not found" });
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