import express from "express";
import { getUsers } from "../controllers/users.js";

const userRouter = express.Router();

userRouter.get("/", getUsers);

export default userRouter;
