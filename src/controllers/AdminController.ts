import { Request, Response } from "express";
import User from "../models/User";
import Token from "../models/Token";
import { generatePasswordResetToken } from "../utils/jwt";
import { RequestConflictError } from "../errors/conflict-error";
import { InternalServerError } from "../errors/server-error";
import { NotFoundError } from "../errors/not-found";
import { UserEmails } from "../emails/auth";

export class AdminController {
    // Confirm a user by it's token and generate a new token for creating a password 
    static confirmUser = async (req: Request, res: Response) => {
        try {
            // Validate received token
            const { token } = req.params;
            //console.log(token)

            const tokenRecord = await Token.findOne({ token, type: "admin_confirmation" });

            if (!tokenRecord) {
                throw new NotFoundError("Token inválido o expirado");
            }

            // Find the user in the DB
            const user = await User.findById(tokenRecord.userId);

            // Verify if the user is already confirmed
            if(user.confirmed) {
                throw new RequestConflictError("El Usuario ya esta Confirmado")
            }

            // Confirm the user & Delete the token
            user.confirmed = true;
            
            await user.save()
            await tokenRecord.deleteOne()

            // Generate new token for creating the password
            const passwordResetToken = await Token.create({
                userId: user.id,
                token: generatePasswordResetToken({ id: user.id }),
                type: "password_reset"
            });

            /** Send set password instructions to user */
            UserEmails.SetPasswordEmail.send({
                email: user.email,
                name: user.name,
                token: passwordResetToken.token
            });

            res.status(200).json({ message: "Usuario Confirmado y Email enviado para crear contraseña" })
        } catch (error) {
            console.log(error)
            throw new InternalServerError(); 
        }
    }

    static getConfirmedUsers = async (req: Request, res: Response) => {
        try {
            // Get the page and perPage query parameters (default values if not provided)
            const page = parseInt(req.query.page as string) || 1;
            const perPage = parseInt(req.query.perPage as string) || 10;

            // Search Filters
            const searchId = req.query.searchId as string || ""; // Search by personalId or businessId
            const searchEmail = req.query.searchEmail as string || "";

            // Calculate skip and limit for pagination
            const skip = (page - 1) * perPage;
            const limit = perPage;

            // Build query filter
            const query: any = { confirmed: true };

            if (searchId || searchEmail) {
                query.$or = [];
                if (searchId) {
                    query.$or.push(
                        { personalId: new RegExp(searchId, "i") },
                        { businessId: new RegExp(searchId, "i") }
                    );
                }
                if (searchEmail) query.$or.push({ email: new RegExp(searchEmail, "i") });
            }

            // Get the total number of confirmed users
            const totalUsers = await User.countDocuments(query);

            // Fetch the users for the current page with pagination
            const users = await User.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }); // Sort by createdAt in descending order

            // Calculate the total number of pages
            const totalPages = Math.ceil(totalUsers / perPage);
            
            res.status(200).json({ users, totalUsers, totalPages });
        } catch (error) {
            throw new InternalServerError();
        }
    }

    static getUnconfirmedUsers = async (req: Request, res: Response) => {
        try {
            // Get the page and perPage query parameters (default values if not provided)
            const page = parseInt(req.query.page as string) || 1;
            const perPage = parseInt(req.query.perPage as string) || 10;

            // Search Filters
            const searchId = req.query.searchId as string || ""; // Search by personalId or businessId
            const searchEmail = req.query.searchEmail as string || "";

            // Calculate skip and limit for pagination
            const skip = (page - 1) * perPage;
            const limit = perPage;

            // Build query filter
            const query: any = { confirmed: false };

            if (searchId || searchEmail) {
                query.$or = [];
                if (searchId) {
                    query.$or.push(
                        { personalId: new RegExp(searchId, "i") },
                        { businessId: new RegExp(searchId, "i") }
                    );
                }
                if (searchEmail) query.$or.push({ email: new RegExp(searchEmail, "i") });
            }

            // Get the total number of unconfirmed users
            const totalUsers = await User.countDocuments(query);

            // Fetch the users for the current page with pagination
            const users = await User.find(query) 
                .skip(skip)
                .limit(limit)
                .sort({ passwordSet: 1, createdAt: -1 }); // Sort by createdAt in descending order

            // Calculate the total number of pages
            const totalPages = Math.ceil(totalUsers / perPage);

            res.status(200).json({users, totalUsers, totalPages, searchId, searchEmail});
        } catch (error) {
            throw new InternalServerError(); 
        }
    }

    // Get a user by it's mongoDB ID
    static getUserById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params; 

            const user = req.user

            if(!user.confirmed) {
                const { token } = await Token.findOne({ userId: id, type: "admin_confirmation" });
            
                if(!token) {
                    throw new RequestConflictError("El Token del usuario a expirado.")
                }

                res.status(200).json({ user, token });
                return
            }
    
            res.status(200).json({ user });
        } catch (error) {
            throw new InternalServerError(); 
        }
    };

    //Get user by personal ID
    static getUserByIdentification = async (req: Request, res: Response) => {
        const { identificationId } = req.params;

        const user = await User.findOne({ personalId: identificationId });
        if (!user){
            throw new NotFoundError("Usuario no Encontrado")
        }

        res.status(200).json( user );
        return 
    };

    // Get the current authenticated user
    static getAuthenticatedUser = async (req: Request, res: Response) => {
        const user = req.user;

        res.status(200).json( user );
    }

    // Assign a discount to a user | discount is a number between 0 and 100
    static updateUserDiscount = async (req: Request, res: Response) => {
        try {
            const user = req.user;
            //console.log(user)

            user.discount = req.body.discount
            await user.save(); 

            res.status(200).json({ message: "Descuento Asignado Exitosamente"});
        } catch (error) {
            throw new InternalServerError(); 
        }
    }

    static updateUserStatus = async (req: Request, res: Response) => {
        try {
            const user = req.user;
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
            throw new InternalServerError(); 
        }
    }

    static deleteUser = async (req: Request, res: Response) => {
        try {
            const user = req.user; 

            if(user.passwordSet) {
                throw new RequestConflictError("No se puede eliminar un usuario con una contraseña establecida, puedes bloquearlo o desbloquearlo.")
            } else {
                await user.deleteOne();
                await Token.deleteMany({ userId: user.id });
                
                res.status(200).json({ message: "Usuario Eliminado Exitosamente" });
                return
            }
        } catch (error) {
            throw new InternalServerError(); 
        }
    }
}