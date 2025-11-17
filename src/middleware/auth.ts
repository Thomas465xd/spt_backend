import { Request, Response, NextFunction } from "express";
import jwt, { decode } from "jsonwebtoken";
import User, { UserInterface } from "../models/User";
import Token from "../models/Token";
import { NotAuthorizedError } from "../errors/not-authorized";
import { NotFoundError } from "../errors/not-found";
import { InternalServerError } from "../errors/server-error";
import { ForbiddenError } from "../errors/forbidden-error";
import { RequestConflictError } from "../errors/conflict-error";

declare global {
    namespace Express {
        interface Request {
            user?: UserInterface;
        }
    }
}

// Validates for auth token
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    //console.log(authHeader);

    // Validar existencia del header
    if(!authHeader) {
        throw new NotAuthorizedError("No autorizado o Token no proporcionado")
    }

    const token = authHeader.split(" ")[1];

    // Intentar decodificar el token con ambas claves
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.ADMIN_SECRET!);
    } catch {
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET!);
        } catch {
            throw new NotAuthorizedError("Token inválido")
        }
    }

    // Verificar si el token tiene el formato esperado
    if (typeof decoded !== "object" || !decoded.id) {
        throw new NotAuthorizedError("Token inválido")
    }

    // Buscar el usuario por el ID
    const user = await User.findById(decoded.id).select(
        "_id name businessName rut businessRut email phone address admin region city province reference postalCode country discount"
    );

    if(!user) {
        throw new NotFoundError("Usuario no Encontrado")
    }

    // Agregar usuario a la petición
    req.user = user;

    next();
}

// Validates for AdminToken
export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.admin) {
        throw new ForbiddenError("Acceso denegado. Se requieren permisos de administrador.")
    }
    next();
};

// Validates for an already existing users when registering a new one
export const checkExistingUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, rut } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            throw new RequestConflictError("El Usuario ya está Registrado")
        }

        const userRutExists = await User.findOne({ rut });
        if (userRutExists) {
            throw new RequestConflictError("El RUT ya está Registrado"); 
        }

        next();
    } catch (error) {

    }
};

// Checks if the user exists
export const checkUserStatus = async (req: Request, res: Response, next: NextFunction) => {
    const { tokenRecord } = req.body;

    const user = await User.findById(tokenRecord.userId);

    if (!user) {
        throw new NotFoundError("Usuario no Encontrado")
    }

    req.body.user = user; // Guardamos el usuario en la request

    next();
};

// Validates the token
export const validateToken = (type: "admin_confirmation" | "password_reset") => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { token } = req.params;

        const tokenRecord = await Token.findOne({ token, type });

        if (!tokenRecord) {
            throw new NotFoundError("Token no encontrado o inválido")
        }

        req.body.tokenRecord = tokenRecord; // Guardamos el token en la request
        next();
    };
};

// Validates if the user exists based on the id
export const userExists = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const user = await User.findById(id);
    
    if (!user) {
        throw new NotFoundError("Usuario no Encontrado");
    }

    // Agregando el usuario a la petición
    req.user = user;
    next();
};
