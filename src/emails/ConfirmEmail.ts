import { response } from "express";
import resend from "../config/resend";

interface EmailInterface {
    userId: string;
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
    static sendAcknowledgementEmail = async (user: UserEmailInterface) => {
        try {
            const emailHtml = `
                <div style="font-family: 'Inter', Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; line-height: 1.6;">
                    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <div style="background-color: #f57c00; color: white; padding: 30px; border-top-left-radius: 12px; border-top-right-radius: 12px; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px; color: white;">¡Bienvenido a Portal SPT! 👋</h1>
                        </div>
                        
                        <div style="padding: 30px; color: #333;">
                            <p style="font-size: 16px;">Hola <strong>${user.name}</strong>,</p>
                            
                            <p style="font-size: 16px; margin-bottom: 20px;">
                                Gracias por registrarte en Portal SPT. Tu solicitud de ingreso ha sido recibida y está siendo procesada por nuestro equipo de administración.
                            </p>
                            
                            <div style="background-color: #f9f9f9; border-left: 4px solid #f57c00; padding: 15px; margin-bottom: 20px;">
                                <p style="margin: 0; font-size: 14px; color: #666;">
                                    <strong>Próximos pasos:</strong><br>
                                    Revisaremos tu solicitud y te enviaremos un correo electrónico con instrucciones de confirmación en breve.
                                </p>
                            </div>
                            
                            <p style="font-size: 16px; margin-bottom: 20px;">
                                Si tienes alguna pregunta, no dudes en contactarnos respondiendo a este correo.
                            </p>
                            
                            <div style="text-align: center; margin-top: 30px;">
                                <p style="font-size: 14px; color: #666;">
                                    © 2024 Portal SPT | Todos los derechos reservados
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 10px; color: #888; font-size: 12px;">
                        Este es un correo electrónico automático. Por favor, no respondas a este mensaje.
                    </div>
                </div>
            `;

            const mailOptions = {
                from: `"Portal SPT" <${process.env.NOREPLY_EMAIL}>`,
                to: [user.email],
                subject: "¡Bienvenido a Portal SPT! 👋",
                html: emailHtml,
            };

            try {
                const response = await resend.emails.send(mailOptions);
                console.log("✅ Email sent successfully", user.email);
                console.log(response)
            } catch (error) {
                console.log("❌ Error sending email:", error);
            }

        } catch (error) {
            console.error("❌ Error sending email:", error);    
        }
    }

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
                            <a href="${process.env.FRONTEND_URL}/admin/confirm?confirmUser=${user.userId}" 
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

            await resend.emails.send({
                from: `"SPT - Confirmación de Usuario" <${process.env.NOREPLY_EMAIL}>`,
                to: [adminEmail],
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
            const confirmationLink = `${process.env.FRONTEND_URL}/auth/set-password/${user.token}`;

            const mailOptions = {
                from:  `"Portal SPT" <${process.env.NOREPLY_EMAIL}>`,
                to: user.email,
                subject: "¡Tu cuenta ha sido aprobada! ✅ Configura tu contraseña",
                html: `
                    <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; background-color: #000; padding: 20px; border-radius: 10px; color: #fff;">
                        <div style="background-color: #ff7300; padding: 15px; border-radius: 8px 8px 0 0; text-align: center;">
                            <h2 style="margin: 0; color: #fff;">¡Bienvenido a Portal SPT! 👋</h2>
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

            await resend.emails.send(mailOptions);
        } catch (error) {
            console.error("Error sending confirmation email:", error);
        }
    }

    static sendPasswordResetEmail = async (user: UserEmailInterface) => {
        try {
            const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password/${user.token}`;
    
            const mailOptions = {
                from: `"Portal SPT" <${process.env.NOREPLY_EMAIL}>`,
                to: [user.email],
                subject: "🔐 Restablece tu contraseña",
                html: `
                    <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; background-color: #000; padding: 20px; border-radius: 10px; color: #fff;">
                        <div style="background-color: #ff7300; padding: 15px; border-radius: 8px 8px 0 0; text-align: center;">
                            <h2 style="margin: 0; color: #fff;">Restablecer tu contraseña ⚙️</h2>
                        </div>
                        <div style="padding: 20px; background-color: #222; border-radius: 0 0 8px 8px;">
                            <p>👋 Hola <strong>${user.name}</strong>,</p>
                            <p>Hemos recibido una solicitud para restablecer tu contraseña en <strong>Portal SPT</strong>. Si realizaste esta solicitud, haz clic en el botón de abajo para crear una nueva contraseña.</p>
                            <div style="text-align: center; margin: 20px 0;">
                                <a href="${resetLink}" style="background-color: #ff7300; color: #fff; padding: 12px 20px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">Restablecer Contraseña</a>
                            </div>
                            <p>Si no solicitaste este cambio, puedes ignorar este mensaje. Tu contraseña actual seguirá siendo la misma. 🚀</p>
                            <p style="color: #ff7300; text-align: center;">Equipo Portal SPT</p>
                        </div>
                        <p style="text-align: center; font-size: 12px; margin-top: 15px; color: #aaa;">
                            © ${new Date().getFullYear()} portal SPT | Todos los derechos reservados.
                        </p>
                    </div>
                `
            };
    
            await resend.emails.send(mailOptions);
            console.log("✅ Password reset email sent successfully!");
        } catch (error) {
            console.error("❌ Error sending password reset email:", error);
        }
    };
    
}
