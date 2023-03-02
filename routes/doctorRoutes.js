const express = require('express');
const {
    getDoctorInfoController,
    updateProfileController,
    getDoctorByIdController,
    doctorAppointmentsController,
    updateStatusController
} = require('../controllers/doctorCtrl');
const authMiddleware = require('../middlewares/authMiddleware');

// router object
const router = express.Router();

// SINGLE DOCTOR INFO || POST
router.post('/getDoctorInfo', authMiddleware, getDoctorInfoController,);

// UPDATE PROFILE || POST
router.post('/updateProfile', authMiddleware, updateProfileController,);

// GET SINGLE DOCTOR INFO || POST
router.post('/getDoctorById', authMiddleware, getDoctorByIdController,);

// GET DOCTOR Appointment || GET
router.get('/doctor-appointments', authMiddleware, doctorAppointmentsController,);

// GET DOCTOR Appointment || POST
router.post('/update-status', authMiddleware, updateStatusController,);

module.exports = router;