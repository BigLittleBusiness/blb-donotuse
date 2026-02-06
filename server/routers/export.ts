import { router } from "../_core/trpc";
import { staffProcedure } from "../auth";
import { z } from "zod";
import {
  exportApplicationsToCSV,
  exportApplicationsToPDF,
  exportReviewsToCSV,
  exportReviewsToPDF,
  exportGrantsToCSV,
  exportGrantsSummaryToPDF,
} from "../export";

export const exportRouter = router({
  /**
   * Export applications to CSV
   */
  applicationsCSV: staffProcedure
    .input(
      z.object({
        applications: z.array(
          z.object({
            id: z.number(),
            grant_id: z.number(),
            applicant_id: z.number(),
            application_text: z.string(),
            requested_amount: z.number(),
            status: z.string(),
            createdAt: z.date(),
            updatedAt: z.date(),
          })
        ),
      })
    )
    .mutation(({ input }: any) => {
      try {
        const csv = exportApplicationsToCSV(input.applications);
        return { success: true, data: csv, format: "csv" };
      } catch (error) {
        console.error("CSV export error:", error);
        throw new Error("Failed to export applications to CSV");
      }
    }),

  /**
   * Export applications to PDF
   */
  applicationsPDF: staffProcedure
    .input(
      z.object({
        applications: z.array(
          z.object({
            id: z.number(),
            grant_id: z.number(),
            applicant_id: z.number(),
            application_text: z.string(),
            requested_amount: z.number(),
            status: z.string(),
            createdAt: z.date(),
            updatedAt: z.date(),
          })
        ),
      })
    )
    .mutation(({ input }: any) => {
      try {
        const pdf = exportApplicationsToPDF(input.applications);
        return { success: true, data: pdf.toString("base64"), format: "pdf" };
      } catch (error) {
        console.error("PDF export error:", error);
        throw new Error("Failed to export applications to PDF");
      }
    }),

  /**
   * Export reviews to CSV
   */
  reviewsCSV: staffProcedure
    .input(
      z.object({
        reviews: z.array(
          z.object({
            id: z.number(),
            application_id: z.number(),
            reviewer_id: z.number(),
            score: z.string(),
            comments: z.string(),
            recommendation: z.string(),
            createdAt: z.date(),
          })
        ),
      })
    )
    .mutation(({ input }: any) => {
      try {
        const csv = exportReviewsToCSV(input.reviews);
        return { success: true, data: csv, format: "csv" };
      } catch (error) {
        console.error("CSV export error:", error);
        throw new Error("Failed to export reviews to CSV");
      }
    }),

  /**
   * Export reviews to PDF
   */
  reviewsPDF: staffProcedure
    .input(
      z.object({
        reviews: z.array(
          z.object({
            id: z.number(),
            application_id: z.number(),
            reviewer_id: z.number(),
            score: z.string(),
            comments: z.string(),
            recommendation: z.string(),
            createdAt: z.date(),
          })
        ),
      })
    )
    .mutation(({ input }: any) => {
      try {
        const pdf = exportReviewsToPDF(input.reviews);
        return { success: true, data: pdf.toString("base64"), format: "pdf" };
      } catch (error) {
        console.error("PDF export error:", error);
        throw new Error("Failed to export reviews to PDF");
      }
    }),

  /**
   * Export grants to CSV
   */
  grantsCSV: staffProcedure
    .input(
      z.object({
        grants: z.array(
          z.object({
            id: z.number(),
            title: z.string(),
            category: z.string(),
            budget: z.number(),
            status: z.string(),
            opening_date: z.date().optional(),
            closing_date: z.date().optional(),
            createdAt: z.date(),
          })
        ),
      })
    )
    .mutation(({ input }: any) => {
      try {
        const csv = exportGrantsToCSV(input.grants);
        return { success: true, data: csv, format: "csv" };
      } catch (error) {
        console.error("CSV export error:", error);
        throw new Error("Failed to export grants to CSV");
      }
    }),

  /**
   * Export grants summary to PDF
   */
  grantsSummaryPDF: staffProcedure
    .input(
      z.object({
        grants: z.array(
          z.object({
            id: z.number(),
            title: z.string(),
            category: z.string(),
            budget: z.number(),
            status: z.string(),
            opening_date: z.date().optional(),
            closing_date: z.date().optional(),
            createdAt: z.date(),
          })
        ),
      })
    )
    .mutation(({ input }: any) => {
      try {
        const pdf = exportGrantsSummaryToPDF(input.grants);
        return { success: true, data: pdf.toString("base64"), format: "pdf" };
      } catch (error) {
        console.error("PDF export error:", error);
        throw new Error("Failed to export grants summary to PDF");
      }
    }),
});
