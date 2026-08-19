import resend from "../../config/resend";
import { InternalServerError } from "../../errors/server-error";
import { UserEmailInterface } from "../../types";

export class SetPasswordEmail {
	static sendSetPasswordEmail = async (user: UserEmailInterface) => {
		try {
			const confirmationLink = `${process.env.FRONTEND_URL}/auth/set-password/${user.token}`;

			const emailHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>¡Tu cuenta ha sido aprobada!</title>
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
                            <h1 style="margin: 0; font-size: 26px; font-weight: 700; color: #ffffff;">¡Tu cuenta ha sido aprobada! ✅</h1>
                            <p style="margin: 8px 0 0 0; font-size: 15px; color: rgba(255,255,255,0.9);">Configura tu contraseña para comenzar</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 35px; background-color: #ffffff;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #1e293b;">
                                Hola <strong>${user.name}</strong>,
                            </p>
                            <p style="margin: 0 0 25px 0; font-size: 15px; line-height: 1.7; color: #475569;">
                                Tu cuenta en <strong>Portal SPT</strong> ha sido revisada y aprobada por nuestro equipo. Solo falta configurar tu contraseña para comenzar a usar la plataforma.
                            </p>

                            <!-- Steps box -->
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 30px 0; background-color: #fff7ed; border-left: 4px solid #ea580c; border-radius: 6px;">
                                <tr>
                                    <td style="padding: 20px 25px;">
                                        <p style="margin: 0 0 10px 0; font-size: 15px; font-weight: 600; color: #ea580c;">🚀 ¿Qué sigue?</p>
                                        <ol style="margin: 0; padding-left: 18px; color: #475569; font-size: 14px; line-height: 1.9;">
                                            <li>Haz clic en el botón "Configurar Contraseña"</li>
                                            <li>Establece una contraseña segura</li>
                                            <li>¡Inicia sesión y empieza a usar Portal SPT!</li>
                                        </ol>
                                    </td>
                                </tr>
                            </table>

                            <!-- CTA Button -->
                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding: 10px 0 30px;">
                                        <a href="${confirmationLink}" style="display: inline-block; padding: 15px 45px; background: linear-gradient(135deg, #ea580c 0%, #fb923c 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 10px;">
                                            Configurar Contraseña
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 0 0 25px 0; font-size: 13px; color: #94a3b8; text-align: center;">
                                Este enlace es válido por 24 horas.
                            </p>

                            <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #94a3b8; text-align: center;">
                                Si no solicitaste esta cuenta, ignora este mensaje o contáctanos en <a href="mailto:${process.env.ADMIN_EMAIL}" style="color: #ea580c; text-decoration: none;">${process.env.ADMIN_EMAIL}</a>
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
				to: user.email,
				subject:
					"¡Tu cuenta ha sido aprobada! ✅ Configura tu contraseña",
				html: emailHtml,
			};

			await resend.emails.send(mailOptions);
			console.log("✅ Set password email sent successfully!", user.email);
		} catch (error) {
			console.error("❌ Error sending set password email:", error);
			throw new InternalServerError();
		}
	};
}
