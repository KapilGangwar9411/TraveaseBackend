const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// Get user profile
router.get('/profile/:uid', userController.getUserProfile);

// Update user profile
router.put('/profile/:uid', userController.updateUserProfile);

module.exports = router;
