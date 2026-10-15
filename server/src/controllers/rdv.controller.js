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
const createAppointment = async (req, res) => {
  const { user, client, title, date, duration, status, location, notes } = req.body ?? {};

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
      duration,
      status,
      location,
      notes,
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
const getAppointmentByDate =  async (req, res) => {
  const { date } = req.params;

  if (!date) {
    return res.status(400).json({
      message: "Date parameter is required",
    });
  }

  try {
    const appointments = await Appointment.find({ date: new Date(date) })
      .populate("user", "name email")
      .populate("client", "name email phone address companyName")
      .sort({ date: 1 });

    return res.status(200).json({
      message: "Appointments retrieved successfully",
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("Get appointments by date error:", error);

    return res.status(500).json({
      message: "An internal server error occurred",
    });
  }
};
    
export { getAppointments, createAppointment, getAppointmentByDate };