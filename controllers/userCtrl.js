const userModel = require('../models/userModel');
const dayjs = require('dayjs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const doctorModel = require('../models/doctorModel');
const appointmentModel = require('../models/appointModel');

// register callback
const registerController = async (req, res) => {

    try {

        const existingUser = await userModel.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(200).send({ message: 'User already exists', success: false });
        }
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        req.body.password = hashedPassword;

        const newUser = new userModel(req.body);
        await newUser.save();
        res.status(201).send({ message: "Registration successful", success: true });

    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: `Register Controller ${error.message}` });
    }
};

// login callback
const loginController = async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.body.email });
        if (!user) {
            return res.status(200).send({ message: 'Invalid Email or Password', success: false });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(200).send({ message: 'Invalid Email or Password', success: false });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).send({ message: 'Login successful', success: true, token });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: `Error in login ${error.message}` });
    }
};

// auth callback
const authController = async (req, res) => {
    try {
        const user = await userModel.findById({ _id: req.body.userId });
        user.password = undefined;
        if (!user) {
            return res.status(200).send({ message: "User not found", success: false, });
        } else {
            res.status(200).send({ success: true, data: user, });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Auth error', success: false, error });
    }
};

// apply doctor callback
const applyDoctorController = async (req, res) => {
    try {
        const newDoctor = await doctorModel({ ...req.body, status: 'pending' });
        await newDoctor.save();

        const adminUser = await userModel.findOne({ isAdmin: true });
        const notification = adminUser.notification;
        notification.push({
            type: "apply-doctor-request",
            message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for a doctor account`,
            data: {
                doctorId: newDoctor._id,
                name: newDoctor.firstName + " " + newDoctor.lastName,
                onClickPath: "/admin/doctors",
            },
        });
        await userModel.findByIdAndUpdate(adminUser._id, { notification });

        res.status(201).send({ success: true, message: "Doctor account applied successfully!", });

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error while applying for doctor', success: false, error });
    }
};

// get all notification callback
const getAllNotificationController = async (req, res) => {
    try {
        const user = await userModel.findOne({ _id: req.body.userId });
        const seenNotification = user.seenNotification;
        const notification = user.notification;
        seenNotification.push(...notification);
        user.notification = [];
        user.seenNotification = seenNotification;
        const updatedUser = await user.save();
        updatedUser.password = undefined;

        res.status(200).send(({ success: true, message: "All notifications marked as read", data: updatedUser, }));
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Unable to mark all notifications as read', success: false, error });
    }
};

// delete all notification callback
const deleteAllNotificationController = async (req, res) => {
    try {
        const user = await userModel.findOne({ _id: req.body.userId });
        user.seenNotification = [];
        const updatedUser = await user.save();
        updatedUser.password = undefined;

        res.status(200).send(({ success: true, message: "All notifications deleted successfully", data: updatedUser, }));
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Unable to delete all notifications', success: false, error });
    }
};

// get all doctors callback
const getAllDoctorsController = async (req, res) => {
    try {
        const doctors = await doctorModel.find({ status: 'approved' });
        res.status(200).send(({ success: true, message: "Doctor list fetched successfully", data: doctors, }));
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error while fetching doctors', success: false, error });
    }
};

// book appointment callback
const bookAppointmentController = async (req, res) => {
    try {
        // req.body.date = dayjs(req.body.date, 'DD-MM-YYYY');
        // req.body.time = dayjs(req.body.time, 'HH:mm');
        req.body.status = "pending";
        const newAppointment = new appointmentModel(req.body);
        await newAppointment.save();
        const user = await userModel.findOne({ _id: req.body.doctorInfo.userId });
        user.notification.push({
            type: "New-appointment-request",
            message: `A new appointment request from ${req.body.userInfo.name}`,
            onClickPath: "/user/appointments",
        });
        await user.save();
        res.status(200).send({ success: true, message: "Appointment booked successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error while booking appointment', success: false, error });
    }
};

// booking availability callback
const bookingAvailabilityController = async (req, res) => {
    try {
        const date = dayjs(req.body.date, 'DD-MM-YYYY');
        const fromTime = dayjs(req.body.time, 'HH:mm').subtract(1, 'hours');
        const toTime = dayjs(req.body.time, 'HH:mm').add(1, 'hours');
        const doctorId = req.body.doctorId;
        const appointments = await appointmentModel.find({
            doctorId,
            date,
            time: {
                $gte: fromTime, $lte: toTime,
            }
        });
        if (appointments.length > 0) {
            return res.status(200).send({ message: 'Appointment unavailable for selected time', success: true, });
        } else {
            return res.status(200).send({ message: 'Appointment available', success: true, });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error while checking availability', success: false, error });
    }
};

// getting user appointments callback
const userAppointmentsController = async (req, res) => {
    try {
        const appointments = await appointmentModel.find({ userId: req.body.userId });
        res.status(200).send({ message: "Appointment list fetched successfully", success: true, data: appointments, });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error in getting appointment list', success: false, error });
    }
};

module.exports = {
    loginController,
    registerController,
    authController,
    applyDoctorController,
    getAllNotificationController,
    deleteAllNotificationController,
    getAllDoctorsController,
    bookAppointmentController,
    bookingAvailabilityController,
    userAppointmentsController,
};