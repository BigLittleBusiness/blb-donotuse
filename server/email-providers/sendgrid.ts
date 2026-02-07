/**
 * SendGrid Email Provider
 * Production-ready email provider using SendGrid API
 *
 * Setup Instructions:
 * 1. Install SendGrid: npm install @sendgrid/mail
 * 2. Set SENDGRID_API_KEY environment variable
 * 3. Set EMAIL_PROVIDER=sendgrid in .env
 */

import { EmailMessage, EmailProvider, EmailSendResult } from "./types";

// Lazy import to avoid requiring SendGrid if not using it
let sgMail: any = null;

async function getSendGridClient() {
  if (!sgMail) {
    try {
      const module = await import("@sendgrid/mail");
      sgMail = module.default;
    } catch (error) {
      throw new Error(
        "SendGrid module not installed. Run: npm install @sendgrid/mail"
      );
    }
  }
  return sgMail;
}

export class SendGridEmailProvider implements EmailProvider {
  private from: string;
  private apiKey: string;

  constructor(config: { from: string; apiKey: string }) {
    this.from = config.from;
    this.apiKey = config.apiKey;

    if (!this.apiKey) {
      throw new Error("SendGrid API key not provided. Set SENDGRID_API_KEY environment variable.");
    }
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    try {
      const sgMail = await getSendGridClient();
      sgMail.setApiKey(this.apiKey);

      const msg = {
        to: message.to,
        from: message.from || this.from,
        subject: message.subject,
        html: message.html,
        text: message.text,
        replyTo: message.replyTo,
        cc: message.cc,
        bcc: message.bcc,
      };

      const response = await sgMail.send(msg);

      return {
        success: true,
        messageId: response[0].headers["x-message-id"],
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("[SendGrid Provider] Error sending email:", error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  async sendBatch(messages: EmailMessage[]): Promise<EmailSendResult[]> {
    try {
      const sgMail = await getSendGridClient();
      sgMail.setApiKey(this.apiKey);

      const msgObjects = messages.map((message) => ({
        to: message.to,
        from: message.from || this.from,
        subject: message.subject,
        html: message.html,
        text: message.text,
        replyTo: message.replyTo,
        cc: message.cc,
        bcc: message.bcc,
      }));

      const response = await sgMail.sendMultiple(msgObjects);

      return response.map((res: any, index: number) => ({
        success: res.statusCode >= 200 && res.statusCode < 300,
        messageId: res.headers?.["x-message-id"],
        error: res.statusCode >= 400 ? res.body?.errors?.[0]?.message : undefined,
        timestamp: new Date(),
      }));
    } catch (error: any) {
      console.error("[SendGrid Provider] Error sending batch:", error.message);
      return messages.map(() => ({
        success: false,
        error: error.message,
        timestamp: new Date(),
      }));
    }
  }

  async verify(): Promise<boolean> {
    try {
      const sgMail = await getSendGridClient();
      sgMail.setApiKey(this.apiKey);

      // Test with a simple request
      await sgMail.validate([
        {
          to: "test@example.com",
          from: this.from,
          subject: "Test",
          text: "Test",
        },
      ]);

      console.log("[SendGrid Provider] Configuration verified successfully");
      return true;
    } catch (error: any) {
      console.error("[SendGrid Provider] Configuration verification failed:", error.message);
      return false;
    }
  }

  getName(): string {
    return "SendGrid Email Provider";
  }

  async getStatus() {
    const verified = await this.verify();
    return {
      healthy: verified,
      message: verified ? "SendGrid is configured and ready" : "SendGrid configuration error",
    };
  }
}
