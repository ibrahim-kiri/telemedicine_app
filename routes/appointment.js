const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { isAuthenticated, isPatient } = require('../middleware/auth');

router.post('/book', isAuthenticated, isPatient, appointmentController.bookAppointment);
router.get('/available', isAuthenticated, appointmentController.getAvailableSlots);
router.put('/:id', isAuthenticated, appointmentController.updateAppointment);
router.delete('/:id', isAuthenticated, appointmentController.cancelAppointment);

module.exports = router;