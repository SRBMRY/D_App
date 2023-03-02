const express = require('express');
const {
    loginController,
    registerController,
    authController,
    applyDoctorController,
    getAllNotificationController,
    deleteAllNotificationController,
    getAllDoctorsController,
    bookAppointmentController,
    bookingAvailabilityController,
    userAppointmentsController
} = require('../controllers/userCtrl');
const authMiddleware = require('../middlewares/authMiddleware');

// router object
const router = express.Router();

// routes
// LOGIN || Post
router.post('/login', loginController);

// REGISTER || Post
router.post('/register', registerController);

// AUTH || Post
router.post('/getUserData', authMiddleware, authController);

// APPLY DOCTOR || Post
router.post('/apply-doctor', authMiddleware, applyDoctorController);

// NOTIFICATION || Post
router.post('/get-all-notification', authMiddleware, getAllNotificationController);

// DELETE ALL NOTIFICATION || Post
router.post('/delete-all-notification', authMiddleware, deleteAllNotificationController);

// GET ALL DOCTORS || Get
router.get('/getAllDoctors', authMiddleware, getAllDoctorsController);

// BOOK APPOINTMENT || Post
router.post('/book-appointment', authMiddleware, bookAppointmentController);

// BOOKING AVAILABILITY || Post
router.post('/booking-availability', authMiddleware, bookingAvailabilityController);

// APPOINTMENT LIST || Get
router.get('/user-appointments', authMiddleware, userAppointmentsController);

module.exports = router;