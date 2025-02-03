import { Request, Response, NextFunction } from "express";
import User from "../models/User";

export const checkUserStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tokenRecord } = req.body;
        const user = await User.findById(tokenRecord.userId);

        if (!user) {
            res.status(404).json({ message: "Usuario no encontrado" });
            return
        }

        req.body.user = user; // Guardamos el usuario en la request

        next();
    } catch (error) {
        res.status(500).json({ message: "Error interno del servidor" });
    }
};
