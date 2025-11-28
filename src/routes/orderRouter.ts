import { Router } from "express";
import { authenticate, authorizeAdmin } from "../middleware/auth";
import { body, param, query } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { OrderController } from "../controllers/OrderController";

const router = Router();



//? Order Router CRUD

//* Get Orders | USER
router.get("/user", 
    query("status")
        .optional()
        .isIn(["Pendiente", "pendiente", "En Transito", "en transito", "Entregado", "entregado", "Cancelado", "cancelado"])
        .withMessage("Estado inválido"),
    authenticate, 
    handleInputErrors,
    OrderController.getOrdersUser
)

//* Get Order by ID | USER
router.get("/user/:orderId", 
    param("orderId")
        .isMongoId().withMessage("ID de orden Inválido")
        .notEmpty().withMessage("El ID de la Orden es Obligatorio"),
    authenticate, 
    handleInputErrors, 
    OrderController.getOrderByIdUser
)

//* Get Orders | ADMIN
router.get('/', 
    query("status")
        .optional()
        .isIn(["Pendiente", "pendiente", "En Transito", "en transito", "Entregado", "entregado", "Cancelado", "cancelado"])
        .withMessage("Estado inválido"),
    query("country")
        .optional()
        .trim()
        .isString()
        .withMessage("El País debe ser un texto válido"),
    authenticate, 
    authorizeAdmin,
    handleInputErrors,
    OrderController.getOrdersAdmin
);

//* Get Order by ID | ADMIN
router.get("/:orderId", 
    param("orderId")
        .isMongoId().withMessage("ID de orden Inválido")
        .notEmpty().withMessage("El ID de la Orden es Obligatorio"),
    authenticate, 
    authorizeAdmin, 
    handleInputErrors, 
    OrderController.getOrderByIdAdmin
)


//^ Create Order
router.post("/", 
    // Validate items array
    body("items")
        .isArray({ min: 1 })
        .withMessage("La orden debe contener al menos un producto"),
    
    // Validate each item's SKU
    body("items.*.sku")
        .notEmpty()
        .withMessage("El SKU del producto es obligatorio")
        .trim()
        .isString()
        .withMessage("El SKU debe ser un texto válido"),
    
    // Validate each item's name
    body("items.*.name")
        .notEmpty()
        .withMessage("El nombre del producto es obligatorio")
        .trim()
        .isString()
        .withMessage("El nombre debe ser un texto válido"),
    
    // Validate each item's price
    body("items.*.price")
        .notEmpty()
        .withMessage("El precio del producto es obligatorio")
        .isFloat({ min: 0 })
        .withMessage("El precio debe ser un número mayor o igual a 0"),
    
    // Validate each item's quantity
    body("items.*.quantity")
        .notEmpty()
        .withMessage("La cantidad del producto es obligatoria")
        .isInt({ min: 1 })
        .withMessage("La cantidad debe ser un número entero mayor a 0"),
    
    // Validate each item's lineTotal
    body("items.*.lineTotal")
        .notEmpty()
        .withMessage("El total de línea es obligatorio")
        .isFloat({ min: 0 })
        .withMessage("El total de línea debe ser un número mayor o igual a 0")
        .custom((lineTotal, { req, path }) => {
            // Extract the index from the path (e.g., "items[0].lineTotal" -> 0)
            const match = path.match(/items\[(\d+)\]/);
            if (match) {
                const index = parseInt(match[1]);
                const item = req.body.items[index];
                const calculatedTotal = item.price * item.quantity;
                
                // Allow small floating point differences
                if (Math.abs(lineTotal - calculatedTotal) > 0.01) {
                    throw new Error(`El total de línea debe ser igual a precio × cantidad (${calculatedTotal.toFixed(2)})`);
                }
            }
            return true;
        }),
    
    // Validate payment
    body("payment")
        .notEmpty()
        .withMessage("El Método de Pago es Obligatorio")
        .trim()
        .isString()
        .withMessage("El método de pago debe ser un texto válido"),
    
    // Validate shipper
    body("shipper")
        .notEmpty()
        .withMessage("El Expedidor es Obligatorio")
        .trim()
        .isString()
        .withMessage("El expedidor debe ser un texto válido"),

    // Validate country
    body("country")
        .notEmpty()
        .withMessage("El País es Obligatorio")
        .trim()
        .isString()
        .withMessage("El país debe ser un texto válido"),
    
    // Validate total
    body("total")
        .notEmpty()
        .withMessage("El total de la orden es obligatorio")
        .isFloat({ min: 0 })
        .withMessage("El total debe ser un número mayor o igual a 0")
        .custom((total, { req }) => {
            // Validate that total matches sum of all lineTotal values
            const calculatedTotal = req.body.items.reduce(
                (sum: number, item: any) => sum + (item.lineTotal || 0), 
                0
            );
            
            // Allow small floating point differences
            if (Math.abs(total - calculatedTotal) > 0.01) {
                throw new Error(`El total debe ser igual a la suma de todos los productos (${calculatedTotal.toFixed(2)})`);
            }
            return true;
        }),
    
    // Validate userId
    body("userId")
        .notEmpty()
        .withMessage("El ID de usuario es obligatorio")
        .isMongoId()
        .withMessage("El ID de usuario no es válido"),

    body("businessName")
        .notEmpty()
        .withMessage("El Nombre de la Empresa es Obligatorio"),
    body("businessRut")
        .notEmpty().withMessage("El RUT de la Empresa es obligatorio")
        .matches(/^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/)
        .withMessage("Formato de RUT de la empresa inválido. Ejemplo: 12.345.678-9"),
    handleInputErrors,
    authenticate, 
    authorizeAdmin, 
    OrderController.createOrder
)

