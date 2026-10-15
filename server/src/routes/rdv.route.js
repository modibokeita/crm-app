import { 
    getAppointments, 
    createAppointment, 
    getAppointmentByDate 
} from "../controllers/rdv.controller.js";

import express from "express";
const rdvRouter = express.Router();

rdvRouter.get("/", getAppointments);
rdvRouter.post("/newdRdv", createAppointment);
rdvRouter.get("/:date", getAppointmentByDate);

export default rdvRouter;