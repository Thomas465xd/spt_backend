import jwt from "jsonwebtoken";
import { Types } from "mongoose";

// Define the payload structure
type UserPayLoad = {
    id: Types.ObjectId;  // The payload contains a MongoDB ObjectId (user ID)
}

// Token for Authentication (Login)
export const generateJWT = (payload: UserPayLoad) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { 
        expiresIn: "12h"  // Token expires in 12 hours
    });
    return token;
}

// Token for Account Confirmation
export const generateConfirmationToken = (payload: UserPayLoad) => {
    const token = jwt.sign(payload, process.env.CONFIRMATION_SECRET!, { 
        expiresIn: "24h"  // Token expires in 24 hours
    });
    return token;
}