//~ Update Order | ADMIN
router.patch("/:orderId", 
    param("orderId")
        .isMongoId().withMessage("ID de orden Inválido")
        .notEmpty().withMessage("El ID de la Orden es Obligatorio"), 

    // Validate items array
    body("items")
        .optional()
        .isArray({ min: 1 })
        .withMessage("La orden debe contener al menos un producto"),
    
    // Validate each item's SKU
    body("items.*.sku")
        .optional()
        .notEmpty()
        .withMessage("El SKU del producto es obligatorio")
        .trim()
        .isString()
        .withMessage("El SKU debe ser un texto válido"),
    
    // Validate each item's name
    body("items.*.name")
        .optional()
        .notEmpty()
        .withMessage("El nombre del producto es obligatorio")
        .trim()
        .isString()
        .withMessage("El nombre debe ser un texto válido"),
    
    // Validate each item's price
    body("items.*.price")
        .optional()
        .notEmpty()
        .withMessage("El precio del producto es obligatorio")
        .isFloat({ min: 0 })
        .withMessage("El precio debe ser un número mayor o igual a 0"),
    
    // Validate each item's quantity
    body("items.*.quantity")
        .optional()
        .notEmpty()
        .withMessage("La cantidad del producto es obligatoria")
        .isInt({ min: 1 })
        .withMessage("La cantidad debe ser un número entero mayor a 0"),
    
    // Validate each item's lineTotal
    body("items.*.lineTotal")
        .optional()
        .notEmpty()
        .withMessage("El total de línea es obligatorio")
        .isFloat({ min: 0 })
        .withMessage("El total de línea debe ser un número mayor o igual a 0")
        .custom((lineTotal, { req, path }) => {
            // Extract the index from the path (e.g., "items[0].lineTotal" -> 0)
            const match = path.match(/items\[(\d+)\]/);
            if (match) {
                const index = parseInt(match[1]);
                const item = req.body.items[index];
                const calculatedTotal = item.price * item.quantity;
                
                // Allow small floating point differences
                if (Math.abs(lineTotal - calculatedTotal) > 0.01) {
                    throw new Error(`El total de línea debe ser igual a precio × cantidad (${calculatedTotal.toFixed(2)})`);
                }
            }
            return true;
        }),
    
    // Validate payment
    body("payment")
        .optional()
        .notEmpty()
        .withMessage("El Método de Pago es Obligatorio")
        .trim()
        .isString()
        .withMessage("El método de pago debe ser un texto válido"),

    body("status")
        .optional() 
        .notEmpty()
        .withMessage("El Estado de la Orden no puede ir Vacío")
        .trim()
        .isString()
        .withMessage("El Estado de la Orden debe ser un texto válido")
            .isIn(["Pendiente", "Entregado", "Cancelado", "En Transito"]).withMessage("Estado de la Orden Inválido"),
    
    // Validate shipper
    body("shipper")
        .optional()
        .notEmpty()
        .withMessage("El Expedidor es Obligatorio")
        .trim()
        .isString()
        .withMessage("El Expedidor debe ser un texto válido"),

    // Validate country
    body("country")
        .optional()
        .notEmpty()
        .withMessage("El País es Obligatorio")
        .trim()
        .isString()
        .withMessage("El país debe ser un texto válido"),
    
    // Validate total
    body("total")
        .optional()
        .notEmpty()
        .withMessage("El total de la orden es obligatorio")
        .isFloat({ min: 0 })
        .withMessage("El total debe ser un número mayor o igual a 0")
        .custom((total, { req }) => {
            // Validate that total matches sum of all lineTotal values
            const calculatedTotal = req.body.items.reduce(
                (sum: number, item: any) => sum + (item.lineTotal || 0), 
                0
            );
            
            // Allow small floating point differences
            if (Math.abs(total - calculatedTotal) > 0.01) {
                throw new Error(`El total debe ser igual a la suma de todos los productos (${calculatedTotal.toFixed(2)})`);
            }
            return true;
        }),
    
    // Validate userId
    body("userId")
        .optional()
        .notEmpty()
        .withMessage("El ID de usuario es obligatorio")
        .isMongoId()
        .withMessage("El ID de usuario no es válido"),
    
    body("businessName")
        .optional()
        .notEmpty()
        .withMessage("El Nombre de la Empresa es Obligatorio"),

    body("businessRut")
        .optional()
        .notEmpty().withMessage("El RUT de la Empresa es obligatorio")
        .matches(/^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/)
        .withMessage("Formato de RUT de la empresa inválido. Ejemplo: 12.345.678-9"),

    handleInputErrors, 
    authenticate, 
    authorizeAdmin, 
    OrderController.updateOrder
)

