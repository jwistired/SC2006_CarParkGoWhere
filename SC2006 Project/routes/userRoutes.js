// routes/userRoutes.js
const express = require('express');
const UserController = require('../controllers/UserController');
const router = express.Router();

router.post('/register', UserController.registerUser);
router.post('/login', UserController.loginUser);

module.exports = router;
