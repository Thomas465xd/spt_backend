import type { Request, Response } from "express";
import User, { UserInterface } from "../models/User";
import { comparePassword, hashPassword } from "../utils/auth";
import { InternalServerError } from "../errors/server-error";
import { NotAuthorizedError } from "../errors/not-authorized";
import { RequestConflictError } from "../errors/conflict-error";

export class ProfileController {
    static updateProfile = async (req: Request, res: Response) => {
        try {
            const { name, businessName, email, phone, address } = req.body;

            const user = req.user as UserInterface;

            // Checks if there is another user registered with inputed email
            const emailExists = await User.findOne({ email });
            if(emailExists && emailExists._id.toString() !== user._id.toString()) {
                throw new RequestConflictError("Este Email ya esta Registrado")
            }

            // Checks if there is another user registered with inputed phone
            const phoneExists = await User.findOne({ phone });
            if(phoneExists && phoneExists._id.toString() !== user._id.toString()) {
                throw new RequestConflictError("Este Teléfono ya esta Registrado")
            }

            user.name = name;
            user.businessName = businessName;
            user.email = email;
            user.phone = phone;
            user.address = address;

            await user.save();

            res.status(200).json({ message: "Perfil Actualizado Exitosamente", user });
        } catch (error) {
            throw new InternalServerError
        }
    }

    static updateExtraInfo = async (req: Request, res: Response) => {
        try {
            const user = req.user as UserInterface;
            const { country, region, city, province, reference, postalCode } = req.body;

            if(!country && !region && !city && !province && !reference && !postalCode) {
                const error = new Error("No se proporcionaron datos");
                res.status(400).json({ message: error.message });
                return
            }

            user.country = country;
            user.region = region;
            user.city = city;
            user.province = province;
            user.reference = reference;
            user.postalCode = postalCode;

            user.save();

            res.status(200).json({ message: "Información Adicional Actualizada Exitosamente", user });
        } catch (error) {
            throw new InternalServerError
        }
    }

    static updatePassword = async (req: Request, res: Response) => {
        try {
            const { currentPassword, newPassword } = req.body;

            const user = await User.findById(req.user._id);

            // Checks if password is correct
            const isPasswordCorrect = await comparePassword(currentPassword, user.password);
            if(!isPasswordCorrect) {
                throw new NotAuthorizedError("Contraseña Actual Incorrecta")
            }

            user.password = await hashPassword(newPassword);
            await user.save();

            res.status(200).json({ message: "Contraseña Actualizada Exitosamente" })
        } catch (error) {
            throw new InternalServerError
        }
    }
}