const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const appointmentController = require('../controllers/appointmentController');
const { isAuthenticated, isPatient, isAdmin } = require('../middleware/auth');

router.get('/profile', isAuthenticated, isPatient, patientController.getProfile);
router.put('/profile', isAuthenticated, isPatient, patientController.updateProfile);
router.delete('/profile', isAuthenticated, isPatient, patientController.deleteProfile);
router.get('/appointments', isAuthenticated, isPatient, patientController.getAppointments);
router.post('/appointments', isAuthenticated, isPatient, appointmentController.bookAppointment);
router.get('/admin/patients', isAuthenticated, isAdmin, patientController.getPatients);
router.get('/doctors', isAuthenticated, isPatient, patientController.getDoctors);

module.exports = router;