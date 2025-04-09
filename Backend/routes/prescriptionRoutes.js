const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all prescription routes
router.use(authenticateToken);

// Create a new prescription
router.post('/create', prescriptionController.createPrescription);

// Get prescriptions for the currently logged-in doctor
router.get('/doctor', prescriptionController.getDoctorPrescriptions);

// Get prescriptions for the currently logged-in patient
router.get('/patient', prescriptionController.getPatientPrescriptions);

module.exports = router; 