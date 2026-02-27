import resend from "../../config/resend";
import { AdminEmailInterface } from "../../types";

export class ConfirmUserEmail {
    static sendConfirmUserEmail = async (user: AdminEmailInterface) => {
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
                            <p><strong>🆔 Identificación Personal (${user.idType}):</strong> ${user.personalId}</p>
                            <p><strong>🏢 Identificación Empresa (${user.idType}):</strong> ${user.businessId}</p>
                            <p><strong>🌍 País:</strong> ${user.country}</p>
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
}
