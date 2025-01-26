import express from "express";
import { notificationGetController } from "../controllers/notificationController.js";

const notification = express.Router();
notification.get("/", notificationGetController);

export { notification };
