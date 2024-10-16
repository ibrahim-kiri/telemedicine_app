const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { isAuthenticated, isDoctor } = require('../middleware/auth');

router.get('/profile', isAuthenticated, isDoctor, doctorController.getProfile);
router.put('/profile', isAuthenticated, isDoctor, doctorController.updateProfile);
router.get('/appointments', isAuthenticated, isDoctor, doctorController.getAppointments);

module.exports = router;