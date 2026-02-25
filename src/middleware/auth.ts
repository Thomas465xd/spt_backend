import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { UserInterface } from "../models/User";
import Token, { TokenInterface } from "../models/Token";
import { NotAuthorizedError } from "../errors/not-authorized";
import { NotFoundError } from "../errors/not-found";
import { ForbiddenError } from "../errors/forbidden-error";
import { RequestConflictError } from "../errors/conflict-error";

declare global {
    namespace Express {
        interface Request {
            user?: UserInterface;
            tokenRecord?: TokenInterface; 
        }
    }
}

// Validates for auth token
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
            "_id name businessName idType personalId businessId email phone address admin region city province reference postalCode country discount"
        );
    
        if(!user) {
            throw new NotFoundError("Usuario no Encontrado")
        }
    
        // Agregar usuario a la petición
        req.user = user;
    
        next();
    } catch (error) {
        next(error); // Important: forward errors instead of letting Express catch them
    }
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
    const { email, personalId } = req.body;

    //? Query supported by index ({ email: 1 })
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new RequestConflictError("El Usuario ya está Registrado")
    }

    //? Query supported by index ({ personalId: 1 })
    const userIdExists = await User.findOne({ personalId });
    if (userIdExists) {
        throw new RequestConflictError("La Identificación Personal ya está Registrada"); 
    }

    next();
};

// Checks if the user exists
export const checkUserStatus = async (req: Request, res: Response, next: NextFunction) => {
    const { tokenRecord } = req;

    const user = await User.findById(tokenRecord.userId);
    if (!user) {
        throw new NotFoundError("Usuario no Encontrado")
    }

    req.user = user; // Guardamos el usuario en la request

    next();
};

export const validateToken = (type: "admin_confirmation" | "password_reset") => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const { token } = req.params;

        //? Covered by index ({ token: 1, type: 1 })
        const tokenRecord = await Token.findOne({ token, type });

        if (!tokenRecord) {
            throw new NotFoundError("Token no encontrado o inválido");
        }

        req.tokenRecord = tokenRecord;
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

    // Add user to request
    req.user = user;
    next();
};
