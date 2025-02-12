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
            // Get the page and perPage query parameters (default values if not provided)
            const page = parseInt(req.query.page as string) || 1;
            const perPage = parseInt(req.query.perPage as string) || 10;

            // Calculate skip and limit for pagination
            const skip = (page - 1) * perPage;
            const limit = perPage;

            // Get the total number of confirmed users
            const totalUsers = await User.countDocuments({ confirmed: true });

            // Fetch the users for the current page with pagination
            const users = await User.find({ confirmed: true })
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }); // Sort by createdAt in descending order

            // Calculate the total number of pages
            const totalPages = Math.ceil(totalUsers / perPage);
            
            res.status(200).json({ users, totalUsers, totalPages });
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" })
        }
    }

    static getUnconfirmedUsers = async (req: Request, res: Response) => {
        try {
            // Get the page and perPage query parameters (default values if not provided)
            const page = parseInt(req.query.page as string) || 1;
            const perPage = parseInt(req.query.perPage as string) || 10;

            // Calculate skip and limit for pagination
            const skip = (page - 1) * perPage;
            const limit = perPage;

            // Get the total number of unconfirmed users
            const totalUnconfirmedUsers = await User.countDocuments({ confirmed: false });

            // Fetch the users for the current page with pagination
            const users = await User.find({ confirmed: false }) 
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }); // Sort by createdAt in descending order

            // Calculate the total number of pages
            const totalPages = Math.ceil(totalUnconfirmedUsers / perPage);

            res.status(200).json({users, totalUnconfirmedUsers, totalPages});
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" })
        }
    }

    static getUserById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
    
            const user = await User.findById(id);
    
            res.status(200).json({ user });
        } catch (error) {
            res.status(500).json({ message: "Error interno del servidor" });
        }
    };

    static getAuthenticatedUser = async (req: Request, res: Response) => {
        try {
            const user = req.user;

            res.status(200).json( user );
        } catch (error) {
            res.status(500).json({ message: "Error interno del servidor" });
            return
        }
    }

    static updateUserStatus = async (req: Request, res: Response) => {
        try {
            const user = req.body.user;
            //console.log(user)

            if(user.confirmed) {
                user.confirmed = false;
                await user.save();
                res.status(200).json({ message: "Usuario Bloqueado Exitosamente" });
            } else {
                user.confirmed = true;
                await user.save();
                res.status(200).json({ message: "Usuario Desbloqueado Exitosamente" });
            }
        } catch (error) {
            res.status(500).json({ message: "Error interno del servidor" });
            return
        }
    }

    
}