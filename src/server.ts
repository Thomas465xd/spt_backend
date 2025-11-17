import express from 'express';
import dotenv from "dotenv";
import cors from 'cors';
import { connectDB } from './config/db';
import authRouter from './routes/authRouter';
import orderRouter from './routes/orderRouter';
import morgan from 'morgan';
import { corsConfig } from './config/cors';
import { errorHandler } from './middleware/error';
import { NotFoundError } from './errors/not-found';

dotenv.config();

//? Check if necessary env variables are present
if(!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be defined")
}

if(!process.env.FRONTEND_URL) {
    throw new Error("FRONTEND_URL must be defined")
}

if(!process.env.ADMIN_EMAIL) {
    throw new Error("ADMIN_EMAIL must be defined")
}

if(!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be defined")
}

if(!process.env.ADMIN_SECRET) {
    throw new Error("ADMIN_SECRET must be defined")
}

if(!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY must be defined")
}

if(!process.env.CONFIRMATION_SECRET) {
    throw new Error("CONFIRMATION_SECRET must be defined")
}

if(!process.env.PASSWORD_RESET_SECRET) {
    throw new Error("PASSWORD_RESET_SECRET must be defined")
}

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

//? Trigger not-found error | before Error Handler & after router declarations
app.all("/{*splat}/" , async (req, res, next) => {
    throw new NotFoundError("Resource not Found")
});

//? Error Handler | has to be after all the route handlers
app.use(errorHandler);

export default app