// routes/carParkRoutes.js
const express = require('express');
const CarParkController = require('../controllers/CarParkController');
const router = express.Router();

router.post('/find-nearby', CarParkController.findNearbyCarParks);

module.exports = router;
