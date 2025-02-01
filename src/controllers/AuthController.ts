import type { Request, Response } from "express";

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        try {
            res.send("OK")
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error" })
        }
    }
}