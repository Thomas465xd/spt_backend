import express from 'express';
import dotenv from "dotenv";
import cors from 'cors';
import { connectDB } from './config/db';
import authRouter from './routes/authRouter';
import orderRouter from './routes/orderRouter';
import morgan from 'morgan';
import { corsConfig } from './config/cors';

dotenv.config();

connectDB()

const app = express()

// Activar CORS
app.use(cors(corsConfig));

// Logs
app.use(morgan("dev"));

// Leer datos de formularios
app.use(express.json())

// Routes
app.use("/api/auth", authRouter);
app.use("/api/order", orderRouter);

export default app