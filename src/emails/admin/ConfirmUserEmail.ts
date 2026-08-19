import resend from "../../config/resend";
import { AdminEmailInterface } from "../../types";

export class ConfirmUserEmail {
	static sendConfirmUserEmail = async (user: AdminEmailInterface) => {
		try {
			const adminEmail = process.env.ADMIN_EMAIL;

			const emailHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nueva Solicitud de Registro</title>
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
                            <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #ffffff;">🔍 Nueva Solicitud de Registro</h1>
                            <p style="margin: 8px 0 0 0; font-size: 15px; color: rgba(255,255,255,0.9);">Un nuevo usuario requiere tu aprobación</p>
                        </td>
                    </tr>

                    <!-- Action Banner -->
                    <tr>
                        <td style="background-color: #fef3c7; padding: 14px 35px; text-align: center; border-bottom: 1px solid #fde68a;">
                            <p style="margin: 0; font-size: 14px; font-weight: 600; color: #92400e;">⚡ ACCIÓN REQUERIDA: Revisa y confirma al nuevo usuario</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 35px; background-color: #ffffff;">
                            <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.7; color: #475569;">
                                Un nuevo usuario ha solicitado acceso a la plataforma. Revisa los detalles a continuación y confirma o rechaza su registro.
                            </p>

                            <!-- User Details -->
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 30px 0; background-color: #f8fafc; border-radius: 10px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 20px 25px; border-bottom: 2px solid #e2e8f0;">
                                        <h2 style="margin: 0; font-size: 17px; font-weight: 600; color: #1e293b;">👤 Información del Cliente</h2>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px 25px;">
                                        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td style="padding: 7px 0; font-size: 14px; color: #64748b; width: 45%;">Nombre:</td>
                                                <td style="padding: 7px 0; font-size: 14px; font-weight: 600; color: #1e293b; text-align: right;">${user.name}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 7px 0; font-size: 14px; color: #64748b;">Empresa:</td>
                                                <td style="padding: 7px 0; font-size: 14px; font-weight: 600; color: #1e293b; text-align: right;">${user.businessName}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 7px 0; font-size: 14px; color: #64748b;">ID Personal (${user.idType}):</td>
                                                <td style="padding: 7px 0; font-size: 14px; font-weight: 600; color: #1e293b; text-align: right;">${user.personalId}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 7px 0; font-size: 14px; color: #64748b;">ID Empresa (${user.idType}):</td>
                                                <td style="padding: 7px 0; font-size: 14px; font-weight: 600; color: #1e293b; text-align: right;">${user.businessId}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 7px 0; font-size: 14px; color: #64748b;">País:</td>
                                                <td style="padding: 7px 0; font-size: 14px; font-weight: 600; color: #1e293b; text-align: right;">${user.country}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 7px 0; font-size: 14px; color: #64748b;">Dirección:</td>
                                                <td style="padding: 7px 0; font-size: 14px; font-weight: 600; color: #1e293b; text-align: right;">${user.address}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 7px 0; font-size: 14px; color: #64748b;">Teléfono:</td>
                                                <td style="padding: 7px 0; font-size: 14px; font-weight: 600; color: #1e293b; text-align: right;">${user.phone}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 7px 0; font-size: 14px; color: #64748b;">Email:</td>
                                                <td style="padding: 7px 0; font-size: 14px; font-weight: 600; color: #ea580c; text-align: right;">${user.email}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding: 10px 0 25px;">
                                        <a href="${process.env.FRONTEND_URL}/admin/confirm?confirmUser=${user.userId}" style="display: inline-block; padding: 15px 45px; background: linear-gradient(135deg, #ea580c 0%, #fb923c 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 10px;">
                                            ✅ Confirmar Usuario
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0; font-size: 13px; color: #94a3b8; text-align: center;">
                                Si no reconoces esta solicitud, puedes ignorar este correo.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1e293b; padding: 30px 35px; text-align: center; border-radius: 0 0 16px 16px;">
                            <p style="margin: 0 0 6px 0; font-size: 15px; font-weight: 600; color: #ffffff;">Portal SPT - Panel de Administración</p>
                            <p style="margin: 0 0 12px 0; font-size: 13px; color: #94a3b8;">Spare Parts Trade</p>
                            <p style="margin: 0; font-size: 11px; color: #64748b;">
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

			await resend.emails.send({
				from: `"Portal SPT - Administración" <${process.env.NOREPLY_EMAIL}>`,
				to: [adminEmail],
				subject: "🔔 Nueva Solicitud de Registro",
				html: emailHtml,
				replyTo: "contacto@sptrade.cl",
			});

			console.log("✅ Email sent to admin successfully!");
		} catch (error) {
			console.error("❌ Error sending email:", error);
		}
	};
}
