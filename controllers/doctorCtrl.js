const appointmentModel = require("../models/appointModel");
const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModel");

// get doctor info callback
const getDoctorInfoController = async (req, res) => {
    try {
        const doctor = await doctorModel.findOne({ userId: req.body.userId });
        res.status(200).send({ success: true, message: "Doctor data fetched successfully", data: doctor });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: "Error in fetching doctor details", error, });
    }
};

// update doc profile callback
const updateProfileController = async (req, res) => {
    try {
        const doctor = await doctorModel.findOneAndUpdate({ userId: req.body.userId }, req.body);
        res.status(200).send({ success: true, message: "Doctor profile updated", data: doctor });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: "Error in updating doctor profile", error, });
    }
};

// get single doctor callback
const getDoctorByIdController = async (req, res) => {
    try {
        const doctor = await doctorModel.findOne({ _id: req.body.doctorId });
        res.status(200).send({ success: true, message: "Doctor info fetched", data: doctor, });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: "Error in getting doctor info", error, });
    }
};

// get doctor appointments callback
const doctorAppointmentsController = async (req, res) => {
    try {
        const doctor = await doctorModel.findOne({ userId: req.body.userId });
        const appointments = await appointmentModel.find({ doctorId: doctor._id });
        res.status(200).send({ success: true, message: "Appointments fetched successfully", data: appointments, });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: "Error in getting appointments", error, });
    }
};

// approve/reject appointment by user callback
const updateStatusController = async (req, res) => {
    try {
        const { appointmentId, status } = req.body;
        const appointments = await appointmentModel.findByIdAndUpdate(appointmentId, { status });
        const user = await userModel.findOne({ _id: appointments.userId });
        user.notification.push({
            type: "Status-updated",
            message: `Your appointment has been ${status}`,
            onClickPath: "/doctor-appointments",
        });
        await user.save();
        res.status(200).send({ success: true, message: `Appointment ${status}`, });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: "Error in updating status", error, });
    }
};

module.exports = {
    getDoctorInfoController,
    updateProfileController,
    getDoctorByIdController,
    doctorAppointmentsController,
    updateStatusController,
};