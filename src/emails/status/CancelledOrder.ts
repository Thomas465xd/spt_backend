import { formatCurrency, formatDate } from "@/utils";
import resend from "../../config/resend";
import { InternalServerError } from "../../errors/server-error";
import { OrderInterface } from "../../models/Order";
import { UserInterface } from "../../models/User";

export class CancelledOrderEmail {
	static sendCancelledOrderEmail = async (
		user: UserInterface,
		order: OrderInterface,
	) => {
		try {
			const itemsHTML = order.items
				.map(
					(item) => `
                <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9;">
                        <div style="font-weight: 600; color: #1e293b; margin-bottom: 3px;">${item.name}</div>
                        <div style="font-size: 12px; color: #94a3b8;">SKU: ${item.sku}</div>
                    </td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: center; color: #1e293b;">${item.quantity}</td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #475569;">${formatCurrency(item.price, order.currency)}</td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 600; color: #dc2626;">${formatCurrency(item.lineTotal, order.currency)}</td>
                </tr>`,
				)
				.join("");

			const emailHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orden Cancelada - Portal SPT</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9;">
        <tr>
            <td style="padding: 40px 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #ea580c 0%, #fb923c 100%); padding: 40px 20px; text-align: center;">
                            <img src="${process.env.LOGO_URL}" alt="Portal SPT" style="width: 70px; height: auto; display: block; margin: 0 auto 16px;" />
                            <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #ffffff;">Orden Cancelada ❌</h1>
                            <p style="margin: 8px 0 0 0; font-size: 15px; color: rgba(255,255,255,0.9);">Tu pedido ha sido cancelado</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 35px; background-color: #ffffff;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #1e293b;">
                                Hola <strong>${user.name}</strong>,
                            </p>
                            <p style="margin: 0 0 25px 0; font-size: 15px; line-height: 1.7; color: #475569;">
                                Lamentamos informarte que tu orden ha sido cancelada. A continuación encontrarás los detalles de la orden cancelada.
                            </p>

                            <!-- Cancellation Notice -->
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 30px 0; background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 6px;">
                                <tr>
                                    <td style="padding: 16px 20px;">
                                        <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #dc2626;">Cancelado el</p>
                                        <p style="margin: 0; font-size: 16px; font-weight: 700; color: #991b1b;">${formatDate(order.updatedAt, order.country)}</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Order Details -->
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 30px 0; background-color: #f8fafc; border-radius: 10px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 18px 25px; border-bottom: 2px solid #e2e8f0;">
                                        <h2 style="margin: 0; font-size: 17px; font-weight: 600; color: #1e293b;">📋 Detalles de la Orden</h2>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px 25px;">
                                        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td style="padding: 7px 0; font-size: 14px; color: #64748b; width: 50%;">ID de Orden:</td>
                                                <td style="padding: 7px 0; font-size: 14px; font-weight: 600; color: #1e293b; text-align: right; font-family: monospace;">#${order._id.toString().slice(-8).toUpperCase()}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 7px 0; font-size: 14px; color: #64748b;">Fecha de Pedido:</td>
                                                <td style="padding: 7px 0; font-size: 14px; font-weight: 600; color: #1e293b; text-align: right;">${formatDate(order.createdAt, order.country)}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 7px 0; font-size: 14px; color: #64748b;">Estado:</td>
                                                <td style="padding: 7px 0; text-align: right;">
                                                    <span style="background-color: #fef2f2; color: #991b1b; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">❌ Cancelado</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 7px 0; font-size: 14px; color: #64748b;">Método de Pago:</td>
                                                <td style="padding: 7px 0; font-size: 14px; font-weight: 600; color: #1e293b; text-align: right;">${order.paymentMethod}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Items Table -->
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 30px 0; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 18px 25px; border-bottom: 2px solid #e2e8f0; background-color: #f8fafc;">
                                        <h2 style="margin: 0; font-size: 17px; font-weight: 600; color: #1e293b;">📦 Productos de la Orden Cancelada</h2>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                            <thead>
                                                <tr style="background: linear-gradient(135deg, #ea580c 0%, #fb923c 100%);">
                                                    <th style="padding: 10px 16px; text-align: left; color: #ffffff; font-size: 13px; font-weight: 600;">Producto</th>
                                                    <th style="padding: 10px 16px; text-align: center; color: #ffffff; font-size: 13px; font-weight: 600;">Cant.</th>
                                                    <th style="padding: 10px 16px; text-align: right; color: #ffffff; font-size: 13px; font-weight: 600;">Precio</th>
                                                    <th style="padding: 10px 16px; text-align: right; color: #ffffff; font-size: 13px; font-weight: 600;">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody>${itemsHTML}</tbody>
                                            <tfoot>
                                                <tr>
                                                    <td colspan="3" style="padding: 16px; text-align: right; font-size: 16px; font-weight: 700; color: #1e293b; border-top: 2px solid #e2e8f0;">Total:</td>
                                                    <td style="padding: 16px; text-align: right; font-size: 18px; font-weight: 700; color: #dc2626; border-top: 2px solid #e2e8f0;">${formatCurrency(order.total, order.currency)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Info box -->
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 30px 0; background-color: #fefce8; border-left: 4px solid #ca8a04; border-radius: 6px;">
                                <tr>
                                    <td style="padding: 16px 20px;">
                                        <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #ca8a04;">ℹ️ Información Importante</p>
                                        <ul style="margin: 0; padding-left: 18px; color: #475569; font-size: 13px; line-height: 1.9;">
                                            <li>Si realizaste un pago, el reembolso será procesado en 5-10 días hábiles</li>
                                            <li>El monto será devuelto al mismo método de pago utilizado</li>
                                        </ul>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #94a3b8; text-align: center;">
                                ¿Tienes preguntas? Contáctanos en <a href="mailto:${process.env.ADMIN_EMAIL}" style="color: #ea580c; text-decoration: none;">${process.env.ADMIN_EMAIL}</a>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1e293b; padding: 30px 35px; text-align: center; border-radius: 0 0 16px 16px;">
                            <p style="margin: 0 0 6px 0; font-size: 15px; font-weight: 600; color: #ffffff;">Portal SPT</p>
                            <p style="margin: 0 0 12px 0; font-size: 13px; color: #94a3b8;">Spare Parts Trade - Tu proveedor de repuestos de confianza</p>
                            <p style="margin: 0; font-size: 11px; color: #64748b;">
                                Este correo fue enviado a ${user.email}<br/>
                                © ${new Date().getFullYear()} Portal SPT. Todos los derechos reservados.
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
				subject: `❌ Orden Cancelada, ${user.name}`,
				html: emailHTML,
			};

			const response = await resend.emails.send(mailOptions);
			console.log("✅ Email sent successfully", user.email);
			console.log(response);
		} catch (error) {
			console.error("❌ Error sending email:", error);
			throw new InternalServerError();
		}
	};
}
