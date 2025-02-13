import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { authenticate, authorizeAdmin, checkExistingUser, checkUserStatus, userExists, validateToken } from "../middleware/auth";
import { AdminController } from "../controllers/AdminController";

const router = Router();

// Client Auth Routes

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
        .trim()
        .withMessage("Formato de teléfono inválido. Example: +56912345678 or 912345678"),
    body("email")
        .notEmpty().withMessage("El Email es obligatorio")
        .isEmail().withMessage("El Email no es válido")
        .normalizeEmail(),
    body("address")
        .notEmpty().withMessage("La Dirección es obligatoria"),
    handleInputErrors,
    checkExistingUser,
    AuthController.createAccount
)

/** Validate setPassword token */
router.get("/validate-token/:token", 
    param("token")
        .notEmpty().withMessage("El Token de Ingreso es Obligatorio"),
    handleInputErrors,
    validateToken("password_reset"),
    AuthController.validateToken
)

/** Set user password */
router.post("/set-password/:token",
    param("token")
        .notEmpty().withMessage("El Token de Ingreso es Obligatorio"),
    body("password")
        .isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 8 caracteres")
        .trim()
        .escape(), 
    body("confirmPassword")
        .trim()
        .custom((value, { req }) => {
            if(value !== req.body.password) {
                throw new Error("Las contraseñas no coinciden");
            }
            return true
        }),
    handleInputErrors,
    validateToken("password_reset"),
    checkUserStatus,
    AuthController.createPassword
)

/** Login User */
router.post("/login",
    body("rut")
        .notEmpty().withMessage("El RUT es obligatorio")
        .matches(/^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/)
        .withMessage("Formato de RUT inválido. Ejemplo: 12.345.678-9"),
    body("email")
        .notEmpty().withMessage("El Email es obligatorio")
        .isEmail().withMessage("El Email no es válido")
        .normalizeEmail(),
    body("password")
        .notEmpty().withMessage("La contraseña no puede estar vacia"),
    handleInputErrors,
    
    AuthController.login
)

/** Forgot Password */
router.post("/forgot-password", 
    body("email")
        .notEmpty().withMessage("El Email es Obligatorio")
        .isEmail().withMessage("El Email no es Valido")
        .normalizeEmail(),
    handleInputErrors,
    AuthController.forgotPassword
)

/** Reset User Password */
router.post("/reset-password/:token",
    param("token")
        .notEmpty().withMessage("El Token de Ingreso es Obligatorio"),
    body("password")
        .isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 8 caracteres")
        .trim()
        .escape(), 
    body("confirmPassword")
        .notEmpty().withMessage("La confirmación de la contraseña es Obligatoria")
        .trim()
        .custom((value, { req }) => {
            if(value !== req.body.password) {
                throw new Error("Las contraseñas no coinciden");
            }
            return true
        }),
    handleInputErrors,
    validateToken("password_reset"),
    checkUserStatus,
    AuthController.resetPassword
)

//! Admin Auth Routes

/* Confirm Account */
router.post("/admin/confirm/:token",
    param("token")
        .notEmpty().withMessage("El Token de Ingreso es Obligatorio"),
    handleInputErrors,
    validateToken("admin_confirmation"),
    checkUserStatus,
    AdminController.confirmUser
)

/* Get Confirmed Users */
router.get("/admin/users", 
    authenticate,
    authorizeAdmin,
    handleInputErrors,
    AdminController.getConfirmedUsers
)

/** Get Unconfirmed Users */
router.get("/admin/unconfirmed-users",
    authenticate,
    authorizeAdmin,
    handleInputErrors,
    AdminController.getUnconfirmedUsers
)


/* Delete User TO DO*/
router.delete("/admin/delete-user/:id",
    param("id")
        .notEmpty().withMessage("El ID del Usuario es Obligatorio")
        .isMongoId().withMessage("El ID del Usuario no es Valido"),
    authenticate,
    authorizeAdmin,
    handleInputErrors,
    userExists,
    AdminController.deleteUser
)

/* Block User TO DO*/
router.patch("/admin/update-status/:id",
    param("id")
        .notEmpty().withMessage("El ID del Usuario es Obligatorio")
        .isMongoId().withMessage("El ID del Usuario no es Valido"),
    authenticate,
    authorizeAdmin,
    handleInputErrors,
    userExists, // Check if the user exists after handleInputErrors
    AdminController.updateUserStatus
)

// Routes for admin & user

/** Get user by id */
router.get("/admin/user/:id",
    param("id")
        .notEmpty().withMessage("El ID del Usuario es Obligatorio")
        .isMongoId().withMessage("El ID del Usuario no es Valido"),
    authenticate,
    handleInputErrors,
    userExists,
    AdminController.getUserById
)

/** Get authenticated user */
router.get("/user",
    authenticate,
    handleInputErrors,
    AdminController.getAuthenticatedUser
)

export default router