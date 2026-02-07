import { getDb } from "./db";
import { report_schedules, report_history, lga_admins } from "../drizzle/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

/**
 * Create a report schedule for an LGA
 */
export async function createReportSchedule(
  lgaId: number,
  reportType: "monthly" | "quarterly" | "annual",
  scheduleDay: number,
  scheduleTime: string
) {
  const db = await getDb();
  if (!db) return null;

  try {
    // Calculate next scheduled date
    const now = new Date();
    const nextScheduled = calculateNextScheduleDate(scheduleDay, scheduleTime);

    const result = await db.insert(report_schedules).values({
      lga_id: lgaId,
      report_type: reportType,
      schedule_day: scheduleDay,
      schedule_time: scheduleTime,
      is_active: true,
      next_scheduled_at: nextScheduled,
    });

    return {
      success: true,
      scheduleId: result[0],
    };
  } catch (error) {
    console.error(`[Database] Error creating report schedule:`, error);
    return null;
  }
}

/**
 * Get all active report schedules
 */
export async function getActiveReportSchedules() {
  const db = await getDb();
  if (!db) return [];

  try {
    const schedules = await db
      .select()
      .from(report_schedules)
      .where(eq(report_schedules.is_active, true));

    return schedules;
  } catch (error) {
    console.error(`[Database] Error getting active report schedules:`, error);
    return [];
  }
}

/**
 * Get report schedules due for generation
 */
export async function getSchedulesDueForGeneration() {
  const db = await getDb();
  if (!db) return [];

  try {
    const now = new Date();

    const schedules = await db
      .select()
      .from(report_schedules)
      .where(
        and(
          eq(report_schedules.is_active, true),
          sql`${report_schedules.next_scheduled_at} <= ${now}`
        )
      );

    return schedules;
  } catch (error) {
    console.error(`[Database] Error getting schedules due for generation:`, error);
    return [];
  }
}

/**
 * Create a report history record
 */
export async function createReportHistory(
  scheduleId: number,
  lgaId: number,
  reportPeriod: string,
  year: number,
  month: number,
  reportData: any
) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(report_history).values({
      schedule_id: scheduleId,
      lga_id: lgaId,
      report_period: reportPeriod,
      report_year: year,
      report_month: month,
      report_data: reportData,
      generation_status: "pending",
      delivery_status: "pending",
    });

    return {
      success: true,
      historyId: result[0],
    };
  } catch (error) {
    console.error(`[Database] Error creating report history:`, error);
    return null;
  }
}

/**
 * Update report generation status
 */
export async function updateReportGenerationStatus(
  historyId: number,
  status: "pending" | "generating" | "completed" | "failed",
  error?: string
) {
  const db = await getDb();
  if (!db) return false;

  try {
    const updateData: any = {
      generation_status: status,
    };

    if (status === "completed") {
      updateData.generated_at = new Date();
    } else if (status === "failed" && error) {
      updateData.generation_error = error;
    }

    await db
      .update(report_history)
      .set(updateData)
      .where(eq(report_history.id, historyId));

    return true;
  } catch (error) {
    console.error(`[Database] Error updating report generation status:`, error);
    return false;
  }
}

/**
 * Update report delivery status
 */
export async function updateReportDeliveryStatus(
  historyId: number,
  status: "pending" | "sent" | "failed",
  deliveredTo?: string[],
  error?: string
) {
  const db = await getDb();
  if (!db) return false;

  try {
    const updateData: any = {
      delivery_status: status,
    };

    if (status === "sent") {
      updateData.delivered_at = new Date();
      if (deliveredTo) {
        updateData.delivered_to = deliveredTo;
      }
    } else if (status === "failed" && error) {
      updateData.delivery_error = error;
    }

    await db
      .update(report_history)
      .set(updateData)
      .where(eq(report_history.id, historyId));

    return true;
  } catch (error) {
    console.error(`[Database] Error updating report delivery status:`, error);
    return false;
  }
}

