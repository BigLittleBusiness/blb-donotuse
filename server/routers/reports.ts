import { router, publicProcedure } from "../_core/trpc";
import { staffProcedure, adminProcedure } from "../auth";
import * as dbScheduling from "../db-report-scheduling";
import * as dbReports from "../db-reports";
import { z } from "zod";

export const reportsRouter = router({
  /**
   * Create a report schedule for an LGA
   */
  createSchedule: adminProcedure
    .input(
      z.object({
        lgaId: z.number(),
        reportType: z.enum(["monthly", "quarterly", "annual"]),
        scheduleDay: z.number().min(1).max(31),
        scheduleTime: z.string().regex(/^\d{2}:\d{2}$/),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await dbScheduling.createReportSchedule(
          input.lgaId,
          input.reportType,
          input.scheduleDay,
          input.scheduleTime
        );
        return { success: true, result };
      } catch (error) {
        console.error("Error creating report schedule:", error);
        return { success: false, error: "Failed to create schedule" };
      }
    }),

  /**
   * Get active report schedules
   */
  getActiveSchedules: staffProcedure.query(async () => {
    try {
      const schedules = await dbScheduling.getActiveReportSchedules();
      return { success: true, schedules };
    } catch (error) {
      console.error("Error fetching schedules:", error);
      return { success: false, schedules: [] };
    }
  }),

  /**
   * Get report history for an LGA
   */
  getReportHistory: staffProcedure
    .input(z.object({ lgaId: z.number(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      try {
        const history = await dbScheduling.getReportHistory(input.lgaId, input.limit);
        return { success: true, history };
      } catch (error) {
        console.error("Error fetching report history:", error);
        return { success: false, history: [] };
      }
    }),

  /**
   * Get LGA monthly report
   */
  getLGAMonthlyReport: staffProcedure
    .input(
      z.object({
        lgaId: z.number(),
        year: z.number(),
        month: z.number().min(1).max(12),
      })
    )
    .query(async ({ input }) => {
      try {
        const report = await dbReports.getLGAMonthlyReport(input.lgaId, input.year, input.month);
        return { success: true, report };
      } catch (error) {
        console.error("Error fetching LGA report:", error);
        return { success: false, error: "Failed to generate report" };
      }
    }),

  /**
   * Assign admin to LGA
   */
  assignLGAAdmin: adminProcedure
    .input(
      z.object({
        lgaId: z.number(),
        userId: z.number(),
        role: z.enum(["primary_admin", "secondary_admin", "viewer"]),
        emailReports: z.boolean().optional().default(true),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await dbScheduling.assignLGAAdmin(
          input.lgaId,
          input.userId,
          input.role,
          input.emailReports
        );
        return { success: true, result };
      } catch (error) {
        console.error("Error assigning LGA admin:", error);
        return { success: false, error: "Failed to assign admin" };
      }
    }),

  /**
   * Get LGA admins
   */
  getLGAAdmins: staffProcedure
    .input(z.object({ lgaId: z.number() }))
    .query(async ({ input }) => {
      try {
        const admins = await dbScheduling.getLGAAdminsForReport(input.lgaId);
        return { success: true, admins };
      } catch (error) {
        console.error("Error fetching LGA admins:", error);
        return { success: false, admins: [] };
      }
    }),
});
