import resend from "../../config/resend";
import { InternalServerError } from "../../errors/server-error";
import { OrderInterface } from "../../models/Order";
import { UserInterface } from "../../models/User";

export class SentOrderEmail {
    static sendSentOrderEmail = async (user: UserInterface, order: OrderInterface) => { 
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
    <title>Orden En Tránsito - SPT</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    
                    <!-- Header with Blue-Orange Gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0066cc 0%, #ff6600 100%); padding: 40px 30px; text-align: center;">
                            <div style="background-color: #ffffff; display: inline-block; padding: 15px 25px; border-radius: 50px; margin-bottom: 20px;">
                                <h1 style="margin: 0; color: #ff6600; font-size: 28px; font-weight: bold;">SPT</h1>
                                <p style="margin: 0; color: #666; font-size: 12px; letter-spacing: 1px;">SPARE PARTS TRADE</p>
                            </div>
                            <div style="font-size: 60px; margin-bottom: 10px;">🚚</div>
                            <h2 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">¡Tu Orden Está En Camino!</h2>
                            <p style="margin: 10px 0 0 0; color: #fff; font-size: 16px; opacity: 0.95;">Tu pedido ha sido despachado y está en tránsito</p>
                        </td>
                    </tr>

                    <!-- Welcome Message -->
                    <tr>
                        <td style="padding: 30px 30px 20px 30px;">
                            <p style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 16px; line-height: 1.6;">
                                Hola <strong style="color: #ff6600;">${user.name}</strong>,
                            </p>
                            <p style="margin: 0 0 15px 0; color: #666; font-size: 15px; line-height: 1.6;">
                                ¡Excelentes noticias! Tu orden ya está en camino. Puedes hacer seguimiento de tu envío utilizando el número de tracking proporcionado.
                            </p>
                            <p style="margin: 0; color: #666; font-size: 15px; line-height: 1.6;">
                                Recibirás una notificación cuando tu pedido sea entregado.
                            </p>
                        </td>
                    </tr>

                    <!-- Tracking Number Highlight -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%); border-radius: 12px; padding: 25px; text-align: center; box-shadow: 0 4px 12px rgba(0, 102, 204, 0.2);">
                                <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">
                                    Número de Seguimiento
                                </p>
                                <p style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; font-family: monospace; letter-spacing: 2px;">
                                    ${order.trackingNumber}
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Order Details Card -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #e6f2ff; border-radius: 8px; border-left: 4px solid #0066cc;">
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
                                                <td style="color: #666; font-size: 14px;">Fecha de Envío:</td>
                                                <td style="color: #1a1a1a; font-weight: 600; font-size: 14px; text-align: right;">
                                                    ${formatDate(order.updatedAt)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666; font-size: 14px;">Estado:</td>
                                                <td style="text-align: right;">
                                                    <span style="background-color: #cce5ff; color: #004085; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; display: inline-block;">
                                                        🚚 En Tránsito
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666; font-size: 14px;">Expedidor:</td>
                                                <td style="color: #1a1a1a; font-weight: 600; font-size: 14px; text-align: right;">
                                                    ${order.shipper}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666; font-size: 14px;">Entrega Estimada:</td>
                                                <td style="color: #ff6600; font-weight: 700; font-size: 15px; text-align: right;">
                                                    📅 ${formatDate(order.estimatedDelivery)}
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
                            <h3 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 20px; border-bottom: 2px solid #0066cc; padding-bottom: 10px;">
                                📦 Productos de tu Orden
                            </h3>
                            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
                                <thead>
                                    <tr style="background-color: #0066cc;">
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
                                    <tr style="background-color: #e6f2ff;">
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

                    <!-- Shipping Progress -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; border-left: 4px solid #0066cc;">
                                <h4 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 16px;">📍 Estado del Envío</h4>
                                
                                <!-- Progress Bar -->
                                <div style="position: relative; height: 8px; background-color: #e0e0e0; border-radius: 4px; margin-bottom: 25px; overflow: hidden;">
                                    <div style="position: absolute; left: 0; top: 0; height: 100%; width: 66%; background: linear-gradient(90deg, #0066cc 0%, #ff6600 100%); border-radius: 4px;"></div>
                                </div>

                                <!-- Status Steps -->
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="width: 33%; text-align: center; vertical-align: top;">
                                            <div style="margin-bottom: 8px;">✅</div>
                                            <div style="font-size: 12px; color: #28a745; font-weight: 600;">Registrado</div>
                                        </td>
                                        <td style="width: 34%; text-align: center; vertical-align: top;">
                                            <div style="margin-bottom: 8px;">🚚</div>
                                            <div style="font-size: 12px; color: #0066cc; font-weight: 600;">En Tránsito</div>
                                            <div style="font-size: 11px; color: #666; margin-top: 4px;">Estás aquí</div>
                                        </td>
                                        <td style="width: 33%; text-align: center; vertical-align: top;">
                                            <div style="margin-bottom: 8px;">📦</div>
                                            <div style="font-size: 12px; color: #999;">Por Entregar</div>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Shipping Details -->
                                <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
                                    <table width="100%" cellpadding="5" cellspacing="0">
                                        <tr>
                                            <td style="color: #666; font-size: 14px; width: 40%;">Destino:</td>
                                            <td style="color: #1a1a1a; font-size: 14px; font-weight: 600;">${user.address}</td>
                                        </tr>
                                        <tr>
                                            <td style="color: #666; font-size: 14px;">Ciudad:</td>
                                            <td style="color: #1a1a1a; font-size: 14px; font-weight: 600;">${user.city}, ${user.province}</td>
                                        </tr>
                                        <tr>
                                            <td style="color: #666; font-size: 14px;">País:</td>
                                            <td style="color: #1a1a1a; font-size: 14px; font-weight: 600;">${order.country}</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </td>
                    </tr>

                    <!-- Action Buttons -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <table width="100%" cellpadding="10" cellspacing="0">
                                <tr>
                                    <td style="text-align: center; padding-right: 5px;">
                                        <a href="${process.env.FRONTEND_URL}/orders?page=1&orderId=${order._id}" 
                                           style="display: inline-block; background: linear-gradient(135deg, #ff6600 0%, #ff8533 100%); color: #ffffff; text-decoration: none; padding: 16px 30px; border-radius: 30px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(255, 102, 0, 0.3);">
                                            Ver Orden Completa 📋
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Tracking Tips -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background-color: #fff5eb; border-radius: 8px; padding: 20px;">
                                <h4 style="margin: 0 0 15px 0; color: #ff6600; font-size: 16px;">💡 Consejos para el Seguimiento</h4>
                                <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.8;">
                                    <li>Puedes rastrear tu pedido usando el número de tracking en la página de ${order.shipper}</li>
                                    <li>Los tiempos de entrega pueden variar según tu ubicación y condiciones climáticas</li>
                                    <li>Asegúrate de que haya alguien disponible para recibir el paquete</li>
                                    <li>Te enviaremos un correo cuando tu orden sea entregada</li>
                                </ul>
                            </div>
                        </td>
                    </tr>

                    <!-- Support Section -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px; text-align: center;">
                            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                                ¿Tienes alguna pregunta sobre tu envío?
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
                                    Mis Órdenes
                                </a>
                                <span style="color: #666;">|</span>
                                <a href="${process.env.FRONTEND_URL}/orders?page=1&orderId=${order._id}" style="color: #ff6600; text-decoration: none; margin: 0 10px; font-size: 13px;">
                                    Ver Esta Orden
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
                subject: `🚚📦 Tu Orden Está En Camino, ${user.name}`, 
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