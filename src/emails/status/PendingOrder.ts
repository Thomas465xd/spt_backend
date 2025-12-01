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

// export enum OrderStatus {
//     Pending = "Pendiente",
//     Sent = "En Transito", 
//     Delivered = "Entregado", 
//     Cancelled = "Cancelado"
// }; 

// interface OrderItem {
//     sku: string; 
//     name: string; 
//     price: number; 
//     quantity: number; 
//     lineTotal: number; // lineTotal = price * quantity
// }

// // Document interface = what exists after saving in Mongo
// // An interface that describes the properties that a Order Document has
// export interface OrderInterface extends Document {
//     //! Products
//     items: OrderItem[];
    
//     payment: string
//     shipper: string
//     status: string
//     country: string

//     total: number

//     // Using populate will get other user data
//     // Either though businessRut & businessName is redundant here since we got the userId, 
//     // it can serve a searching purpose when trying to find all registered orders by
//     // a business, reducing the complexity of the query.
//     businessName: string
//     businessRut: string
//     user: Types.ObjectId | UserInterface; 

//     //TODO: General Business Data

//     // ordering date
//     createdAt: Date; 
//     updatedAt: Date; 
// }

export class PendingOrderEmail {
    static sendPendingOrderEmail = async (user: UserInterface) => { 
        try {
            // Pending HTML
            const emailHTML = ``;
            const mailOptions = {
                from: `"Portal SPT" <${process.env.NOREPLY_EMAIL}>`,
                to: [user.email], 
                subject: `🎉📦 Tu Orden a sido Registrada, ${user.name}`, 
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