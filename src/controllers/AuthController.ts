import type { Request, Response } from "express";
import User from "../models/User";
import Token from "../models/Token";
import { generateAdminJWT, generateConfirmationToken, generateJWT, generatePasswordResetToken } from "../utils/jwt";
import { ConfirmEmail } from "../emails/ConfirmEmail";
import { comparePassword, hashPassword } from "../utils/auth";
import { RequestConflictError } from "../errors/conflict-error";
import { InternalServerError } from "../errors/server-error";
import { NotFoundError } from "../errors/not-found";
import { NotAuthorizedError } from "../errors/not-authorized";

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        try {
            const user = new User(req.body)

            // Generate a verification token
            const token = new Token();

            token.userId = user.id;
            token.token = generateConfirmationToken({ id: user.id });

            /** Send the Confirmation Email to the Admin */
            ConfirmEmail.sendConfirmationEmailToAdmin({
                userId: user.id,
                email: user.email,
                name: user.name,
                businessName: user.businessName,
                rut: user.rut,
                businessRut: user.businessRut,
                address: user.address,
                phone: user.phone,
                token: token.token
            });

            ConfirmEmail.sendAcknowledgementEmail({
                email: user.email,
                name: user.name, 
                token: token.token
            })

            // Save the user in the DB
            await Promise.allSettled([user.save(), token.save()]);

            res.status(201).json({ message: "Usuario Creado Exitosamente, Hemos enviado su solicitud de verificación." })
        } catch (error) {
            throw new InternalServerError
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {
            const token = req.params;
            
            // Se valida la existencia del token en el middleware

            res.status(200).json({ 
                success: true,
                message: "Token Valido, Configure su contraseña"
            })
        } catch (error) {
            throw new InternalServerError
        }
    }

    static createPassword = async (req: Request, res: Response) => {
        try {
            const { token } = req.params;

            // Find the token in the DB
            const tokenRecord = await Token.findOne({ token, type: "password_reset" });

            // Find the user in the DB
            const user = await User.findById(tokenRecord.userId);

            // Verify if the user is already confirmed
            if(!user.confirmed) {
                throw new RequestConflictError("El Usuario no esta Confirmado")
            }

            // Verify if the user has already set the password
            if(user.passwordSet) {
                throw new RequestConflictError("La Contraseña ya esta establecida")
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
            throw new InternalServerError
        }
    }

    // Login
    static login = async (req: Request, res: Response) => {
        try {
            const { rut, email, password } = req.body;

            const user = await User.findOne({ email });

            if(!user) {
                throw new NotFoundError("El Usuario no Existe")
            }

            const userRut = await User.findOne({ rut });

            if(!userRut) {
                throw new NotFoundError("El RUT no Existe")
            }

            if(!user.confirmed) {
                throw new RequestConflictError("El Usuario no esta Confirmado")
            }

            if(!user.passwordSet) {
                throw new RequestConflictError("La Contraseña no esta Establecida")
            }

            // Compare the password
            const isMatch = await comparePassword(password, user.password);

            /** Check if the passwords match */
            if(!isMatch) {
                throw new NotAuthorizedError("Contraseña Incorrecta")
            }

        // Generar el token dependiendo si es admin o usuario normal
        const payload = { id: user.id, admin: user.admin };
        const token = user.admin ? generateAdminJWT(payload) : generateJWT(payload);

        res.status(200).json({
            message: "Inicio de sesión exitoso",
            admin: user.admin,
            token
        });
        } catch (error) {
            throw new InternalServerError
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body;

            const user = await User.findOne({ email });

            if(!user) {
                const error = new Error("El Usuario no existe");
                res.status(404).json({ message: error.message });
                return
            }

            if(!user.confirmed) {
                const error = new Error("El Usuario no esta Confirmado");
                res.status(409).json({ message: error.message });
                return
            }

            const tokenRecord = await Token.findOne({ userId: user.id, type: "password_reset" });

            if(tokenRecord) {
                await tokenRecord.deleteOne();
            }

            if(!user.passwordSet) {
                // Generate a password reset token
                const passwordResetToken = await Token.create({
                    userId: user.id,
                    token: generatePasswordResetToken({ id: user.id }),
                    type: "password_reset"
                });

                /** Send the Password Reset Email to the User */
                ConfirmEmail.sendConfirmationEmailToUser({
                    email: user.email,
                    name: user.name,
                    token: passwordResetToken.token
                })

                res.status(200).json({ message: "Tu Contraseña no esta Establecida, recibiras un correo para establecerla" });
            } else {
                // Generate a password reset token
                const passwordResetToken = await Token.create({
                    userId: user.id,
                    token: generatePasswordResetToken({ id: user.id }),
                    type: "password_reset"
                });

                /** Send the Password Reset Email to the User */
                ConfirmEmail.sendPasswordResetEmail({
                    email: user.email,
                    name: user.name,
                    token: passwordResetToken.token
                })

                res.status(200).json({ message: "Recibiras un correo para establecer tu contraseña" });
            }
        } catch (error) {
            throw new InternalServerError
        }
    }

    // Reset User Password
    static resetPassword = async (req: Request, res: Response) => {
        try {
            // Saca el token de la url
            const { token } = req.params;
            
            // Find the token in the DB
            const tokenRecord = await Token.findOne({ token, type: "password_reset" });

            // Find the user in the DB
            const user = await User.findById(tokenRecord.userId);

            // Verify if the user is already confirmed
            if(!user.confirmed) {
                const error = new Error("El Usuario no esta Confirmado");
                res.status(409).json({ message: error.message });
                return
            }

            // Set the password & Delete the token
            user.password = await hashPassword(req.body.password);

            // Delete the token
            await Promise.allSettled([
                user.save(),
                tokenRecord.deleteOne()
            ]);

            res.status(200).json({ message: "Contraseña Reestablecida Exitosamente, inicie sesión" });
        } catch (error) {
            throw new InternalServerError
            return
        }
    }
}