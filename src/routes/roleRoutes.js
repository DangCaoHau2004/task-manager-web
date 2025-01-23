import express from "express";
import { editRole, deleteRole } from "../controllers/roleController.js";
const editRoleRoute = express.Router();
const deleteRoleRoute = express.Router();
editRoleRoute.post("/", editRole);
deleteRoleRoute.post("/", deleteRole);
export { editRoleRoute, deleteRoleRoute };
