import * as dbReports from "../db-reports";
import * as dbScheduling from "../db-report-scheduling";
import { notifyOwner } from "../_core/notification";
import * as db from "../db";

/**
 * Main report generation job - runs monthly to generate LGA performance reports
 */
export async function generateMonthlyReports() {
  console.log("[Report Generation Job] Starting monthly report generation...");

  try {
    // Get all schedules due for generation
    const schedulesDue = await dbScheduling.getSchedulesDueForGeneration();
    console.log(`[Report Generation Job] Found ${schedulesDue.length} schedules due for generation`);

    for (const schedule of schedulesDue) {
      try {
        await generateReportForSchedule(schedule);
      } catch (error) {
        console.error(
          `[Report Generation Job] Error generating report for schedule ${schedule.id}:`,
          error
        );
        // Continue with next schedule
      }
    }

    console.log("[Report Generation Job] Monthly report generation completed");
    return { success: true, schedulesProcessed: schedulesDue.length };
  } catch (error) {
    console.error("[Report Generation Job] Fatal error:", error);
    await notifyOwner({
      title: "Report Generation Job Failed",
      content: `An error occurred during monthly report generation: ${error}`,
    });
    return { success: false, error: String(error) };
  }
}

/**
 * Generate report for a specific schedule
 */
async function generateReportForSchedule(schedule: any) {
  console.log(`[Report Generation] Generating report for LGA ${schedule.lga_id}...`);

  // Create report history record
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth(); // 0-11, so we get previous month
  const reportPeriod = `${year}-${String(month).padStart(2, "0")}`;

  const historyResult = await dbScheduling.createReportHistory(
    schedule.id,
    schedule.lga_id,
    reportPeriod,
    year,
    month,
    {}
  );

  if (!historyResult) {
    throw new Error(`Failed to create report history for schedule ${schedule.id}`);
  }

  const historyId = (historyResult.historyId as any) || 0;

  try {
    // Update status to generating
    if (historyId > 0) {
      await dbScheduling.updateReportGenerationStatus(historyId, "generating");
    }

    // Generate the report
    const report = await dbReports.getLGAMonthlyReport(schedule.lga_id, year, month);

    if (!report) {
      throw new Error(`Failed to generate report for LGA ${schedule.lga_id}`);
    }

    // Save report data
    if (historyId > 0) {
      await dbScheduling.updateReportGenerationStatus(historyId, "completed");
    }

    // Update schedule's next date
    await dbScheduling.updateScheduleNextDate(
      schedule.id,
      schedule.schedule_day,
      schedule.schedule_time
    );

    // Deliver the report
    if (historyId > 0) {
      await deliverReport(historyId, schedule.lga_id, report);
    }

    console.log(`[Report Generation] Report generated successfully for LGA ${schedule.lga_id}`);
  } catch (error) {
    console.error(`[Report Generation] Error generating report for LGA ${schedule.lga_id}:`, error);
    if (historyId > 0) {
      await dbScheduling.updateReportGenerationStatus(
        historyId,
        "failed",
        String(error)
      );
    }
    throw error;
  }
}

/**
 * Deliver report to LGA admins
 */
async function deliverReport(historyId: number, lgaId: number, reportData: any) {
  console.log(`[Report Delivery] Delivering report for LGA ${lgaId}...`);

  try {
    // Get LGA admins
    const admins = await dbScheduling.getLGAAdminsForReport(lgaId);
    console.log(`[Report Delivery] Found ${admins.length} admins to deliver to`);

    if (admins.length === 0) {
      await dbScheduling.updateReportDeliveryStatus(
        historyId,
        "failed",
        [],
        "No admins configured for this LGA"
      );
      return;
    }

    // Get admin emails (for now, we'll need to implement getUsersByIds in db.ts)
    // TODO: Implement getUsersByIds in db.ts
    const emails: string[] = [];
    // const adminIds = admins.map((a) => a.userId);
    // const users = await db.getUsersByIds(adminIds);
    // const emails = users
    //   .filter((u: any) => u.email)
    //   .map((u: any) => u.email as string);

    if (emails.length === 0) {
      await dbScheduling.updateReportDeliveryStatus(
        historyId,
        "failed",
        [],
        "No email addresses found for admins"
      );
      return;
    }

    // Send email with report
    const emailResult = await sendReportEmail(emails, reportData);

    if (emailResult.success) {
      await dbScheduling.updateReportDeliveryStatus(historyId, "sent", emails);
      console.log(`[Report Delivery] Report delivered to ${emails.length} admins`);
    } else {
      await dbScheduling.updateReportDeliveryStatus(
        historyId,
        "failed",
        emails,
        emailResult.error
      );
      console.error(`[Report Delivery] Failed to deliver report:`, emailResult.error);
    }
  } catch (error) {
    console.error(`[Report Delivery] Error delivering report:`, error);
    await dbScheduling.updateReportDeliveryStatus(
      historyId,
      "failed",
      [],
      String(error)
    );
  }
}

