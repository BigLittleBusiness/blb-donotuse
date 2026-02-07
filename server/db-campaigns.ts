import { eq, and, inArray, like, or } from "drizzle-orm";
import { getDb } from "./db";
import { email_campaigns, campaign_recipients, applications, grants, users } from "../drizzle/schema";

/**
 * Create a new email campaign
 */
export async function createCampaign(campaign: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(email_campaigns).values(campaign);
  return result;
}

/**
 * Get campaign by ID
 */
export async function getCampaignById(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(email_campaigns).where(eq(email_campaigns.id, campaignId)).limit(1);
  return result[0];
}

/**
 * Get all campaigns with pagination
 */
export async function getAllCampaigns(limit: number = 20, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(email_campaigns)
    .orderBy((table) => table.createdAt)
    .limit(limit)
    .offset(offset);
}

/**
 * Update campaign
 */
export async function updateCampaign(campaignId: number, updates: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(email_campaigns).set(updates).where(eq(email_campaigns.id, campaignId));
}

/**
 * Delete campaign
 */
export async function deleteCampaign(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete recipients first
  await db.delete(campaign_recipients).where(eq(campaign_recipients.campaign_id, campaignId));
  // Delete campaign
  await db.delete(email_campaigns).where(eq(email_campaigns.id, campaignId));
}

/**
 * Get target recipients based on campaign criteria
 */
export async function getTargetRecipients(campaign: any): Promise<{ userId: number; email: string | null }[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let results: any[] = [];

  switch (campaign.target_type) {
    case "all_users":
      // All users
      results = await db.select({ userId: users.id, email: users.email }).from(users);
      break;

    case "by_grant_category":
      // Users with applications to grants in specific categories
      if (campaign.target_categories && Array.isArray(campaign.target_categories)) {
        const categoryList = campaign.target_categories as string[];
        results = await db
          .select({ userId: users.id, email: users.email })
          .from(users)
          .innerJoin(applications, eq(users.id, applications.applicant_id))
          .innerJoin(grants, eq(applications.grant_id, grants.id))
          .where(inArray(grants.category, categoryList));
      }
      break;

    case "by_application_status":
      // Users with applications in specific statuses
      if (campaign.target_statuses && Array.isArray(campaign.target_statuses)) {
        const statusList = campaign.target_statuses as ("draft" | "submitted" | "under_review" | "approved" | "rejected" | "withdrawn")[];
        results = await db
          .select({ userId: users.id, email: users.email })
          .from(users)
          .innerJoin(applications, eq(users.id, applications.applicant_id))
          .where(inArray(applications.status, statusList));
      }
      break;

    case "by_user_role":
      // Users with specific roles
      if (campaign.target_roles && Array.isArray(campaign.target_roles)) {
        const roleList = campaign.target_roles as ("user" | "admin" | "staff")[];
        results = await db
          .select({ userId: users.id, email: users.email })
          .from(users)
          .where(inArray(users.role, roleList));
      }
      break;

    case "custom_list":
      // Specific user IDs
      if (campaign.target_user_ids && Array.isArray(campaign.target_user_ids)) {
        const userIdList = campaign.target_user_ids as number[];
        results = await db
          .select({ userId: users.id, email: users.email })
          .from(users)
          .where(inArray(users.id, userIdList));
      }
      break;
  }

  // Remove duplicates by email and filter out null emails
  const uniqueMap = new Map<string, { userId: number; email: string | null }>();
  results.forEach((r) => {
    if (r.email && !uniqueMap.has(r.email)) {
      uniqueMap.set(r.email, { userId: r.userId, email: r.email });
    }
  });

  return Array.from(uniqueMap.values());
}

/**
 * Add recipients to campaign
 */
export async function addCampaignRecipients(campaignId: number, recipients: { userId: number; email: string | null }[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Filter out recipients without email
  const validRecipients = recipients
    .filter((r) => r.email)
    .map((r) => ({
      campaign_id: campaignId,
      user_id: r.userId,
      email: r.email as string,
      status: "pending" as const,
    }));

  if (validRecipients.length > 0) {
    await db.insert(campaign_recipients).values(validRecipients);
  }
}

/**
 * Get campaign recipients
 */
export async function getCampaignRecipients(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(campaign_recipients).where(eq(campaign_recipients.campaign_id, campaignId));
}

/**
 * Update recipient status
 */
export async function updateRecipientStatus(
  recipientId: number,
  status: string,
  metadata?: { sent_at?: Date; opened_at?: Date; clicked_at?: Date; error_message?: string }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updates: any = { status };
  if (metadata?.sent_at) updates.sent_at = metadata.sent_at;
  if (metadata?.opened_at) updates.opened_at = metadata.opened_at;
  if (metadata?.clicked_at) updates.clicked_at = metadata.clicked_at;
  if (metadata?.error_message) updates.error_message = metadata.error_message;

  await db.update(campaign_recipients).set(updates).where(eq(campaign_recipients.id, recipientId));
}

/**
 * Get campaign statistics
 */
export async function getCampaignStats(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const recipients = await db
    .select()
    .from(campaign_recipients)
    .where(eq(campaign_recipients.campaign_id, campaignId));

  const stats = {
    total: recipients.length,
    sent: recipients.filter((r) => r.status !== "pending").length,
    opened: recipients.filter((r) => r.status === "opened" || r.status === "clicked").length,
    clicked: recipients.filter((r) => r.status === "clicked").length,
    bounced: recipients.filter((r) => r.status === "bounced").length,
    failed: recipients.filter((r) => r.status === "failed").length,
  };

  return stats;
}

/**
 * Search campaigns
 */
export async function searchCampaigns(query: string, limit: number = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(email_campaigns)
    .where(
      or(
        like(email_campaigns.name, `%${query}%`),
        like(email_campaigns.subject, `%${query}%`)
      )
    )
    .limit(limit);
}
