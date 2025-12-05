import resend from "../../config/resend";
import { InternalServerError } from "../../errors/server-error";
import { OrderInterface } from "../../models/Order";
import { UserInterface } from "../../models/User";

export class CancelledOrderEmail {
    static sendCancelledOrderEmail = async (user: UserInterface, order: OrderInterface) => { 
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
                    <td style="padding: 12px; border-bottom: 1px solid #f1f1f1; text-align: right; font-weight: 600; color: #dc3545;">
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
    <title>Orden Cancelada - SPT</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    
                    <!-- Header with Red-Orange Gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #dc3545 0%, #ff6600 100%); padding: 40px 30px; text-align: center;">
                            <div style="background-color: #ffffff; display: inline-block; padding: 15px 25px; border-radius: 50px; margin-bottom: 20px;">
                                <h1 style="margin: 0; color: #ff6600; font-size: 28px; font-weight: bold;">SPT</h1>
                                <p style="margin: 0; color: #666; font-size: 12px; letter-spacing: 1px;">SPARE PARTS TRADE</p>
                            </div>
                            <div style="font-size: 60px; margin-bottom: 10px;">❌</div>
                            <h2 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">Orden Cancelada</h2>
                            <p style="margin: 10px 0 0 0; color: #fff; font-size: 16px; opacity: 0.95;">Tu pedido ha sido cancelado</p>
                        </td>
                    </tr>

                    <!-- Message -->
                    <tr>
                        <td style="padding: 30px 30px 20px 30px;">
                            <p style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 16px; line-height: 1.6;">
                                Hola <strong style="color: #ff6600;">${user.name}</strong>,
                            </p>
                            <p style="margin: 0 0 15px 0; color: #666; font-size: 15px; line-height: 1.6;">
                                Lamentamos informarte que tu orden ha sido cancelada. A continuación encontrarás los detalles de la orden cancelada.
                            </p>
                            <p style="margin: 0; color: #666; font-size: 15px; line-height: 1.6;">
                                Si tienes alguna pregunta o necesitas más información, no dudes en contactarnos.
                            </p>
                        </td>
                    </tr>

                    <!-- Cancellation Badge -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); border-radius: 12px; padding: 25px; text-align: center; box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);">
                                <div style="font-size: 50px; margin-bottom: 10px;">⚠️</div>
                                <p style="margin: 0 0 5px 0; color: #ffffff; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">
                                    Cancelado el
                                </p>
                                <p style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">
                                    ${formatDate(order.updatedAt)}
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Order Details Card -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8d7da; border-radius: 8px; border-left: 4px solid #dc3545;">
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
                                                <td style="color: #666; font-size: 14px;">Fecha de Cancelación:</td>
                                                <td style="color: #dc3545; font-weight: 700; font-size: 15px; text-align: right;">
                                                    ${formatDate(order.updatedAt)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666; font-size: 14px;">Estado:</td>
                                                <td style="text-align: right;">
                                                    <span style="background-color: #f8d7da; color: #721c24; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; display: inline-block;">
                                                        ❌ Cancelado
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #666; font-size: 14px;">Método de Pago:</td>
                                                <td style="color: #1a1a1a; font-weight: 600; font-size: 14px; text-align: right;">
                                                    ${order.payment}
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
                            <h3 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 20px; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">
                                📦 Productos de la Orden Cancelada
                            </h3>
                            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
                                <thead>
                                    <tr style="background-color: #dc3545;">
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
                                    <tr style="background-color: #f8d7da;">
                                        <td colspan="3" style="padding: 16px; text-align: right; font-size: 18px; font-weight: bold; color: #1a1a1a;">
                                            Total:
                                        </td>
                                        <td style="padding: 16px; text-align: right; font-size: 20px; font-weight: bold; color: #dc3545;">
                                            ${formatPrice(order.total)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </td>
                    </tr>

                    <!-- Cancellation Info -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background-color: #fff3cd; border-radius: 8px; padding: 20px; border-left: 4px solid #ffc107;">
                                <h4 style="margin: 0 0 15px 0; color: #856404; font-size: 16px;">ℹ️ Información Importante</h4>
                                <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.8;">
                                    <li>Si realizaste un pago, el reembolso será procesado en 5-10 días hábiles</li>
                                    <li>Recibirás una confirmación del reembolso por correo electrónico</li>
                                    <li>El monto será devuelto al mismo método de pago utilizado</li>
                                    <li>Si tienes dudas sobre el proceso, contáctanos</li>
                                </ul>
                            </div>
                        </td>
                    </tr>

                    <!-- Action Buttons -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <table width="100%" cellpadding="10" cellspacing="0">
                                <tr>
                                    <td style="width: 50%; text-align: center; padding-right: 5px;">
                                        <a href="${process.env.FRONTEND_URL}/orders?page=1&orderId=${order._id}"
                                           style="display: inline-block; background-color: #6c757d; color: #ffffff; text-decoration: none; padding: 14px 25px; border-radius: 30px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);">
                                            Ver Orden 📋
                                        </a>
                                    </td>
                                    <td style="width: 50%; text-align: center; padding-left: 5px;">
                                        <a href="${process.env.FRONTEND_URL}/products" 
                                           style="display: inline-block; background: linear-gradient(135deg, #ff6600 0%, #ff8533 100%); color: #ffffff; text-decoration: none; padding: 14px 25px; border-radius: 30px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(255, 102, 0, 0.3);">
                                            Ver Catálogo 🛒
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Alternative Options -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background: linear-gradient(135deg, #fff5eb 0%, #ffe8cc 100%); border-radius: 8px; padding: 25px; text-align: center;">
                                <h4 style="margin: 0 0 10px 0; color: #ff6600; font-size: 18px;">🛍️ ¿Cambios de Planes?</h4>
                                <p style="margin: 0 0 20px 0; color: #666; font-size: 14px;">
                                    Explora nuestro catálogo y encuentra los repuestos que necesitas
                                </p>
                                <a href="${process.env.FRONTEND_URL}/products" 
                                   style="display: inline-block; background-color: #ff6600; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-weight: 600; font-size: 14px;">
                                    Explorar Productos
                                </a>
                            </div>
                        </td>
                    </tr>

                    <!-- Support Section -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center;">
                                <h4 style="margin: 0 0 10px 0; color: #1a1a1a; font-size: 16px;">💬 ¿Necesitas Ayuda?</h4>
                                <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">
                                    Si tienes preguntas sobre esta cancelación o necesitas asistencia, estamos aquí para ayudarte
                                </p>
                                <a href="mailto:${process.env.ADMIN_EMAIL}" 
                                   style="color: #ff6600; text-decoration: none; font-weight: 600; font-size: 15px;">
                                    Contactar Soporte →
                                </a>
                            </div>
                        </td>
                    </tr>

                    <!-- Reasons Section -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px;">
                                <h4 style="margin: 0 0 15px 0; color: #1a1a1a; font-size: 16px;">❓ Razones Comunes de Cancelación</h4>
                                <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 14px; line-height: 1.8;">
                                    <li>Producto no disponible en stock</li>
                                    <li>Problemas con el método de pago</li>
                                    <li>Solicitud de cancelación por parte del cliente</li>
                                    <li>Dirección de envío incorrecta o incompleta</li>
                                    <li>Error en los detalles del pedido</li>
                                </ul>
                            </div>
                        </td>
                    </tr>

                    <!-- Closing Message -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px; text-align: center;">
                            <p style="margin: 0; color: #666; font-size: 15px; line-height: 1.6;">
                                Lamentamos los inconvenientes que esto pueda causar.<br>
                                Esperamos poder atenderte en tu próxima orden.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1a1a1a; padding: 30px; text-align: center;">
                            <p style="margin: 0 0 10px 0; color: #ffffff; font-size: 16px; font-weight: 600;">
                                Gracias por considerar SPT
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
                                <a href="${process.env.FRONTEND_URL}/products" style="color: #ff6600; text-decoration: none; margin: 0 10px; font-size: 13px;">
                                    Ver Productos
                                </a>
                                <span style="color: #666;">|</span>
                                <a href="mailto:${process.env.ADMIN_EMAIL}" style="color: #ff6600; text-decoration: none; margin: 0 10px; font-size: 13px;">
                                    Contacto
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
                subject: `❌ Orden Cancelada - ${user.name}`, 
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