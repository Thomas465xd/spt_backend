import resend from "../../config/resend";
import { InternalServerError } from "../../errors/server-error";
import { OrderInterface } from "../../models/Order";
import { UserInterface } from "../../models/User";

export class PendingOrderEmail {
    static sendPendingOrderEmail = async (user: UserInterface, order: OrderInterface) => { 
        try {
            // Format price helper
            const formatPrice = (amount: number) => {
                return new Intl.NumberFormat('es-CL', {
                    style: 'currency',
                    currency: 'CLP'
                }).format(amount);
            };

            // Format date helper
            const formatDate = (date: Date) => {
                return new Date(date).toLocaleDateString('es-CL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            };

            // Generate items HTML
            const itemsHTML = order.items.map(item => `
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f1f1;">
                        <div style="font-weight: 600; color: #1a1a1a; margin-bottom: 4px;">${item.name}</div>
                        <div style="font-size: 13px; color: #666;">SKU: ${item.sku}</div>
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f1f1; text-align: center; color: #1a1a1a;">
                        ${item.quantity}
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f1f1; text-align: right; color: #1a1a1a;">
                        ${formatPrice(item.price)}
                    </td>
                    <td style="padding: 12px; border-bottom: 1px solid #f1f1f1; text-align: right; font-weight: 600; color: #ff6600;">
                        ${formatPrice(item.lineTotal)}
                    </td>
                </tr>
            `).join('');

            const emailHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orden Registrada - SPT</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    
                    <!-- Header with Orange Background -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #ff6600 0%, #ff8533 100%); padding: 40px 30px; text-align: center;">
                            <div style="background-color: #ffffff; display: inline-block; padding: 15px 25px; border-radius: 50px; margin-bottom: 20px;">
                                <h1 style="margin: 0; color: #ff6600; font-size: 28px; font-weight: bold;">SPT</h1>
                                <p style="margin: 0; color: #666; font-size: 12px; letter-spacing: 1px;">SPARE PARTS TRADE</p>
                            </div>
                            <h2 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">¡Orden Registrada! 🎉</h2>
                            <p style="margin: 10px 0 0 0; color: #fff; font-size: 16px; opacity: 0.95;">Tu pedido ha sido recibido correctamente</p>
                        </td>
                    </tr>

                    <!-- Welcome Message -->
                    <tr>
                        <td style="padding: 30px 30px 20px 30px;">
                            <p style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 16px; line-height: 1.6;">
                                Hola <strong style="color: #ff6600;">${user.name}</strong>,
                            </p>
                            <p style="margin: 0; color: #666; font-size: 15px; line-height: 1.6;">
                                Hemos registrado exitosamente tu orden. A continuación encontrarás todos los detalles de tu pedido.
                            </p>
                        </td>
                    </tr>

                    <!-- Order Details Card -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff5eb; border-radius: 8px; border-left: 4px solid #ff6600;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <table width="100%" cellpadding="8" cellspacing="0">
                                            <tr>
                                                <td style="color: #666; font-size: 14px;">ID de Orden:</td>
                                                <td style="color: #1a1a1a; font-weight: 600; font-size: 14px; text-align: right; font-family: monospace;">
                                                    #${order._id.toString().slice(-8).toUpperCase()}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666; font-size: 14px;">Fecha de Registro:</td>
                                                <td style="color: #1a1a1a; font-weight: 600; font-size: 14px; text-align: right;">
                                                    ${formatDate(order.createdAt)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666; font-size: 14px;">Estado:</td>
                                                <td style="text-align: right;">
                                                    <span style="background-color: #fff3cd; color: #856404; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; display: inline-block;">
                                                        ⏳ Pendiente
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666; font-size: 14px;">Método de Pago:</td>
                                                <td style="color: #1a1a1a; font-weight: 600; font-size: 14px; text-align: right;">
                                                    ${order.payment}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666; font-size: 14px;">Expedidor:</td>
                                                <td style="color: #1a1a1a; font-weight: 600; font-size: 14px; text-align: right;">
                                                    ${order.shipper}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666; font-size: 14px;">Tracking Number:</td>
                                                <td style="color: #ff6600; font-weight: 600; font-size: 14px; text-align: right; font-family: monospace;">
                                                    ${order.trackingNumber}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666; font-size: 14px;">Entrega Estimada:</td>
                                                <td style="color: #1a1a1a; font-weight: 600; font-size: 14px; text-align: right;">
                                                    ${formatDate(order.estimatedDelivery)}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Products Section -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <h3 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 20px; border-bottom: 2px solid #ff6600; padding-bottom: 10px;">
                                📦 Productos de tu Orden
                            </h3>
                            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
                                <thead>
                                    <tr style="background-color: #ff6600;">
                                        <th style="padding: 12px; text-align: left; color: #ffffff; font-size: 14px; font-weight: 600;">Producto</th>
                                        <th style="padding: 12px; text-align: center; color: #ffffff; font-size: 14px; font-weight: 600;">Cant.</th>
                                        <th style="padding: 12px; text-align: right; color: #ffffff; font-size: 14px; font-weight: 600;">Precio Unit.</th>
                                        <th style="padding: 12px; text-align: right; color: #ffffff; font-size: 14px; font-weight: 600;">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody style="background-color: #ffffff;">
                                    ${itemsHTML}
                                </tbody>
                                <tfoot>
                                    <tr style="background-color: #fff5eb;">
                                        <td colspan="3" style="padding: 16px; text-align: right; font-size: 18px; font-weight: bold; color: #1a1a1a;">
                                            Total:
                                        </td>
                                        <td style="padding: 16px; text-align: right; font-size: 20px; font-weight: bold; color: #ff6600;">
                                            ${formatPrice(order.total)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </td>
                    </tr>

                    <!-- Shipping Information -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; border-left: 4px solid #ff6600;">
                                <h4 style="margin: 0 0 15px 0; color: #1a1a1a; font-size: 16px;">📍 Información de Envío</h4>
                                <table width="100%" cellpadding="5" cellspacing="0">
                                    <tr>
                                        <td style="color: #666; font-size: 14px; width: 40%;">Empresa:</td>
                                        <td style="color: #1a1a1a; font-size: 14px; font-weight: 600;">${order.businessName}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666; font-size: 14px;">RUT Empresa:</td>
                                        <td style="color: #1a1a1a; font-size: 14px; font-weight: 600;">${order.businessRut}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666; font-size: 14px;">Dirección:</td>
                                        <td style="color: #1a1a1a; font-size: 14px; font-weight: 600;">${user.address}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666; font-size: 14px;">Ciudad/Comuna:</td>
                                        <td style="color: #1a1a1a; font-size: 14px; font-weight: 600;">${user.city}, ${user.province}</td>
                                    </tr>
                                    <tr>
                                        <td style="color: #666; font-size: 14px;">País:</td>
                                        <td style="color: #1a1a1a; font-size: 14px; font-weight: 600;">${order.country}</td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>

                    <!-- Action Button -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px; text-align: center;">
                            <a href="${process.env.FRONTEND_URL}/orders?page=1&orderId=${order._id}"
                               style="display: inline-block; background: linear-gradient(135deg, #ff6600 0%, #ff8533 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 30px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(255, 102, 0, 0.3);">
                                Ver Orden en el Portal →
                            </a>
                        </td>
                    </tr>

                    <!-- Next Steps -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background-color: #fff5eb; border-radius: 8px; padding: 20px;">
                                <h4 style="margin: 0 0 15px 0; color: #ff6600; font-size: 16px;">🚀 ¿Qué sigue?</h4>
                                <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.8;">
                                    <li>Procesaremos tu orden en las próximas 24-48 horas hábiles</li>
                                    <li>Recibirás un correo cuando tu orden cambie a "En Tránsito"</li>
                                    <li>Podrás rastrear tu envío con el tracking number proporcionado</li>
                                    <li>Te notificaremos cuando tu orden sea entregada</li>
                                </ul>
                            </div>
                        </td>
                    </tr>

                    <!-- Support Section -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px; text-align: center;">
                            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                                ¿Tienes alguna pregunta sobre tu orden?
                            </p>
                            <p style="margin: 0;">
                                <a href="mailto:${process.env.ADMIN_EMAIL}" style="color: #ff6600; text-decoration: none; font-weight: 600;">
                                    Contáctanos
                                </a>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1a1a1a; padding: 30px; text-align: center;">
                            <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                                Gracias por confiar en SPT
                            </p>
                            <p style="margin: 0 0 15px 0; color: #999; font-size: 13px;">
                                Spare Parts Trade - Tu proveedor de repuestos de confianza
                            </p>
                            <div style="margin: 15px 0;">
                                <a href="${process.env.FRONTEND_URL}" style="color: #ff6600; text-decoration: none; margin: 0 10px; font-size: 13px;">
                                    Ir al Portal
                                </a>
                                <span style="color: #666;">|</span>
                                <a href="${process.env.FRONTEND_URL}/orders" style="color: #ff6600; text-decoration: none; margin: 0 10px; font-size: 13px;">
                                    Ver Ordenes
                                </a>
                            </div>
                            <p style="margin: 20px 0 0 0; color: #666; font-size: 12px;">
                                © ${new Date().getFullYear()} Spare Parts Trade. Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `;

            const mailOptions = {
                from: `"Portal SPT" <${process.env.NOREPLY_EMAIL}>`,
                to: [user.email], 
                subject: `🎉📦 Tu Orden ha sido Registrada, ${user.name}`, 
                html: emailHTML
            }

            const response = await resend.emails.send(mailOptions); 
            console.log("✅ Email sent successfully", user.email);
            console.log(response)
        } catch (error) {
            console.error("❌ Error sending email:", error);
            throw new InternalServerError(); 
        }
    }
}