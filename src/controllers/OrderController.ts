import type { Request, Response } from "express";
import User, { UserInterface } from "../models/User";
import { OrderEmail } from "../emails/OrderEmail";
import { ForbiddenError } from "../errors/forbidden-error";
import Order, { OrderStatus } from "../models/Order";
import { NotFoundError } from "../errors/not-found";
import { OrderStatusEmail } from "../emails/status";

interface OrderData {
    token: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    clientCountry: string;
    clientState: string;
    clientCityZone: string;
    clientStreet: string;
    clientPostcode: string;
    clientBuildingNumber: string;
    shippingCost: number;
    total: number;
    cartDetails: any[];
}

export class OrderController {
    //* Get all Registered Orders | ADMIN
    static getOrdersAdmin = async (req: Request, res: Response) => {
        // Get the page and perPage query parameters (default values if not provided)
        const page = parseInt(req.query.page as string) || 1;
        const perPage = parseInt(req.query.perPage as string) || 10;

        // Search Filters
        const filters: any = {};

        //! filter orders by businessRut | CRITICAL
        if (req.query.businessRut) {
            // Extract only numbers and the verification digit
            const cleanRut = String(req.query.businessRut)
                .replace(/[^0-9kK]/g, '') // Keep only numbers and K
                .toUpperCase();
            
            // Search for any businessRut containing these digits
            filters.businessRut = { 
                $regex: new RegExp(cleanRut.split('').join('[.\\-]?'), 'i') 
            };
        }

        //* ?status="cancelled"
        if (req.query.status) {
            const statusMap: Record<string, string> = {
                'pendiente': 'Pendiente',
                'en transito': 'En Transito',
                'entregado': 'Entregado',
                'cancelado': 'Cancelado'
            };
            
            const normalizedStatus = statusMap[String(req.query.status).toLowerCase()];
            if (normalizedStatus) {
                filters.status = normalizedStatus;
            }
        }

        //* ?country=chile
        if (req.query.country) {
            filters.country = { $regex: new RegExp(`^${req.query.country}$`, "i") }
        }

        // Calculate skip and limit for pagination
        const skip = (page - 1) * perPage;
        const limit = perPage;

        // Get the total number of unconfirmed orders
        const totalOrders = await Order.countDocuments(filters);

        // Fetch the orders for the current page with pagination
        const orders = await Order.find(filters) 
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order
            .populate("user");

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalOrders / perPage);

