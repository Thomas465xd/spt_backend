import type { Request, Response } from "express";
import User from "../models/User";
import Token from "../models/Token";
import { generateConfirmationToken } from "../utils/jwt";
import { transporter } from "../config/nodemailer";
import { ConfirmEmail } from "../emails/ConfirmEmail";

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

            // Save the user 
            await Promise.allSettled([user.save(), token.save()]);

            res.status(201).json({ message: "Usuario Creado Exitosamente, Hemos enviado su solicitud de verificación." })
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" })
        }
    }
}