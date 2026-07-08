import { Resend } from "resend";
import { IEmailService, SendEmailOptions } from "./email.interface";

export class ResendProvider implements IEmailService {
  private resend: Resend;
  private fromEmail: string;

  constructor(config: { apiKey: string; from: string }) {
    this.resend = new Resend(config.apiKey);
    this.fromEmail = config.from;
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        text: options.text || "",
        html: options.html,
      });

      if (error) {
        console.error("Resend Error:", error);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Resend Exception:", error);
      return false;
    }
  }
}
