import { formatCurrency, formatDate } from "@/src/utils";
import resend from "../../config/resend";
import { InternalServerError } from "../../errors/server-error";
import { OrderInterface } from "../../models/Order";
import { UserInterface } from "../../models/User";

export class SentOrderEmail {
	static sendSentOrderEmail = async (
		user: UserInterface,
		order: OrderInterface,
	) => {
		try {
			const shippedDate = formatDate(order.updatedAt, order.country);
			const estimatedDeliveryDate = formatDate(
				order.estimatedDelivery,
				order.country,
			);

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
                    <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 600; color: #2563eb;">${formatCurrency(item.lineTotal, order.currency)}</td>
                </tr>`,
				)
				.join("");

			const emailHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orden En Tránsito - Portal SPT</title>
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
                            <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #ffffff;">¡Tu Orden Está en Camino! 🚚</h1>
                            <p style="margin: 8px 0 0 0; font-size: 15px; color: rgba(255,255,255,0.9);">Tu pedido ha sido despachado y está en tránsito</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 35px; background-color: #ffffff;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #1e293b;">
                                Hola <strong>${user.name}</strong>,
                            </p>
                            <p style="margin: 0 0 25px 0; font-size: 15px; line-height: 1.7; color: #475569;">
                                ¡Excelentes noticias! Tu orden ya está en camino. Puedes hacer seguimiento de tu envío utilizando el número de tracking a continuación.
                            </p>

                            <!-- Tracking Confirmation -->
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 30px 0; background-color: #eff6ff; border-left: 4px solid #2563eb; border-radius: 6px;">
                                <tr>
                                    <td style="padding: 16px 20px;">
                                        <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #2563eb;">🚚 Número de Seguimiento</p>
                                        <p style="margin: 0; font-size: 18px; font-weight: 700; color: #1e3a8a; font-family: monospace; letter-spacing: 1px;">${order.trackingNumber}</p>
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
                                                <td style="padding: 7px 0; font-size: 14px; color: #64748b;">Fecha de Envío:</td>
                                                <td style="padding: 7px 0; font-size: 14px; font-weight: 600; color: #1e293b; text-align: right;">${shippedDate}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 7px 0; font-size: 14px; color: #64748b;">Estado:</td>
                                                <td style="padding: 7px 0; text-align: right;">
                                                    <span style="background-color: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">🚚 En Tránsito</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 7px 0; font-size: 14px; color: #64748b;">Expedidor:</td>
                                                <td style="padding: 7px 0; font-size: 14px; font-weight: 600; color: #1e293b; text-align: right;">${order.shipper}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 7px 0; font-size: 14px; color: #64748b;">Entrega Estimada:</td>
                                                <td style="padding: 7px 0; font-size: 14px; font-weight: 700; color: #ea580c; text-align: right;">📅 ${estimatedDeliveryDate}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Shipping Progress -->
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 30px 0; background-color: #f8fafc; border-radius: 10px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 18px 25px; border-bottom: 2px solid #e2e8f0;">
                                        <h2 style="margin: 0; font-size: 17px; font-weight: 600; color: #1e293b;">📍 Estado del Envío</h2>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px 25px;">
                                        <div style="position: relative; height: 8px; background-color: #e2e8f0; border-radius: 4px; margin-bottom: 20px; overflow: hidden;">
                                            <div style="position: absolute; left: 0; top: 0; height: 100%; width: 66%; background: linear-gradient(90deg, #2563eb 0%, #ea580c 100%); border-radius: 4px;"></div>
                                        </div>
                                        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td style="width: 33%; text-align: center; vertical-align: top;">
                                                    <div style="margin-bottom: 6px; font-size: 18px;">✅</div>
                                                    <div style="font-size: 12px; color: #16a34a; font-weight: 600;">Registrado</div>
                                                </td>
                                                <td style="width: 34%; text-align: center; vertical-align: top;">
                                                    <div style="margin-bottom: 6px; font-size: 18px;">🚚</div>
                                                    <div style="font-size: 12px; color: #2563eb; font-weight: 600;">En Tránsito</div>
                                                    <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Estás aquí</div>
                                                </td>
                                                <td style="width: 33%; text-align: center; vertical-align: top;">
                                                    <div style="margin-bottom: 6px; font-size: 18px;">📦</div>
                                                    <div style="font-size: 12px; color: #94a3b8;">Por Entregar</div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Items Table -->
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 30px 0; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 18px 25px; border-bottom: 2px solid #e2e8f0; background-color: #f8fafc;">
                                        <h2 style="margin: 0; font-size: 17px; font-weight: 600; color: #1e293b;">📦 Productos de tu Orden</h2>
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
                                                    <td style="padding: 16px; text-align: right; font-size: 18px; font-weight: 700; color: #ea580c; border-top: 2px solid #e2e8f0;">${formatCurrency(order.total, order.currency)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Shipping Address -->
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 30px 0; background-color: #fff7ed; border-left: 4px solid #ea580c; border-radius: 6px;">
                                <tr>
                                    <td style="padding: 20px 25px;">
                                        <p style="margin: 0 0 12px 0; font-size: 15px; font-weight: 600; color: #ea580c;">📍 Destino de Envío</p>
                                        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td style="padding: 5px 0; font-size: 14px; color: #64748b; width: 40%;">Dirección:</td>
                                                <td style="padding: 5px 0; font-size: 14px; font-weight: 600; color: #1e293b; text-align: right;">${user.address}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 5px 0; font-size: 14px; color: #64748b;">Ciudad:</td>
                                                <td style="padding: 5px 0; font-size: 14px; font-weight: 600; color: #1e293b; text-align: right;">${user.city}, ${user.province}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 5px 0; font-size: 14px; color: #64748b;">País:</td>
                                                <td style="padding: 5px 0; font-size: 14px; font-weight: 600; color: #1e293b; text-align: right;">${order.country}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding: 10px 0 25px;">
                                        <a href="${process.env.FRONTEND_URL}/orders?page=1&orderId=${order._id}" style="display: inline-block; padding: 15px 45px; background: linear-gradient(135deg, #ea580c 0%, #fb923c 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 10px;">
                                            Ver Orden Completa
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #94a3b8; text-align: center;">
                                ¿Tienes alguna pregunta sobre tu envío? Contáctanos en <a href="mailto:${process.env.ADMIN_EMAIL}" style="color: #ea580c; text-decoration: none;">${process.env.ADMIN_EMAIL}</a>
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
				subject: `🚚 Tu Orden Está en Camino, ${user.name}`,
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
