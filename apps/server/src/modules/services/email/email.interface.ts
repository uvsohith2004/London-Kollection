export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  replyTo?: string;
}

export interface IEmailService {
  sendEmail(options: SendEmailOptions): Promise<boolean>;
}
