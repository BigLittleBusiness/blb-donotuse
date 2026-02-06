import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import { Readable } from "stream";
import type { Application, Review, Grant } from "../drizzle/schema";

/**
 * Export applications to CSV format
 */
export function exportApplicationsToCSV(applications: any[]): string {
  const fields = [
    "id",
    "grant_id",
    "applicant_id",
    "application_text",
    "requested_amount",
    "status",
    "createdAt",
    "updatedAt",
  ];

  const data = applications.map((app) => ({
    id: app.id,
    grant_id: app.grant_id,
    applicant_id: app.applicant_id,
    application_text: app.application_text?.substring(0, 100) + "...",
    requested_amount: app.requested_amount,
    status: app.status,
    createdAt: new Date(app.createdAt).toISOString(),
    updatedAt: new Date(app.updatedAt).toISOString(),
  }));

  try {
    const parser = new Parser({ fields });
    return parser.parse(data);
  } catch (error) {
    console.error("Error parsing CSV:", error);
    throw new Error("Failed to generate CSV");
  }
}

/**
 * Export reviews to CSV format
 */
export function exportReviewsToCSV(reviews: any[]): string {
  const fields = [
    "id",
    "application_id",
    "reviewer_id",
    "score",
    "comments",
    "recommendation",
    "createdAt",
  ];

  const data = reviews.map((review) => ({
    id: review.id,
    application_id: review.application_id,
    reviewer_id: review.reviewer_id,
    score: review.score,
    comments: review.comments?.substring(0, 100) + "...",
    recommendation: review.recommendation,
    createdAt: new Date(review.createdAt).toISOString(),
  }));

  try {
    const parser = new Parser({ fields });
    return parser.parse(data);
  } catch (error) {
    console.error("Error parsing CSV:", error);
    throw new Error("Failed to generate CSV");
  }
}

/**
 * Export grants to CSV format
 */
export function exportGrantsToCSV(grants: any[]): string {
  const fields = [
    "id",
    "title",
    "category",
    "budget",
    "status",
    "opening_date",
    "closing_date",
    "createdAt",
  ];

  const data = grants.map((grant) => ({
    id: grant.id,
    title: grant.title,
    category: grant.category,
    budget: grant.budget,
    status: grant.status,
    opening_date: grant.opening_date ? new Date(grant.opening_date).toISOString() : "",
    closing_date: grant.closing_date ? new Date(grant.closing_date).toISOString() : "",
    createdAt: new Date(grant.createdAt).toISOString(),
  }));

  try {
    const parser = new Parser({ fields });
    return parser.parse(data);
  } catch (error) {
    console.error("Error parsing CSV:", error);
    throw new Error("Failed to generate CSV");
  }
}

/**
 * Export applications to PDF format
 */
export function exportApplicationsToPDF(applications: any[]): Buffer {
  const doc = new PDFDocument();
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  // Title
  doc.fontSize(20).font("Helvetica-Bold").text("Grant Applications Report", { align: "center" });
  doc.moveDown();

  // Summary
  doc.fontSize(12).font("Helvetica").text(`Total Applications: ${applications.length}`, {
    align: "left",
  });
  doc.text(`Generated: ${new Date().toISOString()}`, { align: "left" });
  doc.moveDown();

  // Table headers
  const pageWidth = doc.page.width;
  const margin = 50;
  const contentWidth = pageWidth - 2 * margin;
  const colWidth = contentWidth / 4;

  doc.font("Helvetica-Bold").fontSize(10);
  doc.text("ID", margin, doc.y, { width: colWidth });
  doc.text("Status", margin + colWidth, doc.y - 14, { width: colWidth });
  doc.text("Amount", margin + colWidth * 2, doc.y - 14, { width: colWidth });
  doc.text("Date", margin + colWidth * 3, doc.y - 14, { width: colWidth });
  doc.moveDown();

  // Table rows
  doc.font("Helvetica").fontSize(9);
  applications.forEach((app) => {
    if (doc.y > doc.page.height - 50) {
      doc.addPage();
    }

    doc.text(String(app.id), margin, doc.y, { width: colWidth });
    doc.text(app.status, margin + colWidth, doc.y - 14, { width: colWidth });
    doc.text(String(app.requested_amount), margin + colWidth * 2, doc.y - 14, {
      width: colWidth,
    });
    doc.text(new Date(app.createdAt).toLocaleDateString(), margin + colWidth * 3, doc.y - 14, {
      width: colWidth,
    });
    doc.moveDown();
  });

  doc.end();

  return Buffer.concat(chunks);
}

