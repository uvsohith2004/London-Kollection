import * as nodemailer from "nodemailer";
import { IEmailService, SendEmailOptions } from "./email.interface";

export class NodemailerProvider implements IEmailService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;

  constructor(config: { host: string; port: number; secure: boolean; user: string; pass: string; from: string }) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
    this.fromEmail = config.from;
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      return true;
    } catch (error) {
      console.error("Nodemailer Error:", error);
      return false;
    }
  }
}
