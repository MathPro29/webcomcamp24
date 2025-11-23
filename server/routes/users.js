import express from "express";
import { getUsers } from "../controllers/users.js";

const userRouter = express.Router();

userRouter.get("/", getUsers);

import User from "../models/users.js";

userRouter.get("/seed", async (req, res) => {
  await User.deleteMany({});
  await User.insertMany([
    { firstName: "สมชาย", lastName: "ใจดี", school: "เตรียมอุดมศึกษา", status: "ผ่านการสมัคร" },
    { firstName: "สมหญิง", lastName: "รักดี", school: "สตรีวิทยา", status: "ผ่านการสมัคร" },
    { firstName: "เด็กชาย", lastName: "คอมแคมป์", school: "มหิดลวิทยานุสรณ์", status: "รอตรวจสอบ" },
    { firstName: "เด็กหญิง", lastName: "เก่งมาก", school: "อัสสัมชัญ", status: "ไม่ผ่านการสมัคร" },
  ]);
  res.send("เพิ่มข้อมูลตัวอย่างเรียบร้อย!");
});
export default userRouter;
