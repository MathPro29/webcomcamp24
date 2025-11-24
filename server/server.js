// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import DBconnect from "./config/db.js";
import userRouter from "./routes/users.js";
import mongoose from "mongoose";
import registerRouter from "./routes/register.js";
import authRouter from "./routes/auth.js";

dotenv.config();
// ดึงค่าตัวแปรจากไฟล์ .env ผ่าน process.env
const PORT = process.env.PORT || 5000;
DBconnect();


const app = express();

app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// API Routes
app.use("/api/users", userRouter);
app.use("/api/register", registerRouter); // เพิ่มบรรทัดนี้แค่นี้พอ
app.use('/api/auth', authRouter);


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