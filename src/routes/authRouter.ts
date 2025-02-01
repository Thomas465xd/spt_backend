import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";

const router = Router();

// Auth Routes

/* Create Account */
router.post("/create-account", 
    body("name")
        .notEmpty().withMessage("El Nombre es obligatorio"),
    body("businessName")
        .notEmpty().withMessage("El Nombre de la Empresa es obligatorio"),
    body("rut")
        .notEmpty().withMessage("El RUT es obligatorio")
        .matches(/^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/)
        .withMessage("Formato de RUT inválido. Ejemplo: 12.345.678-9"),
    body("businessRut")
        .notEmpty().withMessage("El RUT de la Empresa es obligatorio")
        .matches(/^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/)
        .withMessage("Formato de RUT de la empresa inválido. Ejemplo: 12.345.678-9"),
    body("phone")
        .matches(/^(\+56\s?9\d{8}|9\d{8})$/)
        .withMessage("Formato de teléfono inválido. Example: +56912345678 or 912345678"),
    body("email")
        .notEmpty().withMessage("El Email es obligatorio")
        .isEmail().withMessage("El Email no es válido"),
    body("address")
        .notEmpty().withMessage("La Dirección es obligatoria"),
    handleInputErrors,
    AuthController.createAccount
)

/* Confirm Account */
router.post("/confirm-account",
    body("token")
        .notEmpty().withMessage("El Token de Ingreso es Obligatorio")
)

export default router