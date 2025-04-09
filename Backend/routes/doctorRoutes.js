const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticateToken } = require('../middleware/auth');

// Public route - no authentication required
// Route to get all doctors
router.get('/all', doctorController.getAllDoctors);

// Protected routes - authentication required
// Route to get patients for the currently logged-in doctor
router.get('/my-patients', authenticateToken, doctorController.getDoctorPatients);

module.exports = router; 