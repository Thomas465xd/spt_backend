import type { Request, Response } from "express";
import User from "../models/User";
import Token from "../models/Token";
import { generateConfirmationToken, generatePasswordResetToken } from "../utils/jwt";
import { transporter } from "../config/nodemailer";
import { ConfirmEmail } from "../emails/ConfirmEmail";
import { hashPassword } from "../utils/auth";

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        try {
            const { email, rut } = req.body;

            // Check if the user already exists
            const userExists = await User.findOne({ email });

            if(userExists) {
                const error = new Error("El Usuario ya esta Registrado");
                res.status(409).json({ message: error.message });
                return
            }

            const userRutExists = await User.findOne({ rut });

            if(userRutExists) { 
                const error = new Error("El RUT ya esta Registrado");
                res.status(409).json({ message: error.message });
                return
            }

            const user = new User(req.body)

            // Generate a verification token
            const token = new Token();

            token.userId = user.id;
            token.token = generateConfirmationToken({ id: user.id });

            /** Send the Confirmation Email to the Admin */
            ConfirmEmail.sendConfirmationEmailToAdmin({
                email: user.email,
                name: user.name,
                businessName: user.businessName,
                rut: user.rut,
                businessRut: user.businessRut,
                address: user.address,
                phone: user.phone,
                token: token.token
            });

            // Save the user in the DB
            await Promise.allSettled([user.save(), token.save()]);

            res.status(201).json({ message: "Usuario Creado Exitosamente, Hemos enviado su solicitud de verificación." })
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" })
        }
    }

    static confirmUser = async (req: Request, res: Response) => {
        try {
            // Validate received token
            const { token } = req.params;
            //console.log(token)

            // Find the token in the DB
            const tokenRecord = await Token.findOne({ token, type: "admin_confirmation" });
            if(!tokenRecord) {
                const error = new Error("Token no encontrado");
                res.status(404).json({ message: error.message });
                return
            }

            // Find the user in the DB
            const user = await User.findById(tokenRecord.userId);
            if(!user) {
                const error = new Error("Usuario no encontrado");
                res.status(404).json({ message: error.message });
                return
            }

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
            await Token.create({
                userId: user.id,
                token: generatePasswordResetToken({ id: user.id }),
                type: "password_reset"
            });

            ConfirmEmail.sendConfirmationEmailToUser({
                email: user.email,
                name: user.name,
                token: tokenRecord.token
            });

            res.status(200).json({ message: "Usuario Confirmado y Email enviado para crear contraseña" })
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" })
        }
    }

    static createPassword = async (req: Request, res: Response) => {
        try {
            const { token } = req.params;

            // Find the token in the DB
            const tokenRecord = await Token.findOne({ token, type: "password_reset" });
            if(!tokenRecord) {
                const error = new Error("Token no encontrado");
                res.status(404).json({ message: error.message });
                return
            }

            // Find the user in the DB
            const user = await User.findById(tokenRecord.userId);
            if(!user) {
                const error = new Error("Usuario no encontrado");
                res.status(404).json({ message: error.message });
                return
            }

            // Verify if the user is already confirmed
            if(!user.confirmed) {
                const error = new Error("El Usuario no esta Confirmado");
                res.status(409).json({ message: error.message });
                return
            }

            // Verify if the user has already set the password
            if(user.passwordSet) {
                const error = new Error("La Contraseña ya esta Establecida");
                res.status(409).json({ message: error.message });
                return
            }

            // Set the password & Delete the token
            user.password = await hashPassword(req.body.password);
            user.passwordSet = true;

            // Delete the token
            await Promise.allSettled([
                user.save(),
                tokenRecord.deleteOne()
            ]);

            res.status(200).json({ message: "Contraseña Establecida Exitosamente, inicie sesión" })
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" })
        }
    }

    // Login
    
}