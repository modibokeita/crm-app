import mongoose from "mongoose";

import Appointment from "../models/rdv.model.js";

const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("user", "name email")
      .populate("client", "name email phone address companyName")
      .sort({ date: 1 });

    return res.status(200).json({
      message: "Appointments retrieved successfully",
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("Get appointments error:", error);

    return res.status(500).json({
      message: "An internal server error occurred",
    });
  }
};
const getAppointmentsCount = async (req, res) => {

  try{
    const count = await Appointment.countDocuments();
    res.status(200).json({totalRdv: count})
  }catch(error){
    console.error("Get rdv count error", error)
    res.status(500).json({message: "failed to count rdv"})
  }
}
const createAppointment = async (req, res) => {
  const { user, client, title, date, status, location } = req.body ?? {};

  if (!user || !client || !title || !date) {
    return res.status(400).json({
      message: "User, client, title, and date are required",
    });
  }

  try {
    const newAppointment = new Appointment({
      user,
      client,
      title,
      date,
      status,
      location,
    });

    const savedAppointment = await newAppointment.save();

    return res.status(201).json({
      message: "Appointment created successfully",
      appointment: savedAppointment,
    });
  } catch (error) {
    console.error("Create appointment error:", error);

    return res.status(500).json({
      message: "An internal server error occurred",
    });
  }
};
const getAppointmentByID = async (req, res) => {
  const { id } = req.params;

  // 1. Check that the ID is provided and valid
  if (!id || !mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      message: "Invalid rdv ID here",
    });
  }

  try {
    // 2. Find the appointment by its MongoDB ID
    const appointment = await Appointment.findById(id)
      .populate("user", "name email")
      .populate("client", "name email phone address companyName");

    // 3. Check whether the appointment exists
    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    // 4. Return the appointment
    return res.status(200).json({
      message: "Appointment retrieved successfully",
      appointment,
    });
  } catch (error) {
    console.error("Get appointment by ID error:", error);

    return res.status(500).json({
      message: "An internal server error occurred",
    });
  }
};
const deleteAppointmentByID = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate the MongoDB ObjectId
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid appointment ID",
      });
    }

    // 2. Find and delete the appointment
    const deletedAppointment = await Appointment.findByIdAndDelete(id);

    // 3. Check whether the appointment exists
    if (!deletedAppointment) {
      return res.status(404).json({
        message: "rdv not found",
      });
    }

    // 4. Return success response
    return res.status(200).json({
      message: "rdv deleted successfully",
      appointment: deletedAppointment,
    });
  } catch (error) {
    console.error("Delete rdv error:", error);

    return res.status(500).json({
      message: "An internal server error occurred",
    });
  }
};
const getAppointmentByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: "Please provide a date.",
      });
    }

    const startDate = new Date(`${date}T00:00:00.000Z`);
    const endDate = new Date(`${date}T23:59:59.999Z`);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return res.status(400).json({
        message: "Invalid date format. Use YYYY-MM-DD.",
      });
    }

    const appointments = await Appointment.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .populate("user", "name email")
      .populate("client", "name email phone")
      .sort({ date: 1 });

    return res.status(200).json({
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("Error fetching appointments by date:", error);

    return res.status(500).json({
      message: "Failed to fetch appointments.",
    });
  }
};
    
export { 
  getAppointments, 
  createAppointment, 
  getAppointmentByID, 
  getAppointmentsCount, 
  deleteAppointmentByID, 
  getAppointmentByDate };