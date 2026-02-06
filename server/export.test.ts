import { describe, expect, it } from "vitest";
import {
  exportApplicationsToCSV,
  exportReviewsToCSV,
  exportGrantsToCSV,
  exportApplicationsToPDF,
  exportReviewsToPDF,
  exportGrantsSummaryToPDF,
} from "./export";

describe("Export Functions", () => {
  const mockApplications = [
    {
      id: 1,
      grant_id: 1,
      applicant_id: 1,
      application_text: "Test application",
      requested_amount: 5000,
      status: "approved",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockReviews = [
    {
      id: 1,
      application_id: 1,
      reviewer_id: 2,
      score: "85",
      comments: "Good application",
      recommendation: "approve",
      createdAt: new Date(),
    },
  ];

  const mockGrants = [
    {
      id: 1,
      title: "Test Grant",
      category: "Education",
      budget: 50000,
      status: "open",
      opening_date: new Date(),
      closing_date: new Date(),
      createdAt: new Date(),
    },
  ];

  describe("CSV Export", () => {
    it("should export applications to CSV", () => {
      const csv = exportApplicationsToCSV(mockApplications);
      expect(csv).toContain("id");
      expect(csv).toContain("grant_id");
      expect(csv).toContain("status");
    });

    it("should export reviews to CSV", () => {
      const csv = exportReviewsToCSV(mockReviews);
      expect(csv).toContain("id");
      expect(csv).toContain("score");
      expect(csv).toContain("recommendation");
    });

    it("should export grants to CSV", () => {
      const csv = exportGrantsToCSV(mockGrants);
      expect(csv).toContain("id");
      expect(csv).toContain("title");
      expect(csv).toContain("category");
    });
  });

  describe("PDF Export", () => {
    it("should export applications to PDF", () => {
      const pdf = exportApplicationsToPDF(mockApplications);
      expect(pdf).toBeInstanceOf(Buffer);
      expect(pdf).toBeDefined();
    });

    it("should export reviews to PDF", () => {
      const pdf = exportReviewsToPDF(mockReviews);
      expect(pdf).toBeInstanceOf(Buffer);
      expect(pdf).toBeDefined();
    });

    it("should export grants summary to PDF", () => {
      const pdf = exportGrantsSummaryToPDF(mockGrants);
      expect(pdf).toBeInstanceOf(Buffer);
      expect(pdf).toBeDefined();
    });
  });
});
