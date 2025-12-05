import resend from "../../config/resend";
import { InternalServerError } from "../../errors/server-error";
import { OrderInterface } from "../../models/Order";
import { UserInterface } from "../../models/User";

export class DeliveredOrderEmail {
    static sendDeliveredOrderEmail = async (user: UserInterface, order: OrderInterface) => { 
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
                    <td style="padding: 12px; border-bottom: 1px solid #f1f1f1; text-align: right; font-weight: 600; color: #28a745;">
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
    <title>Orden Entregada - SPT</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    
                    <!-- Header with Green-Orange Gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #28a745 0%, #ff6600 100%); padding: 40px 30px; text-align: center; position: relative;">
                            <!-- Celebration Confetti Effect -->
                            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0.1; background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.5) 10px, rgba(255,255,255,.5) 20px);"></div>
                            
                            <div style="background-color: #ffffff; display: inline-block; padding: 15px 25px; border-radius: 50px; margin-bottom: 20px; position: relative; z-index: 1;">
                                <h1 style="margin: 0; color: #ff6600; font-size: 28px; font-weight: bold;">SPT</h1>
                                <p style="margin: 0; color: #666; font-size: 12px; letter-spacing: 1px;">SPARE PARTS TRADE</p>
                            </div>
                            <div style="font-size: 70px; margin-bottom: 10px; position: relative; z-index: 1;">🎉📦</div>
                            <h2 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: bold; position: relative; z-index: 1;">¡Orden Entregada!</h2>
                            <p style="margin: 10px 0 0 0; color: #fff; font-size: 16px; opacity: 0.95; position: relative; z-index: 1;">Tu pedido ha sido entregado exitosamente</p>
                        </td>
                    </tr>

                    <!-- Welcome Message -->
                    <tr>
                        <td style="padding: 30px 30px 20px 30px;">
                            <p style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 16px; line-height: 1.6;">
                                Hola <strong style="color: #ff6600;">${user.name}</strong>,
                            </p>
                            <p style="margin: 0 0 15px 0; color: #666; font-size: 15px; line-height: 1.6;">
                                ¡Excelentes noticias! Tu orden ha sido entregada con éxito. Esperamos que disfrutes de tus productos.
                            </p>
                            <p style="margin: 0; color: #666; font-size: 15px; line-height: 1.6;">
                                Gracias por confiar en SPT para tus necesidades de repuestos.
                            </p>
                        </td>
                    </tr>

                    <!-- Delivery Confirmation Badge -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); border-radius: 12px; padding: 25px; text-align: center; box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);">
                                <div style="font-size: 50px; margin-bottom: 10px;">✅</div>
                                <p style="margin: 0 0 5px 0; color: #ffffff; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">
                                    Entregado el
                                </p>
                                <p style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                                    ${order.deliveredAt ? formatDate(order.deliveredAt) : formatDate(order.updatedAt)}
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Order Details Card -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #d4edda; border-radius: 8px; border-left: 4px solid #28a745;">
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
                                                <td style="color: #666; font-size: 14px;">Fecha de Pedido:</td>
                                                <td style="color: #1a1a1a; font-weight: 600; font-size: 14px; text-align: right;">
                                                    ${formatDate(order.createdAt)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666; font-size: 14px;">Fecha de Entrega:</td>
                                                <td style="color: #28a745; font-weight: 700; font-size: 15px; text-align: right;">
                                                    ${order.deliveredAt ? formatDate(order.deliveredAt) : formatDate(order.updatedAt)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666; font-size: 14px;">Estado:</td>
                                                <td style="text-align: right;">
                                                    <span style="background-color: #d4edda; color: #155724; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; display: inline-block;">
                                                        ✅ Entregado
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666; font-size: 14px;">Tracking Number:</td>
                                                <td style="color: #1a1a1a; font-weight: 600; font-size: 14px; text-align: right; font-family: monospace;">
                                                    ${order.trackingNumber}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666; font-size: 14px;">Expedidor:</td>
                                                <td style="color: #1a1a1a; font-weight: 600; font-size: 14px; text-align: right;">
                                                    ${order.shipper}
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
                            <h3 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 20px; border-bottom: 2px solid #28a745; padding-bottom: 10px;">
                                📦 Productos Entregados
                            </h3>
                            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
                                <thead>
                                    <tr style="background-color: #28a745;">
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
                                    <tr style="background-color: #d4edda;">
                                        <td colspan="3" style="padding: 16px; text-align: right; font-size: 18px; font-weight: bold; color: #1a1a1a;">
                                            Total Pagado:
                                        </td>
                                        <td style="padding: 16px; text-align: right; font-size: 20px; font-weight: bold; color: #28a745;">
                                            ${formatPrice(order.total)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </td>
                    </tr>

                    <!-- Delivery Timeline -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; border-left: 4px solid #28a745;">
                                <h4 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 16px;">📍 Línea de Tiempo del Pedido</h4>
                                
                                <!-- Completed Progress Bar -->
                                <div style="position: relative; height: 8px; background: linear-gradient(90deg, #28a745 0%, #ff6600 100%); border-radius: 4px; margin-bottom: 25px; box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);"></div>

                                <!-- Status Steps - All Completed -->
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="width: 33%; text-align: center; vertical-align: top;">
                                            <div style="margin-bottom: 8px;">✅</div>
                                            <div style="font-size: 12px; color: #28a745; font-weight: 600;">Registrado</div>
                                            <div style="font-size: 11px; color: #666; margin-top: 4px;">${formatDate(order.createdAt)}</div>
                                        </td>
                                        <td style="width: 34%; text-align: center; vertical-align: top;">
                                            <div style="margin-bottom: 8px;">✅</div>
                                            <div style="font-size: 12px; color: #28a745; font-weight: 600;">En Tránsito</div>
                                        </td>
                                        <td style="width: 33%; text-align: center; vertical-align: top;">
                                            <div style="margin-bottom: 8px;">✅</div>
                                            <div style="font-size: 12px; color: #28a745; font-weight: 600;">Entregado</div>
                                            <div style="font-size: 11px; color: #666; margin-top: 4px;">${order.deliveredAt ? formatDate(order.deliveredAt) : formatDate(order.updatedAt)}</div>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Delivery Address -->
                                <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
                                    <table width="100%" cellpadding="5" cellspacing="0">
                                        <tr>
                                            <td style="color: #666; font-size: 14px; width: 40%;">Entregado en:</td>
                                            <td style="color: #1a1a1a; font-size: 14px; font-weight: 600;">${user.address}</td>
                                        </tr>
                                        <tr>
                                            <td style="color: #666; font-size: 14px;">Ciudad:</td>
                                            <td style="color: #1a1a1a; font-size: 14px; font-weight: 600;">${user.city}, ${user.province}</td>
                                        </tr>
                                        <tr>
                                            <td style="color: #666; font-size: 14px;">Destinatario:</td>
                                            <td style="color: #1a1a1a; font-size: 14px; font-weight: 600;">${order.businessName}</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </td>
                    </tr>

                    <!-- Action Button -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px; text-align: center;">
                            <a href="${process.env.FRONTEND_URL}/orders?page=1&orderId=${order._id}"
                               style="display: inline-block; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 30px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);">
                                Ver Detalles de la Orden 📋
                            </a>
                        </td>
                    </tr>

                    <!-- Feedback Section -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background: linear-gradient(135deg, #fff5eb 0%, #ffe8cc 100%); border-radius: 8px; padding: 25px; text-align: center;">
                                <h4 style="margin: 0 0 10px 0; color: #ff6600; font-size: 18px;">⭐ ¿Cómo fue tu experiencia?</h4>
                                <p style="margin: 0 0 20px 0; color: #666; font-size: 14px;">
                                    Tu opinión es muy importante para nosotros. Ayúdanos a mejorar nuestro servicio.
                                </p>
                                <a href="${process.env.FRONTEND_URL}/feedback?order=${order._id}" 
                                   style="display: inline-block; background-color: #ff6600; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: 600; font-size: 14px;">
                                    Dejar una Reseña
                                </a>
                            </div>
                        </td>
                    </tr>

                    <!-- Next Steps -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px;">
                                <h4 style="margin: 0 0 15px 0; color: #1a1a1a; font-size: 16px;">🎯 ¿Qué puedes hacer ahora?</h4>
                                <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.8;">
                                    <li>Revisa que todos los productos estén en perfecto estado</li>
                                    <li>Guarda tu comprobante para futuras referencias</li>
                                    <li>Si tienes algún problema, contáctanos dentro de las próximas 48 horas</li>
                                    <li>¡Explora nuestro catálogo para tu próxima compra!</li>
                                </ul>
                            </div>
                        </td>
                    </tr>

                    <!-- Support Section -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px; text-align: center;">
                            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                                ¿Algún problema con tu entrega?
                            </p>
                            <p style="margin: 0;">
                                <a href="mailto:${process.env.ADMIN_EMAIL}" style="color: #ff6600; text-decoration: none; font-weight: 600;">
                                    Contáctanos inmediatamente
                                </a>
                            </p>
                        </td>
                    </tr>

                    <!-- Thank You Message -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background: linear-gradient(135deg, #ff6600 0%, #ff8533 100%); border-radius: 12px; padding: 30px; text-align: center;">
                                <div style="font-size: 50px; margin-bottom: 15px;">🙏</div>
                                <h3 style="margin: 0 0 10px 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                                    ¡Gracias por tu Compra!
                                </h3>
                                <p style="margin: 0; color: #ffffff; font-size: 15px; opacity: 0.95;">
                                    Esperamos verte pronto en tu próxima orden
                                </p>
                            </div>
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
                                <span style="color: #666;">|</span>
                                <a href="${process.env.FRONTEND_URL}/products" style="color: #ff6600; text-decoration: none; margin: 0 10px; font-size: 13px;">
                                    Ver Productos
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
                subject: `🎉✅ ¡Tu Orden Ha Sido Entregada! ${user.name}`, 
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