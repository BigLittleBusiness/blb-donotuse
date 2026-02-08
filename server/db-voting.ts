import { getDb } from "./db";
import { grant_votes, vote_visibility_settings, grants, users } from "../drizzle/schema";
import { eq, and, count, sql } from "drizzle-orm";

/**
 * Submit a vote on a grant
 * Enforces one vote per user per grant
 */
export async function submitVote(
  grantId: number,
  userId: number,
  voteType: "support" | "oppose" | "neutral",
  lgaId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  // Check if user already voted on this grant
  const existingVote = await db
    .select()
    .from(grant_votes)
    .where(and(eq(grant_votes.grant_id, grantId), eq(grant_votes.user_id, userId)))
    .limit(1);

  if (existingVote.length > 0) {
    throw new Error("User has already voted on this grant. Votes are immutable.");
  }

  // Insert the vote
  const result = await db.insert(grant_votes).values({
    grant_id: grantId,
    user_id: userId,
    vote_type: voteType,
    lga_id: lgaId,
  });

  return result;
}

/**
 * Get the vote statistics for a specific grant
 */
export async function getGrantVoteStats(grantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const stats = await db
    .select({
      support: sql<number>`COUNT(CASE WHEN vote_type = 'support' THEN 1 END)`,
      oppose: sql<number>`COUNT(CASE WHEN vote_type = 'oppose' THEN 1 END)`,
      neutral: sql<number>`COUNT(CASE WHEN vote_type = 'neutral' THEN 1 END)`,
      total: sql<number>`COUNT(*)`,
    })
    .from(grant_votes)
    .where(eq(grant_votes.grant_id, grantId));

  const result = stats[0] || { support: 0, oppose: 0, neutral: 0, total: 0 };

  return {
    support: Number(result.support),
    oppose: Number(result.oppose),
    neutral: Number(result.neutral),
    total: Number(result.total),
    supportPercentage: result.total > 0 ? (Number(result.support) / Number(result.total)) * 100 : 0,
    opposePercentage: result.total > 0 ? (Number(result.oppose) / Number(result.total)) * 100 : 0,
    neutralPercentage: result.total > 0 ? (Number(result.neutral) / Number(result.total)) * 100 : 0,
  };
}

/**
 * Get user's vote on a specific grant
 */
export async function getUserVote(grantId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const vote = await db
    .select()
    .from(grant_votes)
    .where(and(eq(grant_votes.grant_id, grantId), eq(grant_votes.user_id, userId)))
    .limit(1);

  return vote[0] || null;
}

/**
 * Get vote statistics for all grants in an LGA
 */
export async function getLGAVoteStats(lgaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const stats = await db
    .select({
      grant_id: grant_votes.grant_id,
      support: sql<number>`COUNT(CASE WHEN vote_type = 'support' THEN 1 END)`,
      oppose: sql<number>`COUNT(CASE WHEN vote_type = 'oppose' THEN 1 END)`,
      neutral: sql<number>`COUNT(CASE WHEN vote_type = 'neutral' THEN 1 END)`,
      total: sql<number>`COUNT(*)`,
    })
    .from(grant_votes)
    .where(eq(grant_votes.lga_id, lgaId))
    .groupBy(grant_votes.grant_id);

  return stats.map((stat: any) => ({
    grant_id: stat.grant_id,
    support: Number(stat.support),
    oppose: Number(stat.oppose),
    neutral: Number(stat.neutral),
    total: Number(stat.total),
    supportPercentage: stat.total > 0 ? (Number(stat.support) / Number(stat.total)) * 100 : 0,
    opposePercentage: stat.total > 0 ? (Number(stat.oppose) / Number(stat.total)) * 100 : 0,
  }));
}

/**
 * Get vote statistics by grant type
 */
