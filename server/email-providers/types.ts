/**
 * Email Provider Types and Interfaces
 * Defines the contract that all email providers must implement
 */

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

export interface EmailProvider {
  /**
   * Send a single email
   */
  send(message: EmailMessage): Promise<EmailSendResult>;

  /**
   * Send multiple emails
   */
  sendBatch(messages: EmailMessage[]): Promise<EmailSendResult[]>;

  /**
   * Verify email configuration
   */
  verify(): Promise<boolean>;

  /**
   * Get provider name
   */
  getName(): string;

  /**
   * Get provider status/health
   */
  getStatus(): Promise<{
    healthy: boolean;
    message: string;
  }>;
}

export type EmailProviderType = "mock" | "sendgrid" | "ses" | "mailgun";

export interface EmailProviderConfig {
  type: EmailProviderType;
  from: string;
  replyTo?: string;
  // Provider-specific config
  [key: string]: any;
}
