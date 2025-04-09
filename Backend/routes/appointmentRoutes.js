const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get current user's appointments
router.get('/user', appointmentController.getUserAppointments);

// Book a new appointment
router.post('/book', appointmentController.bookAppointment);

// Get available time slots for a doctor on a specific date
router.get('/available-slots', appointmentController.getAvailableTimeSlots);

// Update appointment status
router.put('/:id/status', appointmentController.updateAppointmentStatus);

module.exports = router; 