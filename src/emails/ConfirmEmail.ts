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

export class ConfirmEmail {
    static sendConfirmationEmailToAdmin = async (user: EmailInterface) => {

    }    
}
