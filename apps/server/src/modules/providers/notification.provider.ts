import { getConfig } from "@/config"
import { logger } from "@/core/utils/logger"

export type NotificationEvent =
  | "order_placed"
  | "payment_received"
  | "shipment_created"
  | "delivered"
  | "refund"
  | "otp"
  | "campaign_ad"

export interface NotificationProvider {
  send(
    event: NotificationEvent,
    recipient: { email?: string; phone?: string; pushEndpoint?: string },
    payload: any
  ): Promise<boolean>
}

export class MockNotificationProvider implements NotificationProvider {
  async send(
    event: NotificationEvent,
    recipient: { email?: string; phone?: string; pushEndpoint?: string },
    payload: any
  ): Promise<boolean> {
    logger.debug(`[MockNotification] Event: ${event}`, { recipient, payload })
    return true
  }
}

export class ResendNotificationProvider implements NotificationProvider {
  async send(
    event: NotificationEvent,
    recipient: { email?: string; phone?: string; pushEndpoint?: string },
    payload: any
  ): Promise<boolean> {
    const config = getConfig()
    const apiKey = config.email.resendApiKey

    if (!recipient.email) return false

    logger.info(`[ResendAPI] Sending email to ${recipient.email}`, { event, subject: payload.subject })

    // In a real implementation:
    // const resend = new Resend(apiKey);
    // await resend.emails.send({
    //   from: 'onboarding@resend.dev',
    //   to: recipient.email,
    //   subject: payload.subject,
    //   html: payload.body
    // });

    return true
  }
}

export class PushNotificationProvider implements NotificationProvider {
  async send(
    event: NotificationEvent,
    recipient: {
      email?: string
      phone?: string
      pushEndpoint?: string
      pushKeys?: any
    },
    payload: any
  ): Promise<boolean> {
    if (!recipient.pushEndpoint || !recipient.pushKeys) return false

    logger.info(`[WebPush] Sending push notification`, { event, endpoint: recipient.pushEndpoint, title: payload.title })

    // In a real implementation:
    // webpush.setVapidDetails('mailto:test@example.com', publicVapidKey, privateVapidKey);
    // await webpush.sendNotification({ endpoint: recipient.pushEndpoint, keys: recipient.pushKeys }, JSON.stringify(payload));

    return true
  }
}
