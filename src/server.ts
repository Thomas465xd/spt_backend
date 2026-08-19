import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import authRouter from "./routes/authRouter";
import orderRouter from "./routes/orderRouter";
import morgan from "morgan";
import { corsConfig } from "./config/cors";
import { errorHandler } from "./middleware/error";
import { NotFoundError } from "./errors/not-found";
import "./config/env";

connectDB();

const app = express();

// This parses JSON bodies
app.use(express.json());

// Activar CORS
app.use(cors(corsConfig));

// Logs
app.use(morgan("dev"));

// Leer datos de formularios
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/orders", orderRouter);

//? Trigger not-found error | before Error Handler & after router declarations
app.all("/{*splat}/", async (req, res, next) => {
	throw new NotFoundError("Resource not Found");
});

//? Error Handler | has to be after all the route handlers
app.use(errorHandler);

export default app;
