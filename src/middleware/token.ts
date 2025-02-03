import { Request, Response, NextFunction } from "express";
import Token from "../models/Token";

export const validateToken = (type: "admin_confirmation" | "password_reset") => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { token } = req.params;

            const tokenRecord = await Token.findOne({ token, type });

            if (!tokenRecord) {
                res.status(404).json({ message: "Token no encontrado o inválido" });
                return
            }

            req.body.tokenRecord = tokenRecord; // Guardamos el token en la request
            next();
        } catch (error) {
            res.status(500).json({ message: "Error interno del servidor" });
        }
    };
};
