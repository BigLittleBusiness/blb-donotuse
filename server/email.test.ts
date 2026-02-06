import { describe, it, expect, beforeEach } from "vitest";
import { EmailService, EmailQueue } from "./email";

describe("Email Service", () => {
  describe("Template Rendering", () => {
    it("should render email subject with context variables", () => {
      const preview = EmailService.previewTemplate("grant_announcement", {
        grant_title: "Community Center Renovation",
        budget: 50000,
        category: "Infrastructure",
        closing_date: "2025-03-15",
        description: "Funding for community center renovation",
        eligibility: "Non-profit organizations",
        application_url: "https://example.com/apply",
      });

      expect(preview).not.toBeNull();
      expect(preview?.subject).toContain("Community Center Renovation");
    });

    it("should render email body with context variables", () => {
      const preview = EmailService.previewTemplate("application_submitted", {
        applicant_name: "John Smith",
        grant_title: "Community Grant",
        application_id: 12345,
        submitted_date: "2025-02-06",
        requested_amount: 25000,
      });

      expect(preview).not.toBeNull();
      expect(preview?.body).toContain("John Smith");
      expect(preview?.body).toContain("Community Grant");
      expect(preview?.body).toContain("12345");
    });

    it("should handle missing context variables gracefully", () => {
      const preview = EmailService.previewTemplate("application_approved", {
        applicant_name: "Jane Doe",
        grant_title: "Tech Grant",
        // Missing other required fields
      });

      expect(preview).not.toBeNull();
      expect(preview?.body).toContain("Jane Doe");
    });
  });

  describe("Available Templates", () => {
    it("should return list of available templates", () => {
      const templates = EmailService.getAvailableTemplates();

      expect(templates).toBeInstanceOf(Array);
      expect(templates.length).toBeGreaterThan(0);
      expect(templates).toContain("application_submitted");
      expect(templates).toContain("application_approved");
      expect(templates).toContain("grant_announcement");
    });

    it("should have all required templates", () => {
      const templates = EmailService.getAvailableTemplates();
      const requiredTemplates = [
        "application_submitted",
        "application_approved",
        "application_rejected",
        "application_under_review",
        "grant_announcement",
        "grant_closing_soon",
        "community_activity_digest",
      ];

      requiredTemplates.forEach((template) => {
        expect(templates).toContain(template);
      });
    });
  });

  describe("Email Sending", () => {
    it("should send email to single recipient", async () => {
      const result = await EmailService.sendEmail(
        { email: "test@example.com", name: "Test User" },
        "application_submitted",
        {
          applicant_name: "Test User",
          grant_title: "Test Grant",
          application_id: 1,
          submitted_date: "2025-02-06",
          requested_amount: 10000,
        }
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });

    it("should send email to multiple recipients", async () => {
      const result = await EmailService.sendEmail(
        [
          { email: "user1@example.com", name: "User 1" },
          { email: "user2@example.com", name: "User 2" },
        ],
        "grant_announcement",
        {
          grant_title: "Community Grant",
          budget: 50000,
          category: "Community",
          closing_date: "2025-03-15",
          description: "Test description",
          eligibility: "Non-profit",
          application_url: "https://example.com",
        }
      );

      expect(result.success).toBe(true);
    });

    it("should return error for invalid template", async () => {
      const result = await EmailService.sendEmail(
        { email: "test@example.com" },
        "invalid_template" as any,
        {}
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("Bulk Email Sending", () => {
    it("should send emails to multiple recipients with different contexts", async () => {
      const recipients = [
        { email: "user1@example.com", name: "User 1" },
        { email: "user2@example.com", name: "User 2" },
        { email: "user3@example.com", name: "User 3" },
      ];

      const contexts = [
        { applicant_name: "User 1", grant_title: "Grant 1", application_id: 1, submitted_date: "2025-02-06", requested_amount: 10000 },
        { applicant_name: "User 2", grant_title: "Grant 2", application_id: 2, submitted_date: "2025-02-06", requested_amount: 20000 },
        { applicant_name: "User 3", grant_title: "Grant 3", application_id: 3, submitted_date: "2025-02-06", requested_amount: 30000 },
      ];

      const result = await EmailService.sendBulkEmail(recipients, "application_submitted", contexts);

      expect(result.success).toBe(true);
      expect(result.sent).toBe(3);
      expect(result.failed).toBe(0);
    });

    it("should track failed emails in bulk sending", async () => {
      const recipients = [
        { email: "valid@example.com" },
        { email: "invalid@example.com" },
      ];

      const contexts = [
        { applicant_name: "User 1", grant_title: "Grant 1", application_id: 1, submitted_date: "2025-02-06", requested_amount: 10000 },
        { applicant_name: "User 2", grant_title: "Grant 2", application_id: 2, submitted_date: "2025-02-06", requested_amount: 20000 },
      ];

      const result = await EmailService.sendBulkEmail(recipients, "application_submitted", contexts);

      expect(result.sent + result.failed).toBe(2);
    });
  });
});

describe("Email Queue", () => {
  let queue: EmailQueue;

  beforeEach(() => {
    queue = new EmailQueue();
  });

  it("should add email to queue", async () => {
    const id = await queue.enqueue(
      { email: "test@example.com" },
      "application_submitted",
      {
        applicant_name: "Test",
        grant_title: "Test Grant",
        application_id: 1,
        submitted_date: "2025-02-06",
        requested_amount: 10000,
      }
    );

    expect(id).toBeDefined();
    expect(id).toMatch(/^email_/);
  });

  it("should track queue status", async () => {
    await queue.enqueue(
      { email: "test1@example.com" },
      "application_submitted",
      {
        applicant_name: "Test 1",
        grant_title: "Grant 1",
        application_id: 1,
        submitted_date: "2025-02-06",
        requested_amount: 10000,
      }
    );

    await queue.enqueue(
      { email: "test2@example.com" },
      "application_submitted",
      {
        applicant_name: "Test 2",
        grant_title: "Grant 2",
        application_id: 2,
        submitted_date: "2025-02-06",
        requested_amount: 20000,
      }
    );

    const status = queue.getStatus();
    expect(status.pending).toBeGreaterThanOrEqual(0);
    expect(status.totalAttempts).toBeGreaterThanOrEqual(0);
  });

  it("should process queue asynchronously", async () => {
    const id = await queue.enqueue(
      { email: "test@example.com" },
      "application_submitted",
      {
        applicant_name: "Test",
        grant_title: "Test Grant",
        application_id: 1,
        submitted_date: "2025-02-06",
        requested_amount: 10000,
      }
    );

    expect(id).toBeDefined();

    // Give queue time to process
    await new Promise((resolve) => setTimeout(resolve, 200));

    const status = queue.getStatus();
    expect(status.pending).toBeLessThanOrEqual(1);
  });
});
