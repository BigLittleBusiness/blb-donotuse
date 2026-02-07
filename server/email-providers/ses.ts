/**
 * AWS SES Email Provider
 * Production-ready email provider using Amazon SES
 *
 * Setup Instructions:
 * 1. Install AWS SDK: npm install @aws-sdk/client-ses
 * 2. Configure AWS credentials (IAM user with SES permissions)
 * 3. Set AWS_REGION environment variable
 * 4. Set EMAIL_PROVIDER=ses in .env
 * 5. Verify sender email in SES console
 */

import { EmailMessage, EmailProvider, EmailSendResult } from "./types";

// Lazy import to avoid requiring AWS SDK if not using it
let SESClient: any = null;
let SendEmailCommand: any = null;

async function getAWSClients() {
  if (!SESClient) {
    try {
      const sesModule = await import("@aws-sdk/client-ses");
      SESClient = sesModule.SESClient;
      SendEmailCommand = sesModule.SendEmailCommand;
    } catch (error) {
      throw new Error(
        "AWS SDK not installed. Run: npm install @aws-sdk/client-ses"
      );
    }
  }
  return { SESClient, SendEmailCommand };
}

export class AWSSeEmailProvider implements EmailProvider {
  private from: string;
  private region: string;
  private client: any = null;

  constructor(config: { from: string; region?: string }) {
    this.from = config.from;
    this.region = config.region || process.env.AWS_REGION || "us-east-1";
  }

  private async getClient() {
    if (!this.client) {
      const { SESClient: SES } = await getAWSClients();
      this.client = new SES({ region: this.region });
    }
    return this.client;
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    try {
      const { SendEmailCommand: SendEmail } = await getAWSClients();
      const client = await this.getClient();

      const toAddresses = Array.isArray(message.to) ? message.to : [message.to];

      const command = new SendEmail({
        Source: message.from || this.from,
        Destination: {
          ToAddresses: toAddresses,
          CcAddresses: message.cc,
          BccAddresses: message.bcc,
        },
        Message: {
          Subject: {
            Data: message.subject,
            Charset: "UTF-8",
          },
          Body: {
            Html: message.html
              ? {
                  Data: message.html,
                  Charset: "UTF-8",
                }
              : undefined,
            Text: message.text
              ? {
                  Data: message.text,
                  Charset: "UTF-8",
                }
              : undefined,
          },
        },
        ReplyToAddresses: message.replyTo ? [message.replyTo] : undefined,
      });

      const response = await client.send(command);

      return {
        success: true,
        messageId: response.MessageId,
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error("[AWS SES Provider] Error sending email:", error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  async sendBatch(messages: EmailMessage[]): Promise<EmailSendResult[]> {
    // AWS SES doesn't have a native batch API, so send individually
    return Promise.all(messages.map((msg) => this.send(msg)));
  }

  async verify(): Promise<boolean> {
    try {
      const client = await this.getClient();

      // Try to get account attributes to verify credentials
      const GetAccountAttributesCommand = (
        await import("@aws-sdk/client-ses")
      ).GetAccountAttributesCommand;

      await client.send(new GetAccountAttributesCommand({}));

      console.log("[AWS SES Provider] Configuration verified successfully");
      return true;
    } catch (error: any) {
      console.error(
        "[AWS SES Provider] Configuration verification failed:",
        error.message
      );
      return false;
    }
  }

  getName(): string {
    return "AWS SES Email Provider";
  }

  async getStatus() {
    const verified = await this.verify();
    return {
      healthy: verified,
      message: verified ? "AWS SES is configured and ready" : "AWS SES configuration error",
    };
  }
}
