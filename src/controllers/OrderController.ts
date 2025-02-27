import type { Request, Response } from "express";
import User from "../models/User";
import { OrderEmail } from "../emails/OrderEmail";

export class OrderController {
    static sendOrderEmails = async (req: Request, res: Response) => {
        try {
            const { 
                token, clientName, clientEmail, clientPhone, clientCountry, clientState, clientCityZone, 
                clientStreet, clientPostcode, clientBuildingNumber, shippingCost, total, cartDetails
            } = req.body;
            
            const authUser = req.user; // Usuario autenticado
            const orderUser = await User.findOne({ email: clientEmail });

            // 🔍 Validar que el email ingresado es el mismo que el del usuario autenticado
            if (!orderUser || orderUser.email !== authUser.email) {
                res.status(403).json({ message: "No tienes permiso para generar órdenes con este email." });
                return
            }
            
            // Enviar ambos correos en paralelo
            await Promise.all([
                OrderEmail.sendOrderEmailToClient({
                    token,
                    clientName,
                    clientEmail,
                    clientPhone,
                    clientCountry,
                    clientState,
                    clientCityZone,
                    clientStreet,
                    clientPostcode,
                    clientBuildingNumber,
                    shippingCost,
                    total,
                    cartDetails
                }),
                OrderEmail.sendOrderEmailToAdmin({
                    token,
                    clientName,
                    clientEmail,
                    clientPhone,
                    clientCountry,
                    clientState,
                    clientCityZone,
                    clientStreet,
                    clientPostcode,
                    clientBuildingNumber,
                    shippingCost,
                    total,
                    cartDetails
                })
            ]);
            
            // ✅ Respuesta exitosa
            res.status(200).json({ message: "Correos enviados exitosamente.", token });
            return
        } catch (error) {
            res.status(500).json({ message: "Internal Server Error", error });
            return;
        }
    }
}
