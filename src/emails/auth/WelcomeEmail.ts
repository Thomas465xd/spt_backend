import resend from "../../config/resend";
import { InternalServerError } from "../../errors/server-error";
import { UserEmailInterface } from "../../types";

export class WelcomeEmail {
    static sendWelcomeEmail = async (user: UserEmailInterface) => {
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

            const response = await resend.emails.send(mailOptions);
            console.log("✅ Email sent successfully", user.email);
            console.log(response)
        } catch (error) {
            console.error("❌ Error sending email:", error);    
            throw new InternalServerError(); 
        }
    };
}
