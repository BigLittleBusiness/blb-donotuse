/**
 * Mock Email Provider
 * Used for development and testing - logs emails to console instead of sending
 */

import { EmailMessage, EmailProvider, EmailSendResult } from "./types";

export class MockEmailProvider implements EmailProvider {
  private from: string;
  private sentEmails: EmailMessage[] = [];

  constructor(config: { from: string }) {
    this.from = config.from;
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const messageId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const enrichedMessage = { ...message, from: message.from || this.from };

    this.sentEmails.push(enrichedMessage);

    console.log("[Mock Email Provider] Email sent:");
    console.log(`  To: ${Array.isArray(message.to) ? message.to.join(", ") : message.to}`);
    console.log(`  Subject: ${message.subject}`);
    console.log(`  Message ID: ${messageId}`);

    return {
      success: true,
      messageId,
      timestamp: new Date(),
    };
  }

  async sendBatch(messages: EmailMessage[]): Promise<EmailSendResult[]> {
    return Promise.all(messages.map((msg) => this.send(msg)));
  }

  async verify(): Promise<boolean> {
    console.log("[Mock Email Provider] Configuration verified");
    return true;
  }

  getName(): string {
    return "Mock Email Provider";
  }

  async getStatus() {
    return {
      healthy: true,
      message: "Mock provider is ready for development",
    };
  }

  /**
   * Get all emails sent (for testing)
   */
  getSentEmails(): EmailMessage[] {
    return [...this.sentEmails];
  }

  /**
   * Clear sent emails (for testing)
   */
  clearSentEmails(): void {
    this.sentEmails = [];
  }
}
