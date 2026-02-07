import { describe, it, expect, beforeEach } from "vitest";
import { MockEmailProvider } from "./mock";
import { initializeEmailProvider, resetEmailProvider, getEmailProvider } from "./factory";

describe("Email Providers", () => {
  beforeEach(() => {
    resetEmailProvider();
  });

  describe("Mock Email Provider", () => {
    it("should send a single email", async () => {
      const provider = new MockEmailProvider({ from: "test@example.com" });

      const result = await provider.send({
        to: "recipient@example.com",
        subject: "Test Email",
        html: "<p>Test content</p>",
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it("should send batch emails", async () => {
      const provider = new MockEmailProvider({ from: "test@example.com" });

      const messages = [
        {
          to: "user1@example.com",
          subject: "Test 1",
          text: "Content 1",
        },
        {
          to: "user2@example.com",
          subject: "Test 2",
          text: "Content 2",
        },
      ];

      const results = await provider.sendBatch(messages);

      expect(results).toHaveLength(2);
      expect(results.every((r) => r.success)).toBe(true);
    });

    it("should handle multiple recipients", async () => {
      const provider = new MockEmailProvider({ from: "test@example.com" });

      const result = await provider.send({
        to: ["user1@example.com", "user2@example.com"],
        subject: "Test Email",
        text: "Test content",
      });

      expect(result.success).toBe(true);
    });

    it("should verify configuration", async () => {
      const provider = new MockEmailProvider({ from: "test@example.com" });

      const verified = await provider.verify();

      expect(verified).toBe(true);
    });

    it("should return provider name", () => {
      const provider = new MockEmailProvider({ from: "test@example.com" });

      expect(provider.getName()).toBe("Mock Email Provider");
    });

    it("should return healthy status", async () => {
      const provider = new MockEmailProvider({ from: "test@example.com" });

      const status = await provider.getStatus();

      expect(status.healthy).toBe(true);
      expect(status.message).toBeDefined();
    });

    it("should track sent emails for testing", async () => {
      const provider = new MockEmailProvider({ from: "test@example.com" });

      await provider.send({
        to: "test@example.com",
        subject: "Test",
        text: "Test",
      });

      const sent = (provider as any).getSentEmails();
      expect(sent).toHaveLength(1);
      expect(sent[0].subject).toBe("Test");
    });

    it("should clear sent emails for testing", async () => {
      const provider = new MockEmailProvider({ from: "test@example.com" });

      await provider.send({
        to: "test@example.com",
        subject: "Test",
        text: "Test",
      });

      (provider as any).clearSentEmails();
      const sent = (provider as any).getSentEmails();
      expect(sent).toHaveLength(0);
    });
  });

  describe("Email Provider Factory", () => {
    it("should initialize mock provider by default", async () => {
      const provider = await initializeEmailProvider();

      expect(provider.getName()).toBe("Mock Email Provider");
    });

    it("should return same instance on subsequent calls", async () => {
      const provider1 = await initializeEmailProvider();
      const provider2 = await initializeEmailProvider();

      expect(provider1).toBe(provider2);
    });

    it("should get provider after initialization", async () => {
      await initializeEmailProvider();

      const provider = getEmailProvider();

      expect(provider).toBeDefined();
      expect(provider.getName()).toBe("Mock Email Provider");
    });

    it("should throw error if provider not initialized", () => {
      resetEmailProvider();

      expect(() => getEmailProvider()).toThrow(
        "Email provider not initialized"
      );
    });

    it("should reset provider instance", async () => {
      await initializeEmailProvider();

      resetEmailProvider();

      expect(() => getEmailProvider()).toThrow();
    });

    it("should initialize with custom config", async () => {
      const provider = await initializeEmailProvider({
        type: "mock",
        from: "custom@example.com",
      });

      const result = await provider.send({
        to: "test@example.com",
        subject: "Test",
        text: "Test",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Email Message Types", () => {
    it("should handle email with HTML content", async () => {
      const provider = new MockEmailProvider({ from: "test@example.com" });

      const result = await provider.send({
        to: "test@example.com",
        subject: "HTML Email",
        html: "<h1>Hello</h1><p>This is HTML</p>",
      });

      expect(result.success).toBe(true);
    });

    it("should handle email with text content", async () => {
      const provider = new MockEmailProvider({ from: "test@example.com" });

      const result = await provider.send({
        to: "test@example.com",
        subject: "Text Email",
        text: "This is plain text",
      });

      expect(result.success).toBe(true);
    });

    it("should handle email with CC and BCC", async () => {
      const provider = new MockEmailProvider({ from: "test@example.com" });

      const result = await provider.send({
        to: "recipient@example.com",
        cc: ["cc@example.com"],
        bcc: ["bcc@example.com"],
        subject: "Email with CC/BCC",
        text: "Test",
      });

      expect(result.success).toBe(true);
    });

    it("should handle email with reply-to", async () => {
      const provider = new MockEmailProvider({ from: "test@example.com" });

      const result = await provider.send({
        to: "recipient@example.com",
        replyTo: "reply@example.com",
        subject: "Email with Reply-To",
        text: "Test",
      });

      expect(result.success).toBe(true);
    });

    it("should use custom from address", async () => {
      const provider = new MockEmailProvider({ from: "default@example.com" });

      const result = await provider.send({
        to: "recipient@example.com",
        from: "custom@example.com",
        subject: "Custom From",
        text: "Test",
      });

      expect(result.success).toBe(true);
    });
  });
});
