import { 
    getAppointments, 
    createAppointment, 
    getAppointmentByID,
    getAppointmentsCount,
    deleteAppointmentByID,
    getAppointmentByDate
} from "../controllers/rdv.controller.js";

import express from "express";
const rdvRouter = express.Router();

rdvRouter.get("/", getAppointments);
rdvRouter.get("/count", getAppointmentsCount);
rdvRouter.get("/by-date", getAppointmentByDate);
rdvRouter.post("/newRdv", createAppointment);
rdvRouter.get("/:id", getAppointmentByID);
rdvRouter.delete("/:id", deleteAppointmentByID)

export default rdvRouter;