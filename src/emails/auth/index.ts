import { ResetPasswordEmail } from "./ResetPasswordEmail";
import { SetPasswordEmail } from "./SetPasswordEmail";
import { WelcomeEmail } from "./WelcomeEmail";

//* Common exports
export class UserEmails {
    static WelcomeEmail = {
        send: (WelcomeEmail.sendWelcomeEmail)
    }; 

    static SetPasswordEmail = {
        send: (SetPasswordEmail.sendSetPasswordEmail)
    }; 

    static ResetPasswordEmail = {
        send: (ResetPasswordEmail.sendResetPasswordEmail)
    }
}