export async function getVoteStatsByGrantType(grantType: string) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const stats = await db
    .select({
      grant_id: grant_votes.grant_id,
      category: grants.category,
      support: sql<number>`COUNT(CASE WHEN vote_type = 'support' THEN 1 END)`,
      oppose: sql<number>`COUNT(CASE WHEN vote_type = 'oppose' THEN 1 END)`,
      neutral: sql<number>`COUNT(CASE WHEN vote_type = 'neutral' THEN 1 END)`,
      total: sql<number>`COUNT(*)`,
    })
    .from(grant_votes)
    .innerJoin(grants, eq(grant_votes.grant_id, grants.id))
    .where(eq(grants.category, grantType))
    .groupBy(grant_votes.grant_id, grants.category);

  return stats.map((stat: any) => ({
    grant_id: stat.grant_id,
    category: stat.category,
    support: Number(stat.support),
    oppose: Number(stat.oppose),
    neutral: Number(stat.neutral),
    total: Number(stat.total),
    supportPercentage: stat.total > 0 ? (Number(stat.support) / Number(stat.total)) * 100 : 0,
  }));
}

/**
 * Get most voted grants (sorted by vote count)
 */
export async function getMostVotedGrants(limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const grants_data = await db
    .select({
      grant_id: grant_votes.grant_id,
      title: grants.title,
      total: sql<number>`COUNT(*)`,
      support: sql<number>`COUNT(CASE WHEN vote_type = 'support' THEN 1 END)`,
      oppose: sql<number>`COUNT(CASE WHEN vote_type = 'oppose' THEN 1 END)`,
    })
    .from(grant_votes)
    .innerJoin(grants, eq(grant_votes.grant_id, grants.id))
    .groupBy(grant_votes.grant_id, grants.title)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(limit);

  return grants_data.map((g: any) => ({
    grant_id: g.grant_id,
    title: g.title,
    total: Number(g.total),
    support: Number(g.support),
    oppose: Number(g.oppose),
    supportPercentage: Number(g.total) > 0 ? (Number(g.support) / Number(g.total)) * 100 : 0,
  }));
}

/**
 * Get or create vote visibility settings for an LGA
 */
export async function getVoteVisibilitySettings(lgaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  let settings = await db
    .select()
    .from(vote_visibility_settings)
    .where(eq(vote_visibility_settings.lga_id, lgaId))
    .limit(1);

  if (settings.length === 0) {
    // Create default settings if none exist
    await db.insert(vote_visibility_settings).values({
      lga_id: lgaId,
      visibility_level: "community_only",
      allow_community_see_own_vote: true,
    });

    settings = await db
      .select()
      .from(vote_visibility_settings)
      .where(eq(vote_visibility_settings.lga_id, lgaId))
      .limit(1);
  }

  return settings[0];
}

/**
 * Update vote visibility settings for an LGA
 */
export async function updateVoteVisibilitySettings(
  lgaId: number,
  visibilityLevel: "public" | "community_only" | "admin_only"
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const result = await db
    .update(vote_visibility_settings)
    .set({
      visibility_level: visibilityLevel,
    })
    .where(eq(vote_visibility_settings.lga_id, lgaId));

  return result;
}

/**
 * Check if user can see vote results based on visibility settings and user role
 */
export async function canUserSeeVoteResults(
  lgaId: number,
  userRole: string,
  userId: number,
  grantId: number
): Promise<boolean> {
  const settings = await getVoteVisibilitySettings(lgaId);

  if (settings.visibility_level === "public") {
    return true; // Everyone can see
  }

  if (settings.visibility_level === "admin_only") {
    return userRole === "admin" || userRole === "staff"; // Only admin/staff can see
  }

  if (settings.visibility_level === "community_only") {
    return userRole === "user" || userRole === "admin" || userRole === "staff"; // Registered members and admin/staff can see
  }

  return false;
}

/**
 * Get vote results with visibility filtering
 */
export async function getVoteResultsWithVisibility(
  grantId: number,
  lgaId: number,
  userRole: string,
  userId: number
) {
  const canSee = await canUserSeeVoteResults(lgaId, userRole, userId, grantId);

  if (!canSee) {
    return null; // User cannot see results
  }

  const stats = await getGrantVoteStats(grantId);
  const userVote = await getUserVote(grantId, userId);

  return {
    ...stats,
    userVote: userVote?.vote_type || null, // User can always see their own vote
  };
}
