// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import DBconnect from "./config/db.js";
import userRouter from "./routes/users.js";
import mongoose from "mongoose";


dotenv.config();
// ดึงค่าตัวแปรจากไฟล์ .env ผ่าน process.env
const PORT = process.env.PORT || 5000;
DBconnect();


const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/users", userRouter);



// 4. เรียกใช้ฟังก์ชันเชื่อมต่อและเปิดเซิร์ฟเวอร์
DBconnect().then(() => {
    // โค้ดสำหรับเซิร์ฟเวอร์ Express
    app.get('/', (req, res) => {
        res.send('Server is running and connected to MongoDB!');
    });

    app.listen(PORT, () => {
        console.log(`🚀 Server listening on port ${PORT}`);
    });
});