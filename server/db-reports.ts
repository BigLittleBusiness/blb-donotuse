import { getDb } from "./db";
import { grants, applications, users } from "../drizzle/schema";
import { eq, and, gte, lte, count, sql } from "drizzle-orm";

/**
 * Get monthly performance report for an LGA
 */
export async function getLGAMonthlyReport(lgaId: number, year: number, month: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Get grants for this LGA (for now, get all grants created in this period)
    // TODO: Add LGA filtering once grant_lga_mappings is properly set up
    const lgaGrants = await db
      .select()
      .from(grants)
      .where(
        and(
          gte(grants.createdAt, startDate),
          lte(grants.createdAt, endDate)
        )
      );

    const grantIds = lgaGrants.map((g) => g.id);
    if (grantIds.length === 0) {
      return {
        lga: { id: lgaId, lga_name: `LGA ${lgaId}` },
        period: `${year}-${String(month).padStart(2, "0")}`,
        totalGrants: 0,
        totalApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0,
        successRate: 0,
        totalFundingAllocated: 0,
        totalFundingAwarded: 0,
        grantDetails: [] as any[],
      };
    }

    // Get application stats
    const applicationStats = await db
      .select({
        status: applications.status,
        count: count(),
        totalRequested: sql`SUM(${applications.requested_amount})`,
      })
      .from(applications)
      .where(sql`${applications.grant_id} IN (${sql.raw(grantIds.join(","))})`)
      .groupBy(applications.status);

    let totalApplications = 0;
    let approvedApplications = 0;
    let rejectedApplications = 0;
    let totalRequested = 0;

    for (const stat of applicationStats) {
      totalApplications += stat.count || 0;
      if (stat.status === "approved") {
        approvedApplications += stat.count || 0;
      } else if (stat.status === "rejected") {
        rejectedApplications += stat.count || 0;
      }
      if (stat.totalRequested) {
        totalRequested += Number(stat.totalRequested);
      }
    }

    const successRate =
      totalApplications > 0 ? Math.round((approvedApplications / totalApplications) * 100) : 0;

    let totalFundingAllocated = 0;
    for (const grant of lgaGrants) {
      totalFundingAllocated += Number(grant.budget);
    }

    // Get grant details
    const grantDetails: any[] = await Promise.all(
      lgaGrants.map(async (grant: any) => {
        const grantApps = await db
          .select({
            status: applications.status,
            count: count(),
          })
          .from(applications)
          .where(eq(applications.grant_id, grant.id))
          .groupBy(applications.status);

        let grantApproved = 0;
        let grantTotal = 0;
        for (const app of grantApps) {
          grantTotal += app.count || 0;
          if (app.status === "approved") {
            grantApproved += app.count || 0;
          }
        }

        return {
          grantId: grant.id,
          title: grant.title,
          category: grant.category,
          budget: Number(grant.budget),
          totalApplications: grantTotal,
          approvedApplications: grantApproved,
          successRate: grantTotal > 0 ? Math.round((grantApproved / grantTotal) * 100) : 0,
        };
      })
    );

    return {
      lga: { id: lgaId, lga_name: `LGA ${lgaId}` },
      period: `${year}-${String(month).padStart(2, "0")}`,
      totalGrants: lgaGrants.length,
      totalApplications,
      approvedApplications,
      rejectedApplications,
      successRate,
      totalFundingAllocated,
      totalFundingAwarded: totalRequested,
      grantDetails: grantDetails as any[],
    };
  } catch (error) {
    console.error(`[Database] Error getting LGA monthly report:`, error);
    return null;
  }
}
