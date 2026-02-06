import { describe, it, expect, beforeEach } from "vitest";
import { z } from "zod";

// Test the validation schema
const applicationSchema = z.object({
  application_text: z
    .string()
    .min(50, "Application must be at least 50 characters")
    .max(5000, "Application cannot exceed 5000 characters"),
  requested_amount: z
    .string()
    .regex(/^\d+(\.\d{2})?$/, "Please enter a valid amount")
    .optional()
    .or(z.literal("")),
  organization_name: z
    .string()
    .min(3, "Organization name must be at least 3 characters")
    .max(255, "Organization name cannot exceed 255 characters"),
  contact_person: z
    .string()
    .min(2, "Contact person name is required")
    .max(255, "Contact person name cannot exceed 255 characters"),
  contact_email: z
    .string()
    .email("Please enter a valid email address"),
  contact_phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]+$/, "Please enter a valid phone number"),
  project_location: z
    .string()
    .min(2, "Project location is required")
    .max(255, "Project location cannot exceed 255 characters"),
  project_timeline: z
    .string()
    .min(10, "Please describe the project timeline")
    .max(500, "Project timeline cannot exceed 500 characters"),
  expected_outcomes: z
    .string()
    .min(20, "Please describe expected outcomes")
    .max(1000, "Expected outcomes cannot exceed 1000 characters"),
});

