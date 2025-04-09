const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { authenticateToken } = require('../middleware/auth');

// Create a public route to get a specific prescription by ID without authentication
router.get('/public/:id', prescriptionController.getPublicPrescriptionById);

// Apply authentication middleware to all other prescription routes
router.use(authenticateToken);

// Create a new prescription
router.post('/create', prescriptionController.createPrescription);

// Get prescriptions for the currently logged-in doctor
router.get('/doctor', prescriptionController.getDoctorPrescriptions);

// Get prescriptions for the currently logged-in patient
router.get('/patient', prescriptionController.getPatientPrescriptions);

// Get a specific prescription by ID (authenticated)
router.get('/:id', prescriptionController.getPrescriptionById);

module.exports = router; 