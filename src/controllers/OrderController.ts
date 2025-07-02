import type { Request, Response } from "express";
import User from "../models/User";
import { OrderEmail } from "../emails/OrderEmail";

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
    static sendOrderEmails = async (req: Request, res: Response) => {
        try {
            const orderData: OrderData = req.body;
            const { clientEmail } = orderData;
            
            const authUser = req.user; // Usuario autenticado

            // 🔍 Validar que el email ingresado es el mismo que el del usuario autenticado
            const orderUser = await User.findOne({ email: clientEmail });
            
            if (!orderUser || orderUser.email !== authUser.email) {
                res.status(403).json({ 
                    message: "No tienes permiso para generar órdenes con este email." 
                });
                return;
            }
            
            // Enviar ambos correos en paralelo y manejar resultados
            const [clientEmailResult, adminEmailResult] = await Promise.allSettled([
                OrderEmail.sendOrderEmailToClient(orderData),
                OrderEmail.sendOrderEmailToAdmin(orderData)
            ]);

            // Analizar resultados
            const clientEmailSuccess = clientEmailResult.status === 'fulfilled';
            const adminEmailSuccess = adminEmailResult.status === 'fulfilled';

            // Log errores para debugging (opcional)
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