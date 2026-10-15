
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    // The CRM user who booked the appointment
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Booking user is required"],
    },

    // The client concerned by the appointment
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: [true, "Client is required"],
    },

    title: {
      type: String,
      required: [true, "Appointment title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    date: {
      type: Date,
      required: [true, "Appointment date is required"],
    },

    duration: {
      type: Number,
      default: 30,
      min: [5, "Duration must be at least 5 minutes"],
      max: [480, "Duration cannot exceed 480 minutes"],
    },

    status: {
      type: String,
      enum: ["scheduled", "confirmed", "completed", "cancelled"],
      default: "scheduled",
    },

    location: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model(
  "Appointment",
  appointmentSchema
);

export default Appointment;