describe("ApplicationForm Validation", () => {
  describe("application_text field", () => {
    it("should reject text shorter than 50 characters", () => {
      const result = applicationSchema.safeParse({
        application_text: "Short text",
        organization_name: "Test Org",
        contact_person: "John Doe",
        contact_email: "john@example.com",
        contact_phone: "02 1234 5678",
        project_location: "Sydney",
        project_timeline: "6 months starting January",
        expected_outcomes: "This is a test outcome description",
      });
      expect(result.success).toBe(false);
    });

    it("should accept text between 50 and 5000 characters", () => {
      const validText = "A".repeat(100);
      const result = applicationSchema.safeParse({
        application_text: validText,
        organization_name: "Test Org",
        contact_person: "John Doe",
        contact_email: "john@example.com",
        contact_phone: "02 1234 5678",
        project_location: "Sydney",
        project_timeline: "6 months starting January",
        expected_outcomes: "This is a test outcome description",
      });
      expect(result.success).toBe(true);
    });

    it("should reject text longer than 5000 characters", () => {
      const tooLongText = "A".repeat(5001);
      const result = applicationSchema.safeParse({
        application_text: tooLongText,
        organization_name: "Test Org",
        contact_person: "John Doe",
        contact_email: "john@example.com",
        contact_phone: "02 1234 5678",
        project_location: "Sydney",
        project_timeline: "6 months starting January",
        expected_outcomes: "This is a test outcome description",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("organization_name field", () => {
    it("should reject organization names shorter than 3 characters", () => {
      const result = applicationSchema.safeParse({
        application_text: "A".repeat(100),
        organization_name: "AB",
        contact_person: "John Doe",
        contact_email: "john@example.com",
        contact_phone: "02 1234 5678",
        project_location: "Sydney",
        project_timeline: "6 months starting January",
        expected_outcomes: "This is a test outcome description",
      });
      expect(result.success).toBe(false);
    });

    it("should accept organization names between 3 and 255 characters", () => {
      const result = applicationSchema.safeParse({
        application_text: "A".repeat(100),
        organization_name: "Community Center",
        contact_person: "John Doe",
        contact_email: "john@example.com",
        contact_phone: "02 1234 5678",
        project_location: "Sydney",
        project_timeline: "6 months starting January",
        expected_outcomes: "This is a test outcome description",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("contact_email field", () => {
    it("should reject invalid email addresses", () => {
      const result = applicationSchema.safeParse({
        application_text: "A".repeat(100),
        organization_name: "Test Org",
        contact_person: "John Doe",
        contact_email: "invalid-email",
        contact_phone: "02 1234 5678",
        project_location: "Sydney",
        project_timeline: "6 months starting January",
        expected_outcomes: "This is a test outcome description",
      });
      expect(result.success).toBe(false);
    });

    it("should accept valid email addresses", () => {
      const result = applicationSchema.safeParse({
        application_text: "A".repeat(100),
        organization_name: "Test Org",
        contact_person: "John Doe",
        contact_email: "john@example.com",
        contact_phone: "02 1234 5678",
        project_location: "Sydney",
        project_timeline: "6 months starting January",
        expected_outcomes: "This is a test outcome description",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("contact_phone field", () => {
    it("should accept various phone number formats", () => {
      const validPhones = ["02 1234 5678", "(02) 1234 5678", "+61 2 1234 5678", "0212345678"];
      
      validPhones.forEach((phone) => {
        const result = applicationSchema.safeParse({
          application_text: "A".repeat(100),
          organization_name: "Test Org",
          contact_person: "John Doe",
          contact_email: "john@example.com",
          contact_phone: phone,
          project_location: "Sydney",
          project_timeline: "6 months starting January",
          expected_outcomes: "This is a test outcome description",
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid phone numbers", () => {
      const result = applicationSchema.safeParse({
        application_text: "A".repeat(100),
        organization_name: "Test Org",
        contact_person: "John Doe",
        contact_email: "john@example.com",
        contact_phone: "invalid phone",
        project_location: "Sydney",
        project_timeline: "6 months starting January",
        expected_outcomes: "This is a test outcome description",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("requested_amount field", () => {
    it("should accept valid currency amounts", () => {
      const validAmounts = ["1000", "1000.00", "50000.50", ""];
      
      validAmounts.forEach((amount) => {
        const result = applicationSchema.safeParse({
          application_text: "A".repeat(100),
          organization_name: "Test Org",
          contact_person: "John Doe",
          contact_email: "john@example.com",
          contact_phone: "02 1234 5678",
          project_location: "Sydney",
          project_timeline: "6 months starting January",
          expected_outcomes: "This is a test outcome description",
          requested_amount: amount,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid currency amounts", () => {
      const invalidAmounts = ["abc", "1000.5", "$1000", "1,000"];
      
      invalidAmounts.forEach((amount) => {
        const result = applicationSchema.safeParse({
          application_text: "A".repeat(100),
          organization_name: "Test Org",
          contact_person: "John Doe",
          contact_email: "john@example.com",
          contact_phone: "02 1234 5678",
          project_location: "Sydney",
          project_timeline: "6 months starting January",
          expected_outcomes: "This is a test outcome description",
          requested_amount: amount,
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe("project_timeline field", () => {
    it("should reject timelines shorter than 10 characters", () => {
      const result = applicationSchema.safeParse({
        application_text: "A".repeat(100),
        organization_name: "Test Org",
        contact_person: "John Doe",
        contact_email: "john@example.com",
        contact_phone: "02 1234 5678",
        project_location: "Sydney",
        project_timeline: "6 months",
        expected_outcomes: "This is a test outcome description",
      });
      expect(result.success).toBe(false);
    });

    it("should accept timelines between 10 and 500 characters", () => {
      const result = applicationSchema.safeParse({
        application_text: "A".repeat(100),
        organization_name: "Test Org",
        contact_person: "John Doe",
        contact_email: "john@example.com",
        contact_phone: "02 1234 5678",
        project_location: "Sydney",
        project_timeline: "Project will start in January and complete by June 2025",
        expected_outcomes: "This is a test outcome description",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("expected_outcomes field", () => {
    it("should reject outcomes shorter than 20 characters", () => {
      const result = applicationSchema.safeParse({
        application_text: "A".repeat(100),
        organization_name: "Test Org",
        contact_person: "John Doe",
        contact_email: "john@example.com",
        contact_phone: "02 1234 5678",
        project_location: "Sydney",
        project_timeline: "6 months starting January",
        expected_outcomes: "Good outcomes",
      });
      expect(result.success).toBe(false);
    });

    it("should accept outcomes between 20 and 1000 characters", () => {
      const result = applicationSchema.safeParse({
        application_text: "A".repeat(100),
        organization_name: "Test Org",
        contact_person: "John Doe",
        contact_email: "john@example.com",
        contact_phone: "02 1234 5678",
        project_location: "Sydney",
        project_timeline: "6 months starting January",
        expected_outcomes: "This project will deliver significant community benefits including improved facilities and increased engagement",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("complete form validation", () => {
    it("should accept a complete valid application", () => {
      const result = applicationSchema.safeParse({
        application_text: "A".repeat(100),
        organization_name: "Community Center",
        contact_person: "John Doe",
        contact_email: "john@example.com",
        contact_phone: "02 1234 5678",
        project_location: "Sydney",
        project_timeline: "Project will start in January and complete by June 2025",
        expected_outcomes: "This project will deliver significant community benefits including improved facilities and increased engagement",
        requested_amount: "50000.00",
      });
      expect(result.success).toBe(true);
    });

    it("should reject a form with missing required fields", () => {
      const result = applicationSchema.safeParse({
        application_text: "A".repeat(100),
        organization_name: "Community Center",
        contact_person: "John Doe",
        // Missing contact_email
        contact_phone: "02 1234 5678",
        project_location: "Sydney",
        project_timeline: "Project will start in January and complete by June 2025",
        expected_outcomes: "This project will deliver significant community benefits",
      });
      expect(result.success).toBe(false);
    });
  });
});