/**
 * Update report file URL
 */
export async function updateReportFileUrl(historyId: number, fileUrl: string) {
  const db = await getDb();
  if (!db) return false;

  try {
    await db
      .update(report_history)
      .set({ report_file_url: fileUrl })
      .where(eq(report_history.id, historyId));

    return true;
  } catch (error) {
    console.error(`[Database] Error updating report file URL:`, error);
    return false;
  }
}

/**
 * Update schedule's next scheduled date
 */
export async function updateScheduleNextDate(scheduleId: number, scheduleDay: number, scheduleTime: string) {
  const db = await getDb();
  if (!db) return false;

  try {
    const nextScheduled = calculateNextScheduleDate(scheduleDay, scheduleTime);

    await db
      .update(report_schedules)
      .set({
        next_scheduled_at: nextScheduled,
        last_generated_at: new Date(),
      })
      .where(eq(report_schedules.id, scheduleId));

    return true;
  } catch (error) {
    console.error(`[Database] Error updating schedule next date:`, error);
    return false;
  }
}

/**
 * Get LGA admins for email delivery
 */
export async function getLGAAdminsForReport(lgaId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const admins = await db
      .select({
        userId: lga_admins.user_id,
        role: lga_admins.role,
        emailReports: lga_admins.email_reports,
      })
      .from(lga_admins)
      .where(and(eq(lga_admins.lga_id, lgaId), eq(lga_admins.email_reports, true)));

    return admins;
  } catch (error) {
    console.error(`[Database] Error getting LGA admins:`, error);
    return [];
  }
}

/**
 * Get report history for an LGA
 */
export async function getReportHistory(lgaId: number, limit: number = 12) {
  const db = await getDb();
  if (!db) return [];

  try {
    const history = await db
      .select()
      .from(report_history)
      .where(eq(report_history.lga_id, lgaId))
      .orderBy(sql`${report_history.report_period} DESC`)
      .limit(limit);

    return history;
  } catch (error) {
    console.error(`[Database] Error getting report history:`, error);
    return [];
  }
}

/**
 * Calculate next schedule date based on day and time
 */
function calculateNextScheduleDate(scheduleDay: number, scheduleTime: string): Date {
  const now = new Date();
  const [hours, minutes] = scheduleTime.split(":").map(Number);

  // Parse the time
  let nextDate = new Date(now);
  nextDate.setUTCHours(hours, minutes, 0, 0);

  // If the time has already passed today, schedule for next month
  if (nextDate <= now) {
    nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);
  }

  // Set the day of month
  nextDate.setUTCDate(Math.min(scheduleDay, getLastDayOfMonth(nextDate)));

  return nextDate;
}

/**
 * Get the last day of a given month
 */
function getLastDayOfMonth(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  return new Date(year, month + 1, 0).getUTCDate();
}

/**
 * Assign admin to LGA
 */
export async function assignLGAAdmin(
  lgaId: number,
  userId: number,
  role: "primary_admin" | "secondary_admin" | "viewer",
  emailReports: boolean = true
) {
  const db = await getDb();
  if (!db) return null;

  try {
    // Check if already assigned
    const existing = await db
      .select()
      .from(lga_admins)
      .where(and(eq(lga_admins.lga_id, lgaId), eq(lga_admins.user_id, userId)));

    if (existing.length > 0) {
      // Update existing
      await db
        .update(lga_admins)
        .set({ role, email_reports: emailReports })
        .where(and(eq(lga_admins.lga_id, lgaId), eq(lga_admins.user_id, userId)));
    } else {
      // Create new
      await db.insert(lga_admins).values({
        lga_id: lgaId,
        user_id: userId,
        role,
        email_reports: emailReports,
      });
    }

    return { success: true };
  } catch (error) {
    console.error(`[Database] Error assigning LGA admin:`, error);
    return null;
  }
}
