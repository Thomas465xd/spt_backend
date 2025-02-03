import { Request, Response, NextFunction } from "express";
import User from "../models/User";

export const checkExistingUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, rut } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(409).json({ message: "El Usuario ya está Registrado" });
            return
        }

        const userRutExists = await User.findOne({ rut });
        if (userRutExists) {
            res.status(409).json({ message: "El RUT ya está Registrado" });
            return
        }

        next();
    } catch (error) {
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
