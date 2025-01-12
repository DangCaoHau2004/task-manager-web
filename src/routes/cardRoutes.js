import express from "express";
import { addCard, updateCard } from "../controllers/cardController.js";
const addCardRoute = express.Router();
const updateCardRoute = express.Router();

addCardRoute.post("/", addCard);
updateCardRoute.post("/", updateCard);
export { addCardRoute, updateCardRoute };