        res.status(200).json({ 
            orders, 
            totalOrders,
            totalPages, 
            perPage, 
            currentPage: page 
        });
    }

    //* Get ANY Specific Order by it's ID | ADMIN
    static getOrderByIdAdmin = async (req: Request, res: Response) => {
        const { orderId } = req.params; 

        const order = await Order.findById(orderId).populate("user"); 
        if(!order) {
            throw new NotFoundError("Orden no Encontrada")
        }

        res.status(200).json(order)
    }

    //*  Get all Registered Orders under the same businessRut attached to the user
    static getOrdersUser = async (req: Request, res: Response) => {
        //! Get the current user
        const userBusinessRut = req.user.businessRut; 

        // Get the page and perPage query parameters (default values if not provided)
        const page = parseInt(req.query.page as string) || 1;
        const perPage = parseInt(req.query.perPage as string) || 10;

        // Search Filters
        const filters: any = {};

        //! filter orders by businessRut | CRITICAL
        // Extract only numbers and the verification digit
        const cleanRut = String(userBusinessRut)
            .replace(/[^0-9kK]/g, '') // Keep only numbers and K
            .toUpperCase();
        
        // Search for any businessRut containing these digits
        filters.businessRut = { 
            $regex: new RegExp(cleanRut.split('').join('[.\\-]?'), 'i') 
        };

        //* ej. ?status="cancelled"
        if (req.query.status) {
            const statusMap: Record<string, string> = {
                'pendiente': 'Pendiente',
                'en transito': 'En Transito',
                'entregado': 'Entregado',
                'cancelado': 'Cancelado'
            };
            
            const normalizedStatus = statusMap[String(req.query.status).toLowerCase()];
            if (normalizedStatus) {
                filters.status = normalizedStatus;
            }
        }

        //* ej. ?orderId={ObjectId}
        if(req.query.orderId) {
            filters._id = req.query.orderId; 
        }

        //* ej. ?country=chile
        if (req.query.country) {
            filters.country = { $regex: new RegExp(`^${req.query.country}$`, "i") }
        }

        // Calculate skip and limit for pagination
        const skip = (page - 1) * perPage;
        const limit = perPage;

        // Get the total number of unconfirmed orders
        const totalOrders = await Order.countDocuments(filters);

        // Fetch the orders for the current page with pagination
        const orders = await Order.find(filters) 
            .skip(skip)
            .limit(limit)
            .populate("user")
            .sort({ createdAt: -1 }) // Sort by createdAt in descending order

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalOrders / perPage);

        res.status(200).json({ 
            orders, 
            totalOrders,
            totalPages, 
            businessRut: userBusinessRut,
            perPage, 
            currentPage: page 
        });
    }

    //* Get a single order registered under the businessRut attached to the current logged user
    static getOrderByIdUser = async (req: Request, res: Response) => {
        const { orderId } = req.params; 
        const businessRut = req.user.businessRut; 

        //! Critical for the search
        const order = await Order.findOne({ _id: orderId, businessRut }).populate("user"); 
        if(!order) {
            throw new NotFoundError("Orden no Encontrada")
        }

        res.status(200).json(order)
    }

    //^ CREATE ORDER
    static createOrder = async (req: Request, res: Response) => {
        const { items, payment, shipper, trackingNumber, country, user, businessName, businessRut, total, estimatedDelivery } = req.body; 

        // Check if user exists
        const userExists = await User.findById(user); 
        if(!userExists) {
            throw new NotFoundError("User not Found")
        }

        // Create the Order
        const order = await Order.build({
            items, 
            payment, 
            shipper, 
            country, 
            user,
            businessName, 
            businessRut,
            trackingNumber,
            total, 
            estimatedDelivery
        })
        
        await order.save();

        //TODO: Send Email to the User with registrated order
        await OrderStatusEmail.Pending.send(userExists, order);

        res.status(201).json({ 
            message: "Orden registrada Exitosamente", 
            order 
        })
    }

    //~ UPDATE ORDER | Supports Partial Updates
    static updateOrder = async (req: Request, res: Response) => {
        const { orderId } = req.params; 
    
        const order = await Order.findById(orderId).populate<{ user: UserInterface }>("user");
        if(!order) {
            throw new NotFoundError("Orden no Encontrada")
        }

        // Only update fields that are provided
        const allowedUpdates = [
            'items', 
            'payment', 
            'shipper', 
            'trackingNumber', 
            'country', 
            'user', 
            'businessRut', 
            'businessName', 
            'total', 
            'status', 
            'estimatedDelivery', 
            'deliveredAt'
        ];
        
        const updates = Object.keys(req.body)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => {
                obj[key] = req.body[key];
                return obj;
            }, {} as any);

        //! CRITICAL: IF STATUS IS BEING PROVIDED, MANAGE EMAIL SENDING 
        // Check if status is being changed
        const statusChanged = updates.status && updates.status !== order.status;
        const oldStatus = order.status;
        const newStatus = updates.status;

        // Apply updates
        order.set(updates);
        await order.save(); 

        // Send email if status was changed
        if (statusChanged) {
            const userData = order.user;
            
            try {
                switch(newStatus) {
                    case OrderStatus.Pending:
                        await OrderStatusEmail.Pending.send(userData, order);
                        break;
                    case OrderStatus.Sent:
                        await OrderStatusEmail.Sent.send(userData, order);
                        break;
                    case OrderStatus.Delivered:
                        await OrderStatusEmail.Delivered.send(userData, order);
                        break;
                    case OrderStatus.Cancelled:
                        await OrderStatusEmail.Cancelled.send(userData, order);
                        break;
                }

                console.log(`Status email sent: ${oldStatus} → ${newStatus} for order ${orderId}`);
            } catch (emailError) {
                // Log email error but don't fail the request
                console.error("Error sending status update email:", emailError);
                // Email failed but order was updated successfully
            }
        }

        res.status(200).json({ 
            message: "Orden Actualizada Exitosamente", 
            order
        })
    }

    //~ UPDATE ORDER STATUS
    static updateOrderStatus = async (req: Request, res: Response) => {
        const { orderId } = req.params; 
        const { status } = req.body; // Validated in the router
    
        const order = await Order.findById(orderId).populate<{ user: UserInterface }>("user");
        if(!order) {
            throw new NotFoundError("Orden no Encontrada")
        }

        // Set order Status
        order.status = status; 

        // Get the user info from the populted user info
        const userData = order.user; 

        // Save before sending emails (in case email fails, status is still updated)
        await order.save(); 

        //! CRITICAL: EMAIL SENDING LOGIC DEPENDING ON THE STATUSES
        try {
            switch(status) {
                case OrderStatus.Pending:
                    await OrderStatusEmail.Pending.send(userData, order);
                    break;
                case OrderStatus.Sent:
                    await OrderStatusEmail.Sent.send(userData, order);
                    break;
                case OrderStatus.Delivered:
                    await OrderStatusEmail.Delivered.send(userData, order);
                    break;
                case OrderStatus.Cancelled:
                    await OrderStatusEmail.Cancelled.send(userData, order);
                    break;
            }
        } catch (emailError) {
            // Log email error but don't fail the request
            console.error("Error sending status update email:", emailError);
            // Email failed but order status was updated successfully
        }

        res.status(200).json({ 
            message: "Estado de la Orden Actualizado Exitosamente", 
            order
        });
    }

    //! DELETE ORDER
    static deleteOrder = async (req: Request, res: Response) => {
        const { orderId } = req.params; 

        const order = await Order.findById(orderId); 
        if(!order) {
            throw new NotFoundError("Orden no Encontrada")
        }

        await order.deleteOne(); 

        res.status(200).json({ message: "Orden Eliminada Correctamente" })
    }

    static sendOrderEmails = async (req: Request, res: Response) => {
        try {
            const orderData: OrderData = req.body;
            const { clientEmail } = orderData;
            
            const authUser = req.user; // Usuario autenticado

            // 🔍 Validar que el email ingresado es el mismo que el del usuario autenticado
            const orderUser = await User.findOne({ email: clientEmail });
            
            if (!orderUser || orderUser.email !== authUser.email) {
                throw new ForbiddenError("No tienes permiso para generar órdenes con este email.");
            }
            
            // Enviar ambos correos en paralelo y manejar resultados
            const [clientEmailResult, adminEmailResult] = await Promise.allSettled([
                OrderEmail.sendOrderEmailToClient(orderData),
                OrderEmail.sendOrderEmailToAdmin(orderData)
            ]);

            // Analizar resultados
            const clientEmailSuccess = clientEmailResult.status === 'fulfilled';
            const adminEmailSuccess = adminEmailResult.status === 'fulfilled';

            //* Debugging Console Logs
            if (!clientEmailSuccess) {
                console.error('Failed to send client email:', clientEmailResult.reason);
            }
            if (!adminEmailSuccess) {
                console.error('Failed to send admin email:', adminEmailResult.reason);
            }

            // Determinar respuesta basada en los resultados
            if (clientEmailSuccess && adminEmailSuccess) {
                // ✅ Ambos correos enviados exitosamente
                res.status(200).json({ 
                    message: "Correos enviados exitosamente.", 
                    token: orderData.token,
                    emailStatus: {
                        client: 'sent',
                        admin: 'sent'
                    }
                });
            } else if (clientEmailSuccess && !adminEmailSuccess) {
                // ⚠️ Email del cliente enviado, pero falló el del admin
                res.status(207).json({ // 207 Multi-Status
                    message: "Email enviado al cliente. Notificación al administrador pendiente.",
                    token: orderData.token,
                    emailStatus: {
                        client: 'sent',
                        admin: 'failed'
                    }
                });
            } else if (!clientEmailSuccess && adminEmailSuccess) {
                // ⚠️ Email del admin enviado, pero falló el del cliente
                res.status(207).json({
                    message: "Notificación al administrador enviada. Email de confirmación al cliente pendiente.",
                    token: orderData.token,
                    emailStatus: {
                        client: 'failed',
                        admin: 'sent'
                    }
                });
            } else {
                // ❌ Ambos correos fallaron
                res.status(500).json({
                    message: "Error al enviar los correos de confirmación. La orden fue procesada pero los emails fallarón.",
                    token: orderData.token,
                    emailStatus: {
                        client: 'failed',
                        admin: 'failed'
                    }
                });
            }
            
        } catch (error) {
            console.error('OrderController.sendOrderEmails error:', error);
            
            // Manejar errores específicos
            if (error.name === 'ValidationError') {
                res.status(400).json({ 
                    message: "Datos de la orden inválidos." 
                });
            } else if (error.name === 'CastError') {
                res.status(400).json({ 
                    message: "Formato de datos incorrecto." 
                });
            } else {
                // Error genérico sin exponer detalles internos
                res.status(500).json({ 
                    message: "Error interno del servidor. Por favor, inténtalo de nuevo." 
                });
            }
            return;
        }
    }
}