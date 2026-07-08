import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { IEmailService, SendEmailOptions } from "./email.interface";

export class SESProvider implements IEmailService {
  private sesClient: SESClient;
  private fromEmail: string;

  constructor(config: { region: string; accessKeyId: string; secretAccessKey: string; from: string }) {
    this.sesClient = new SESClient({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.fromEmail = config.from;
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      const command = new SendEmailCommand({
        Source: this.fromEmail,
        Destination: {
          ToAddresses: [options.to],
        },
        Message: {
          Subject: {
            Data: options.subject,
            Charset: "UTF-8",
          },
          Body: {
            ...(options.text && { Text: { Data: options.text, Charset: "UTF-8" } }),
            ...(options.html && { Html: { Data: options.html, Charset: "UTF-8" } }),
          },
        },
      });

      await this.sesClient.send(command);
      return true;
    } catch (error) {
      console.error("AWS SES Error:", error);
      return false;
    }
  }
}
