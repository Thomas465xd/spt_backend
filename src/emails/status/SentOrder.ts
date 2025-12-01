import resend from "../../config/resend";
import { InternalServerError } from "../../errors/server-error";
import { UserInterface } from "../../models/User";

// export interface UserInterface extends Document {
//     // Base user info
//     name: string
//     businessName: string
//     rut: string
//     businessRut: string
//     email: string
//     phone: string
//     password: string

//     // User Unique Attributes
//     discount: number // Number between 0 and 100

//     // User Status
//     confirmed: boolean
//     passwordSet: boolean
//     admin: boolean

//     // Address Info
//     address: string
//     region: string
//     city: string
//     province: string
//     reference: string
//     postalCode: string
//     country: string
// }

export class SentOrderEmail {
    static sendSentOrderEmail = async (user: UserInterface) => { 
        try {
            // Sent HTML
            const emailHTML = ``;
            const mailOptions = {
                from: `"Portal SPT" <${process.env.NOREPLY_EMAIL}>`,
                to: [user.email], 
                subject: `🎉🚚 Tu Orden a sido Enviada, ${user.name}`, 
                html: emailHTML
            }

            const response = await resend.emails.send(mailOptions); 
            console.log("✅ Email sent successfully", user.email);
            console.log(response)
        } catch (error) {
            console.error("❌ Error sending email:", error);
            throw new InternalServerError(); 
        }
    }
}