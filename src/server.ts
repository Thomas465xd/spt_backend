import express from 'express';
import dotenv from "dotenv";
import { connectDB } from './config/db';
import authRouter from './routes/authRouter';
import morgan from 'morgan';

dotenv.config();

connectDB()

const app = express()

// Logs
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRouter);

export default app