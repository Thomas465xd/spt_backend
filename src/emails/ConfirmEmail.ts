import { transporter } from "../config/nodemailer";

interface EmailInterface {
    email: string;
    name: string;
    businessName: string;
    rut: string;
    businessRut: string;
    address: string;
    phone: string;
    token: string;
}

interface UserEmailInterface {
    email: string
    name: string
    token: string
}

export class ConfirmEmail {
    static sendConfirmationEmailToAdmin = async (user: EmailInterface) => {
        try {
            const adminEmail = process.env.ADMIN_EMAIL; // Set this in your .env file

            const emailHtml = `
                <div style="font-family: Arial, sans-serif; background-color: #212121; padding: 20px; color: #ffffff;">
                    <div style="max-width: 600px; margin: auto; background-color: #f57c00; padding: 30px; border-radius: 10px;">
                        <h2 style="color: #ffffff; text-align: center;">🔍 Nueva Solicitud de Registro</h2>
                        <p style="font-size: 16px; text-align: center;">
                            Un nuevo usuario ha solicitado acceso a la plataforma. Por favor, revisa los detalles y confirma su registro.
                        </p>
                        <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; color: #212121;">
                            <p><strong>📛 Nombre:</strong> ${user.name}</p>
                            <p><strong>🏢 Empresa:</strong> ${user.businessName}</p>
                            <p><strong>🆔 RUT Personal:</strong> ${user.rut}</p>
                            <p><strong>🏢 RUT Empresa:</strong> ${user.businessRut}</p>
                            <p><strong>📍 Dirección:</strong> ${user.address}</p>
                            <p><strong>📞 Teléfono:</strong> ${user.phone}</p>
                            <p><strong>📧 Correo:</strong> ${user.email}</p>
                        </div>
                        <div style="text-align: center; margin-top: 20px;">
                            <a href="${process.env.BASE_URL}/admin/confirm/${user.token}" 
                                style="display: inline-block; background-color: #212121; color: #ffffff; text-decoration: none; 
                                        padding: 12px 25px; font-size: 16px; border-radius: 5px; font-weight: bold;">
                                ✅ Confirmar Usuario
                            </a>
                        </div>
                        <p style="text-align: center; font-size: 14px; margin-top: 20px;">
                            Si no reconoces esta solicitud, puedes ignorar este correo.
                        </p>
                    </div>
                    <p style="text-align: center; font-size: 12px; margin-top: 15px;">
                        © ${new Date().getFullYear()} SPT | Todos los derechos reservados.
                    </p>
                </div>
            `;

            await transporter.sendMail({
                from: `"SPT - Confirmación de Usuario" <noreply@spt.com>`,
                to: adminEmail,
                subject: "🔔 Nueva Solicitud de Registro",
                html: emailHtml,
            });

            console.log("✅ Email sent to admin successfully!");
        } catch (error) {
            console.error("❌ Error sending email:", error);
        }
    };

    static sendConfirmationEmailToUser = async (user: UserEmailInterface) => {
        try {
            const confirmationLink = `https://portal-spt.com/set-password?token=${user.token}`;

            const mailOptions = {
                from: '"Portal SPT" <no-reply@portal-spt.com>',
                to: user.email,
                subject: "¡Tu cuenta ha sido aprobada! Configura tu contraseña",
                html: `
                    <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; background-color: #000; padding: 20px; border-radius: 10px; color: #fff;">
                        <div style="background-color: #ff7300; padding: 15px; border-radius: 8px 8px 0 0; text-align: center;">
                            <h2 style="margin: 0; color: #fff;">¡Bienvenido a Portal SPT!</h2>
                        </div>
                        <div style="padding: 20px; background-color: #222; border-radius: 0 0 8px 8px;">
                            <p>Hola <strong>${user.name}</strong>,</p>
                            <p>Tu cuenta ha sido aprobada por el administrador de <strong>Portal SPT</strong>. Solo falta un paso más: configurar tu contraseña.</p>
                            <p>Presiona el siguiente botón para establecer tu contraseña y comenzar a usar tu cuenta.</p>
                            <div style="text-align: center; margin: 20px 0;">
                                <a href="${confirmationLink}" style="background-color: #ff7300; color: #fff; padding: 12px 20px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">Configurar Contraseña</a>
                            </div>
                            <p>Si no solicitaste esta cuenta, ignora este mensaje.</p>
                            <p style="color: #ff7300; text-align: center;">Equipo Portal SPT</p>
                        </div>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error("Error sending confirmation email:", error);
        }
    }
}
