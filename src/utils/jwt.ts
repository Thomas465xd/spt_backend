import jwt from "jsonwebtoken";
import Types from "mongoose";

// Define the payload structure
type UserPayLoad = {
    id: Types.ObjectId;  // The payload contains a MongoDB ObjectId (user ID)
}

export const generateJWT = (payload: UserPayLoad) => {
    // Generate the JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET!, { 
        expiresIn: "12h"  // Token expires in 1 day (24 hours)
    });

    return token;  // Return the generated token
}