import type { Request, Response } from "express";
import User, { UserInterface } from "../models/User";
import { comparePassword, hashPassword } from "../utils/auth";

export class ProfileController {
    static updateProfile = async (req: Request, res: Response) => {
        try {
            const { name, businessName, email, phone, address } = req.body;

            const user = req.user as UserInterface;

            // Checks if there is another user registered with inputed email
            const emailExists = await User.findOne({ email });
            if(emailExists && emailExists._id.toString() !== user._id.toString()) {
                const error = new Error("El Email ya Esta Registrado");
                res.status(409).json({ message: error.message });
                return
            }

            // Checks if there is another user registered with inputed phone
            const phoneExists = await User.findOne({ phone });
            if(phoneExists && phoneExists._id.toString() !== user._id.toString()) {
                const error = new Error("El Telefono ya Esta Registrado");
                res.status(409).json({ message: error.message });
                return
            }

            user.name = name;
            user.businessName = businessName;
            user.email = email;
            user.phone = phone;
            user.address = address;

            await user.save();

            res.status(200).json({ message: "Perfil Actualizado Exitosamente", user });
        } catch (error) {
            res.status(500).json({ message: "Error Interno del Servidor" });
            return
        }
    }

    static updatePassword = async (req: Request, res: Response) => {
        try {
            const { currentPassword, newPassword } = req.body;

            const user = await User.findById(req.user._id);

            // Checks if password is correct
            const isPasswordCorrect = await comparePassword(currentPassword, user.password);
            if(!isPasswordCorrect) {
                const error = new Error("Contraseña Actual Incorrecta");
                res.status(401).json({ message: error.message });
                return
            }

            user.password = await hashPassword(newPassword);
            await user.save();

            res.status(200).json({ message: "Contraseña Actualizada Exitosamente" })
        } catch (error) {
            res.status(500).json({ message: "Error Interno del Servidor" });
            console.log(error);
            return
        }
    }
}