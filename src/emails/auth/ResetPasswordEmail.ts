import resend from "../../config/resend";
import { InternalServerError } from "../../errors/server-error";
import { UserEmailInterface } from "../../types";

export class ResetPasswordEmail {
	static sendResetPasswordEmail = async (user: UserEmailInterface) => {
		try {
			const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password/${user.token}`;

			const emailHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablece tu contraseña</title>
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
                            <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #ffffff;">Restablece tu Contraseña 🔐</h1>
                            <p style="margin: 8px 0 0 0; font-size: 15px; color: rgba(255,255,255,0.9);">Solicitud de cambio de contraseña</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 35px; background-color: #ffffff;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #1e293b;">
                                Hola <strong>${user.name}</strong>,
                            </p>
                            <p style="margin: 0 0 25px 0; font-size: 15px; line-height: 1.7; color: #475569;">
                                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Portal SPT. Haz clic en el botón a continuación para crear una nueva contraseña.
                            </p>

                            <!-- CTA Button -->
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding: 10px 0 30px;">
                                        <a href="${resetLink}" style="display: inline-block; padding: 15px 45px; background: linear-gradient(135deg, #ea580c 0%, #fb923c 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 10px;">
                                            Restablecer Contraseña
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <!-- Warning box -->
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 25px 0; background-color: #fff7ed; border-left: 4px solid #ea580c; border-radius: 6px;">
                                <tr>
                                    <td style="padding: 16px 20px;">
                                        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #475569;">
                                            <strong style="color: #ea580c;">⚠️ Importante:</strong> Si no solicitaste este cambio, puedes ignorar este mensaje. Tu contraseña actual seguirá siendo la misma.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 10px 0; font-size: 14px; color: #475569;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                            <p style="margin: 0 0 25px 0; font-size: 13px; word-break: break-all; background-color: #f8fafc; padding: 12px; border-radius: 6px; color: #64748b; border: 1px solid #e2e8f0;">
                                ${resetLink}
                            </p>

                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #94a3b8; text-align: center;">
                                ¿Tienes preguntas? Contáctanos en <a href="mailto:${process.env.ADMIN_EMAIL}" style="color: #ea580c; text-decoration: none;">${process.env.ADMIN_EMAIL}</a>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #1e293b; padding: 30px 35px; text-align: center; border-radius: 0 0 16px 16px;">
                            <p style="margin: 0 0 6px 0; font-size: 15px; font-weight: 600; color: #ffffff;">Portal SPT</p>
                            <p style="margin: 0 0 12px 0; font-size: 13px; color: #94a3b8;">Spare Parts Trade</p>
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
				subject: "Restablece tu contraseña en Portal SPT 🔐",
				html: emailHtml,
			};

			const response = await resend.emails.send(mailOptions);
			console.log(
				"✅ Password reset email sent successfully!",
				user.email,
			);
			console.log(response);
		} catch (error) {
			console.error("❌ Error sending email:", error);
			throw new InternalServerError();
		}
	};
}