//~ Update Order status | ADMIN
router.patch("/status/:orderId", 
    param("orderId")
        .isMongoId().withMessage("ID de orden Inválido")
        .notEmpty().withMessage("El ID de la Orden es Obligatorio"), 
    body("status")
        .notEmpty()
        .withMessage("El Estado de la Orden no puede ir Vacío")
        .trim()
        .isString()
        .withMessage("El Estado de la Orden debe ser un texto válido")
            .isIn(["Pendiente", "Entregado", "Cancelado", "En Transito"]).withMessage("Estado de la Orden Inválido"),
    handleInputErrors, 
    authenticate, 
    authorizeAdmin, 
    OrderController.updateOrderStatus
)

//! Delete Order | ADMIN
router.delete("/:orderId", 
    param("orderId")
        .isMongoId().withMessage("ID de orden Inválido")
        .notEmpty().withMessage("El ID de la Orden es Obligatorio"), 
    handleInputErrors, 
    authenticate, 
    authorizeAdmin, 
    OrderController.deleteOrder
)

//? Send Order Emails

// Send Order Email to Admin & Client on Order Submission
router.post(
	"/send",
	body("token").notEmpty().withMessage("El Token de la Orden es Obligatorio"),
	body("clientName")
		.notEmpty()
		.withMessage("El Nombre del Cliente es Obligatorio"),
	body("clientEmail")
		.notEmpty()
		.withMessage("El Email del Cliente es Obligatorio")
		.isEmail(),
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
	authenticate,
	OrderController.sendOrderEmails
);

export default router;
