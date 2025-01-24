import express from "express";
import {
  chatControllerGet,
  chatMessagesControllerget,
} from "../controllers/chatController.js";
const chatRoutes = express.Router();
const chatMessages = express.Router();
chatRoutes.get("/", chatControllerGet);

chatMessages.get("/", chatMessagesControllerget);

export { chatRoutes, chatMessages };
