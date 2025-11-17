import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { CustomError } from "../errors/custom-error";
// import { RequestValidationError } from "../errors/request-validation";
// import { DatabaseConnectionError } from "../errors/database-connection";

export const errorHandler: ErrorRequestHandler = (
    error: Error, 
    req: Request, 
    res: Response, 
    next: NextFunction
): void => {
    //? General Error handling regardless of the Error Subclass
    if (error instanceof CustomError) {
        res.status(error.statusCode).json({ errors: error.serializeErrors() });
        return;
    }

    /*
        if (error instanceof RequestValidationError) {
            res.status(error.statusCode).json({ errors: error.serializeErrors() });
            return;
        }

        if(error instanceof DatabaseConnectionError) {
            res.status(error.statusCode).json({ errors: error.serializeErrors() });
            return;
        } 
    */

    // if the error has no specific type, then just throw a generic error
    res.status(500).json({ errors: [{
        message: "Internal Server Error"
    }] });
};