/**
 * Export reviews to PDF format
 */
export function exportReviewsToPDF(reviews: any[]): Buffer {
  const doc = new PDFDocument();
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  // Title
  doc.fontSize(20).font("Helvetica-Bold").text("Application Reviews Report", { align: "center" });
  doc.moveDown();

  // Summary
  doc.fontSize(12).font("Helvetica").text(`Total Reviews: ${reviews.length}`, { align: "left" });
  doc.text(`Generated: ${new Date().toISOString()}`, { align: "left" });
  doc.moveDown();

  // Table headers
  const pageWidth = doc.page.width;
  const margin = 50;
  const contentWidth = pageWidth - 2 * margin;
  const colWidth = contentWidth / 4;

  doc.font("Helvetica-Bold").fontSize(10);
  doc.text("ID", margin, doc.y, { width: colWidth });
  doc.text("Score", margin + colWidth, doc.y - 14, { width: colWidth });
  doc.text("Recommendation", margin + colWidth * 2, doc.y - 14, { width: colWidth * 1.5 });
  doc.text("Date", margin + colWidth * 3.5, doc.y - 14, { width: colWidth * 0.5 });
  doc.moveDown();

  // Table rows
  doc.font("Helvetica").fontSize(9);
  reviews.forEach((review) => {
    if (doc.y > doc.page.height - 50) {
      doc.addPage();
    }

    doc.text(String(review.id), margin, doc.y, { width: colWidth });
    doc.text(String(review.score), margin + colWidth, doc.y - 14, { width: colWidth });
    doc.text(review.recommendation, margin + colWidth * 2, doc.y - 14, {
      width: colWidth * 1.5,
    });
    doc.text(new Date(review.createdAt).toLocaleDateString(), margin + colWidth * 3.5, doc.y - 14, {
      width: colWidth * 0.5,
    });
    doc.moveDown();
  });

  doc.end();

  return Buffer.concat(chunks);
}

/**
 * Export grants summary to PDF format
 */
export function exportGrantsSummaryToPDF(grants: any[]): Buffer {
  const doc = new PDFDocument();
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  // Title
  doc.fontSize(20).font("Helvetica-Bold").text("Grants Summary Report", { align: "center" });
  doc.moveDown();

  // Summary statistics
  doc.fontSize(12).font("Helvetica").text(`Total Grants: ${grants.length}`, { align: "left" });
  doc.text(`Generated: ${new Date().toISOString()}`, { align: "left" });
  doc.moveDown();

  // Calculate statistics
  const byStatus = grants.reduce(
    (acc, g) => {
      acc[g.status] = (acc[g.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  doc.fontSize(11).font("Helvetica-Bold").text("Grants by Status:", { align: "left" });
  doc.font("Helvetica").fontSize(10);
  Object.entries(byStatus).forEach(([status, count]) => {
    doc.text(`  ${status}: ${count}`, { align: "left" });
  });
  doc.moveDown();

  // Detailed grants list
  doc.fontSize(11).font("Helvetica-Bold").text("Detailed Grants List:", { align: "left" });
  doc.moveDown();

  doc.font("Helvetica").fontSize(9);
  grants.forEach((grant) => {
    if (doc.y > doc.page.height - 100) {
      doc.addPage();
    }

    doc.font("Helvetica-Bold").text(`Grant #${grant.id}: ${grant.title}`, { align: "left" });
    doc.font("Helvetica")
      .text(`Category: ${grant.category}`, { align: "left" })
      .text(`Budget: $${grant.budget}`, { align: "left" })
      .text(`Status: ${grant.status}`, { align: "left" })
      .text(
        `Opening: ${grant.opening_date ? new Date(grant.opening_date).toLocaleDateString() : "N/A"}`,
        { align: "left" }
      )
      .text(
        `Closing: ${grant.closing_date ? new Date(grant.closing_date).toLocaleDateString() : "N/A"}`,
        { align: "left" }
      );
    doc.moveDown();
  });

  doc.end();

  return Buffer.concat(chunks);
}
