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
                replyTo: "contacto@sptrade.cl"
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
                from: `"Portal SPT" <${process.env.NOREPLY_EMAIL}>`,
                to: user.email,
                subject: "¡Tu cuenta ha sido aprobada! ✅ Configura tu contraseña",
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Bienvenido a Portal SPT</title>
                    <style>
                        body {
                            font-family: 'Segoe UI', Arial, sans-serif;
                            line-height: 1.6;
                            margin: 0;
                            padding: 0;
                            background-color: #f7f7f7;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 20px auto;
                            border-radius: 12px;
                            overflow: hidden;
                            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            background-color: #FF8C00;
                            padding: 30px 20px;
                            text-align: center;
                        }
                        .logo {
                            max-width: 180px;
                            margin-bottom: 15px;
                        }
                        .header h1 {
                            color: white;
                            margin: 0;
                            font-size: 28px;
                            letter-spacing: 0.5px;
                        }
                        .header p {
                            color: rgba(255, 255, 255, 0.9);
                            margin: 10px 0 0;
                            font-size: 16px;
                        }
                        .content {
                            background-color: white;
                            padding: 35px 30px;
                        }
                        .welcome-text {
                            font-size: 18px;
                            margin-bottom: 25px;
                            color: #333;
                        }
                        .highlight {
                            color: #FF8C00;
                            font-weight: bold;
                        }
                        .button-container {
                            text-align: center;
                            margin: 30px 0;
                        }
                        .button {
                            display: inline-block;
                            background-color: #FF8C00;
                            color: white;
                            padding: 14px 30px;
                            text-decoration: none;
                            border-radius: 6px;
                            font-weight: bold;
                            font-size: 16px;
                            transition: background-color 0.3s;
                        }
                        .button:hover {
                            background-color: #e67e00;
                        }
                        .divider {
                            height: 1px;
                            background-color: #eee;
                            margin: 30px 0;
                        }
                        .footer {
                            background-color: #f9f9f9;
                            padding: 20px;
                            text-align: center;
                            font-size: 14px;
                            color: #666;
                        }
                        .footer-logo {
                            font-weight: bold;
                            color: #FF8C00;
                        }
                        .note {
                            font-size: 14px;
                            color: #777;
                            font-style: italic;
                        }
                        .steps {
                            background-color: #f9f9f9;
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                        .steps h3 {
                            margin-top: 0;
                            color: #FF8C00;
                        }
                        .steps ol {
                            margin-bottom: 0;
                            padding-left: 20px;
                        }
                        .steps li {
                            margin-bottom: 10px;
                        }
                        .steps li:last-child {
                            margin-bottom: 0;
                        }
                        .warning {
                            font-size: 13px;
                            color: #888;
                            margin-top: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>¡Bienvenido a Portal SPT! 👋</h1>
                            <p>Tu cuenta ha sido aprobada</p>
                        </div>
                        
                        <div class="content">
                            <p class="welcome-text">Hola <span class="highlight">${user.name}</span>,</p>
                            
                            <p>Nos complace informarte que tu cuenta en <strong>Portal SPT</strong> ha sido revisada y aprobada por nuestro equipo administrativo.</p>
                            
                            <p>Para comenzar a utilizar todas las funcionalidades de la plataforma, solo falta un paso más: configurar tu contraseña de acceso.</p>
                            
                            <div class="steps">
                                <h3>¿Qué sigue?</h3>
                                <ol>
                                    <li>Haz clic en el botón "Configurar Contraseña" a continuación</li>
                                    <li>Establece una contraseña segura</li>
                                    <li>¡Inicia sesión y comienza a utilizar Portal SPT!</li>
                                </ol>
                            </div>
                            
                            <div class="button-container">
                                <a href="${confirmationLink}" class="button">Configurar Contraseña</a>
                            </div>
                            
                            <p class="note">Este enlace es válido por 24 horas. Si expira, por favor contacta a soporte para solicitar uno nuevo.</p>
                            
                            <div class="divider"></div>
                            
                            <p>Gracias por unirte a <span class="highlight">Portal SPT</span>. Estamos emocionados de tenerte como parte de nuestra comunidad.</p>
                            
                            <p class="warning">Si no solicitaste esta cuenta, por favor ignora este mensaje o contacta con nuestro equipo de soporte.</p>
                        </div>
                        
                        <div class="footer">
                            <p>© 2025 <span class="footer-logo">Portal SPT</span> - Todos los derechos reservados</p>
                            <p>Este es un correo automático, por favor no responda a este mensaje.</p>
                        </div>
                    </div>
                </body>
                </html>
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
    
            const emailHtml = `
                <div style="font-family: 'Inter', Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; line-height: 1.6;">
                    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <div style="background-color: #f57c00; color: white; padding: 30px; border-top-left-radius: 12px; border-top-right-radius: 12px; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px; color: white;">Restablece tu contraseña 🔐</h1>
                        </div>
                        
                        <div style="padding: 30px; color: #333;">
                            <p style="font-size: 16px;">Hola <strong>${user.name}</strong>,</p>
                            
                            <p style="font-size: 16px; margin-bottom: 20px;">
                                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Portal SPT. Haz clic en el botón a continuación para crear una nueva contraseña:
                            </p>
                            
                            <div style="text-align: center; margin: 25px 0;">
                                <a href="${resetLink}" style="background-color: #f57c00; color: white; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">Restablecer Contraseña</a>
                            </div>
                            
                            <div style="background-color: #f9f9f9; border-left: 4px solid #f57c00; padding: 15px; margin-bottom: 20px;">
                                <p style="margin: 0; font-size: 14px; color: #666;">
                                    <strong>Importante:</strong><br>
                                    Si no solicitaste este cambio, puedes ignorar este mensaje. Tu contraseña actual seguirá siendo la misma.
                                </p>
                            </div>
                            
                            <p style="font-size: 16px; margin-bottom: 20px;">
                                Si el botón no funciona, copia y pega este enlace en tu navegador:
                            </p>
                            
                            <p style="font-size: 14px; word-break: break-all; background-color: #f9f9f9; padding: 12px; border-radius: 6px;">
                                ${resetLink}
                            </p>
                            
                            <p style="font-size: 16px; margin-top: 20px;">
                                Gracias por usar Portal SPT.
                            </p>
                            
                            <div style="text-align: center; margin-top: 30px;">
                                <p style="font-size: 14px; color: #666;">
                                    © ${new Date().getFullYear()} Portal SPT | Todos los derechos reservados
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
                subject: "Restablece tu contraseña en Portal SPT",
                html: emailHtml,
            };
    
            try {
                const response = await resend.emails.send(mailOptions);
                console.log("✅ Password reset email sent successfully!", user.email);
                console.log(response);
            } catch (error) {
                console.log("❌ Error sending password reset email:", error);
            }
    
        } catch (error) {
            console.error("❌ Error sending password reset email:", error);    
        }
    };
}
