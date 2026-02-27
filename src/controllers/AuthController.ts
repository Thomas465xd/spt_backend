import type { Request, Response } from "express";
import User from "../models/User";
import Token from "../models/Token";
import { generateAdminJWT, generateConfirmationToken, generateJWT, generatePasswordResetToken } from "../utils/jwt";
import { comparePassword, hashPassword } from "../utils/auth";
import { RequestConflictError } from "../errors/conflict-error";
import { NotFoundError } from "../errors/not-found";
import { NotAuthorizedError } from "../errors/not-authorized";
import { AdminEmails } from "../emails/admin";
import { UserEmails } from "../emails/auth";

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        const { 
            name, 
            businessName, 
            idType, 
            personalId, 
            businessId, 
            email, 
            phone, 
            country, 
            address
        } = req.body; 

        const user = User.build({
            name, 
            businessName ,
            idType, 
            personalId, 
            businessId, 
            email, 
            phone, 
            country, 
            address
        })

        // Generate a verification token
        const token = new Token();

        token.userId = user.id;
        token.token = generateConfirmationToken({ id: user.id });

        // Save the user in the DB
        await user.save()
        await token.save()

        /** Send the Confirmation Email to the Admin */
        await AdminEmails.ConfirmUser.send({
            userId: user.id,
            email: user.email,
            name: user.name,
            businessName: user.businessName,
            personalId: user.personalId,
            businessId: user.businessId,
            idType: user.idType,
            country: user.country,
            address: user.address,
            phone: user.phone,
            token: token.token
        });

        await UserEmails.WelcomeEmail.send({
            email: user.email,
            name: user.name, 
            token: token.token
        })

        res.status(201).json({ message: "Usuario Creado Exitosamente, Hemos enviado su solicitud de verificación." })
    }

    static validateToken = async (req: Request, res: Response) => {
        res.status(200).json({ 
            success: true,
            message: "Token Valido, Configure su contraseña"
        })
    }

    static createPassword = async (req: Request, res: Response) => {
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
        await user.save(),
        await tokenRecord.deleteOne()

        res.status(200).json({ message: "Contraseña Establecida Exitosamente, inicie sesión" })
    }

    // Login
    static login = async (req: Request, res: Response) => {
        const { personalId, email, password } = req.body;

        const user = await User.findOne({ email });

        if(!user) {
            throw new NotFoundError("El Usuario no Existe")
        }

        if(!user.personalId === personalId) {
            throw new NotFoundError("Identificación no existe o incorrecta")
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
    }

    static forgotPassword = async (req: Request, res: Response) => {
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
            await UserEmails.ResetPasswordEmail.send({
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
            await UserEmails.ResetPasswordEmail.send({
                email: user.email,
                name: user.name,
                token: passwordResetToken.token
            })

            res.status(200).json({ message: "Recibiras un correo para establecer tu contraseña" });
        }
    }

    // Reset User Password
    static resetPassword = async (req: Request, res: Response) => {
        // Saca el token de la url
        const { token } = req.params;
        
        // Find the token in the DB
        //? Query supported by index ({ token: 1, type: 1 })
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
        user.passwordSet = true // at this point user is certainly confirmed, so guard check to ensure his password is set.
        user.password = await hashPassword(req.body.password);

        // Delete the token
        await user.save(),
        await tokenRecord.deleteOne()

        res.status(200).json({ message: "Contraseña Reestablecida Exitosamente, inicie sesión" });
    }
}