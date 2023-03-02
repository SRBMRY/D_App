const express = require('express');
const { getAllUsersController, getAllDoctorsController, changeAccountStatusController } = require('../controllers/adminCtrl');
const authMiddleware = require('../middlewares/authMiddleware');

// router object
const router = express.Router();

// routes
// USERS || Get
router.get('/getAllUsers', authMiddleware, getAllUsersController);

// DOCTORS || Get
router.get('/getAllDoctors', authMiddleware, getAllDoctorsController);

// ACCOUNT STATUS || POST
router.post('/changeAccountStatus', authMiddleware, changeAccountStatusController,);

module.exports = router;