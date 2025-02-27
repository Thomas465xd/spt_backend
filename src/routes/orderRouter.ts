import { Router } from "express";
import { authenticate, authorizeAdmin } from "../middleware/auth";
import { body } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { OrderController } from "../controllers/OrderController";

const router = Router();

/* Middleware */
router.use(authenticate);

//? Send Order Emails

// Send Order Email to Admin & Client
router.post(
	"/send",
	body("token").notEmpty().withMessage("El Token de la Orden es Obligatorio"),
	body("clientName")
		.notEmpty()
		.withMessage("El Nombre del Cliente es Obligatorio"),
	body("clientEmail")
		.notEmpty()
		.withMessage("El Email del Cliente es Obligatorio")
		.isEmail()
		.normalizeEmail(),
	body("clientPhone")
		.notEmpty()
		.withMessage("El Telefono del Cliente es Obligatorio"),
	body("pickCode")
		.notEmpty()
		.withMessage("El Codigo de Picking (RUT) es Obligatorio"),
	body("clientCountry")
		.notEmpty()
		.withMessage("El Pais del Cliente es Obligatorio"),
	body("clientState")
		.notEmpty()
		.withMessage("La Región del Cliente es Obligatoria"),
	body("clientStreet")
		.notEmpty()
		.withMessage("La Calle del Cliente es Obligatoria"),
	body("clientCityZone")
		.notEmpty()
		.withMessage("La Ciudad del Cliente es Obligatoria"),
	body("clientPostcode")
		.notEmpty()
		.withMessage("El Codigo Postal del Cliente es Obligatorio"),
	body("clientBuildingNumber")
		.notEmpty()
		.withMessage("El Numero del Edificio del Cliente es Obligatorio"),
	body("shippingCost")
		.notEmpty()
		.withMessage("El Costo de Envío es Obligatorio"),
	body("total").notEmpty().withMessage("El Total de la Orden es Obligatorio"),
	body("cartDetails")
		.notEmpty()
		.withMessage("El Carrito de la Orden es Obligatorio")
		.isArray({ min: 1 }),
	handleInputErrors,
	authorizeAdmin,
	OrderController.sendOrderEmails
);

export default router;
