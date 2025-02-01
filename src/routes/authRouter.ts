import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";

const router = Router();

// Auth Routes

router.post("/create-account", 
    body("name")
        .notEmpty().withMessage("El Nombre es obligatorio"),
    body("rut")
        .notEmpty().withMessage("El RUT es obligatorio"),
    body("email")
        .notEmpty().withMessage("El Email es obligatorio")
        .isEmail().withMessage("El Email no es válido"),
    AuthController.createAccount
)

export default router