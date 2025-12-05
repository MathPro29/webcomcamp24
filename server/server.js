import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import DBconnect from "./config/db.js";
import userRouter from "./routes/users.js";
import registerRouter from "./routes/register.js";
import authRouter from "./routes/auth.js";
import paymentsRouter from "./routes/payments.js";
import { limitsignup } from "./middleware/ratelimit.js";
import { loginlimit } from "./middleware/ratelimit.js";
import settingsRouter from "./routes/settings.js";


dotenv.config();


const PORT = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
}));

// API Routes
app.use("/api/users", userRouter);
// Apply rate limiter BEFORE the register router so it can block requests
app.use("/api/register", limitsignup, registerRouter);
app.use('/register', limitsignup);
app.use('/api/auth', authRouter, loginlimit);
app.use('/api/payments', paymentsRouter);
app.use('/api/settings', settingsRouter);

// เชื่อมต่อ DB และเปิด server
DBconnect().then(() => {
    app.get('/', (req, res) => {
        res.send('Server is running and connected to MongoDB!');
    });

    app.listen(PORT, () => {
        console.log(`🚀 Server listening on port ${PORT}`);
    });
});