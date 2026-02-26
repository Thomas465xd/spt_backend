import resend from "../../config/resend";
import { UserEmailInterface } from "../../types";

export class SetPasswordEmail {
    static sendSetPasswordEmail = async (user: UserEmailInterface) => {
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
}
