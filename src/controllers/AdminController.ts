import { Request, Response } from "express";
import User from "../models/User";
import Token from "../models/Token";
import { generatePasswordResetToken } from "../utils/jwt";
import { ConfirmEmail } from "../emails/ConfirmEmail";

export class AdminController {
    
    static confirmUser = async (req: Request, res: Response) => {
        try {
            // Validate received token
            const { token } = req.params;
            //console.log(token)

            const tokenRecord = await Token.findOne({ token, type: "admin_confirmation" });
            
            /*
            // Find the token in the DB
            if(!tokenRecord) {
                const error = new Error("Token no encontrado");
                res.status(404).json({ message: error.message });
                return
            }
            */

            // Find the user in the DB
            const user = await User.findById(tokenRecord.userId);

            /*
            if(!user) {
                const error = new Error("Usuario no encontrado");
                res.status(404).json({ message: error.message });
                return
            }
            */

            // Verify if the user is already confirmed
            if(user.confirmed) {
                const error = new Error("El Usuario ya esta Confirmado");
                res.status(409).json({ message: error.message });
                return
            }

            // Confirm the user & Delete the token
            user.confirmed = true;
            
            await Promise.allSettled([user.save(), tokenRecord.deleteOne()]);

            // Generate new token for creating the password
            const passwordResetToken = await Token.create({
                userId: user.id,
                token: generatePasswordResetToken({ id: user.id }),
                type: "password_reset"
            });

            ConfirmEmail.sendConfirmationEmailToUser({
                email: user.email,
                name: user.name,
                token: passwordResetToken.token
            });

            res.status(200).json({ message: "Usuario Confirmado y Email enviado para crear contraseña" })
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" })
        }
    }

    static getConfirmedUsers = async (req: Request, res: Response) => {
        try {
            const users = await User.find({ confirmed: true });
            
            res.status(200).json({ users });
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" })
        }
    }

    static getUnconfirmedUsers = async (req: Request, res: Response) => {
        try {
            const users = await User.find({ confirmed: false });

            res.status(200).json({ users });
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" })
        }
    }

    static getUserById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
    
            const user = await User.findById(id);
    
            if (!user) {
                res.status(404).json({ message: "Usuario no encontrado" });
                return
            }
    
            res.status(200).json({ user });
        } catch (error) {
            res.status(500).json({ message: "Error interno del servidor" });
        }
    };
    
}