/**
 * Send report email to admins
 */
async function sendReportEmail(
  emails: string[],
  reportData: any
): Promise<{ success: boolean; error?: string }> {
  try {
    // Format report data for email
    const reportSummary = formatReportForEmail(reportData);

    // Create email content
    const subject = `GrantThrive Monthly Report - ${reportData.lga?.lga_name || "LGA"} - ${reportData.period}`;
    const body = `
<h2>Monthly Grant Performance Report</h2>
<p>LGA: ${reportData.lga?.lga_name || "Unknown"}</p>
<p>Period: ${reportData.period}</p>

<h3>Summary</h3>
<ul>
  <li>Total Grants: ${reportData.totalGrants}</li>
  <li>Total Applications: ${reportData.totalApplications}</li>
  <li>Approved Applications: ${reportData.approvedApplications}</li>
  <li>Success Rate: ${reportData.successRate}%</li>
  <li>Total Funding Allocated: $${formatCurrency(reportData.totalFundingAllocated)}</li>
  <li>Total Funding Awarded: $${formatCurrency(reportData.totalFundingAwarded)}</li>
</ul>

<h3>Grant Details</h3>
${reportData.grantDetails
  .map(
    (grant: any) => `
<div style="margin-bottom: 20px; padding: 10px; border-left: 3px solid #0066cc;">
  <h4>${grant.title}</h4>
  <p>Category: ${grant.category}</p>
  <p>Budget: $${formatCurrency(grant.budget)}</p>
  <p>Applications: ${grant.totalApplications} (${grant.approvedApplications} approved, ${grant.successRate}% success rate)</p>
</div>
`
  )
  .join("")}

<p style="margin-top: 30px; font-size: 12px; color: #666;">
This is an automated report from GrantThrive. Please do not reply to this email.
</p>
    `;

    // Log email (in production, integrate with actual email service)
    console.log(`[Email] Sending report to: ${emails.join(", ")}`);
    console.log(`[Email] Subject: ${subject}`);

    // TODO: Integrate with actual email service
    // For now, just log success
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Format report data for email display
 */
function formatReportForEmail(reportData: any): string {
  return `
    LGA: ${reportData.lga?.lga_name || "Unknown"}
    Period: ${reportData.period}
    
    Summary:
    - Total Grants: ${reportData.totalGrants}
    - Total Applications: ${reportData.totalApplications}
    - Approved: ${reportData.approvedApplications}
    - Success Rate: ${reportData.successRate}%
    - Funding Allocated: $${formatCurrency(reportData.totalFundingAllocated)}
    - Funding Awarded: $${formatCurrency(reportData.totalFundingAwarded)}
  `;
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Initialize report schedules for all LGAs (one-time setup)
 */
export async function initializeReportSchedules() {
  console.log("[Report Initialization] Initializing report schedules for all LGAs...");

  try {
    // TODO: Implement getAllLGAs function in db.ts to get all LGAs across all states
    // For now, this is a placeholder
    console.log("[Report Initialization] Report schedules initialization - awaiting getAllLGAs implementation");
    return { success: true };
  } catch (error) {
    console.error("[Report Initialization] Error initializing schedules:", error);
    return { success: false, error: String(error) };
  }
}
