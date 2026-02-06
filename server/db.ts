import { eq, desc, asc, and, or, gte, lte, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  grants,
  applications,
  reviews,
  community_votes,
  comments,
  follows,
  grant_watches,
  notifications,
  analytics,
  community_posts,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER OPERATIONS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "location", "bio", "avatar"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ GRANT OPERATIONS ============

export async function createGrant(data: {
  title: string;
  description: string;
  budget: string;
  category: string;
  created_by: number;
  opening_date?: Date;
  closing_date?: Date;
  eligibility_criteria?: string;
  application_requirements?: string;
  max_applications?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(grants).values({
    title: data.title,
    description: data.description,
    budget: data.budget as any,
    budgetAlias: data.budget as any,
    category: data.category,
    created_by: data.created_by,
    opening_date: data.opening_date,
    closing_date: data.closing_date,
    eligibility_criteria: data.eligibility_criteria,
    application_requirements: data.application_requirements,
    max_applications: data.max_applications,
  });

  return result;
}

export async function getGrantById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(grants).where(eq(grants.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllGrants(filters?: {
  status?: string;
  category?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(grants.status, filters.status as any));
  }
  if (filters?.category) {
    conditions.push(eq(grants.category, filters.category));
  }

  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;

  if (conditions.length === 0) {
    return db.select().from(grants).orderBy(desc(grants.createdAt)).limit(limit).offset(offset);
  }

  return db
    .select()
    .from(grants)
    .where(and(...conditions))
    .orderBy(desc(grants.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function searchGrants(filters?: {
  query?: string;
  status?: string;
  category?: string;
  minBudget?: number;
  maxBudget?: number;
  sortBy?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [];

  // Text search in title and description
  if (filters?.query) {
    const searchTerm = `%${filters.query}%`;
    conditions.push(
      or(
        like(grants.title, searchTerm),
        like(grants.description, searchTerm)
      )
    );
  }

  // Status filter
  if (filters?.status) {
    conditions.push(eq(grants.status, filters.status as any));
  }

  // Category filter
  if (filters?.category) {
    conditions.push(eq(grants.category, filters.category));
  }

  // Budget range filter
  if (filters?.minBudget !== undefined) {
    conditions.push(gte(grants.budget, filters.minBudget as any));
  }
  if (filters?.maxBudget !== undefined) {
    conditions.push(lte(grants.budget, filters.maxBudget as any));
  }

  const limit = Math.min(filters?.limit || 20, 100);
  const offset = filters?.offset || 0;

  let baseQuery = db.select().from(grants) as any;

  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...conditions));
  }

  // Apply sorting
  let sortOrder = desc(grants.createdAt);
  switch (filters?.sortBy) {
    case "oldest":
      sortOrder = asc(grants.createdAt);
      break;
    case "budget_asc":
      sortOrder = asc(grants.budget);
      break;
    case "budget_desc":
      sortOrder = desc(grants.budget);
      break;
    case "closing_soon":
      sortOrder = asc(grants.closing_date);
      break;
  }

  return baseQuery.orderBy(sortOrder).limit(limit).offset(offset);
}

export async function updateGrant(id: number, data: Partial<typeof grants.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(grants).set(data).where(eq(grants.id, id));
}

export async function deleteGrant(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.delete(grants).where(eq(grants.id, id));
}

// ============ APPLICATION OPERATIONS ============

export async function createApplication(data: {
  grant_id: number;
  applicant_id: number;
  application_text: string;
  requested_amount?: number;
  status?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(applications).values({
    grant_id: data.grant_id,
    applicant_id: data.applicant_id,
    application_text: data.application_text,
    requested_amount: data.requested_amount as any,
    status: (data.status || "draft") as any,
  });
}

export async function getApplicationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getApplicationsByGrantId(grantId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(applications).where(eq(applications.grant_id, grantId));
}

export async function getApplicationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(applications).where(eq(applications.applicant_id, userId));
}

export async function updateApplication(id: number, data: Partial<typeof applications.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(applications).set(data).where(eq(applications.id, id));
}

// ============ REVIEW OPERATIONS ============

export async function createReview(data: {
  application_id: number;
  reviewer_id: number;
  score: string;
  comments?: string;
  recommendation?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(reviews).values({
    application_id: data.application_id,
    reviewer_id: data.reviewer_id,
    score: data.score as any,
    comments: data.comments,
    recommendation: (data.recommendation || "needs_revision") as any,
  });
}

export async function getReviewsByApplicationId(applicationId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(reviews).where(eq(reviews.application_id, applicationId));
}

// ============ COMMUNITY ENGAGEMENT ROUTERS ============

export async function createCommunityVote(data: {
  grant_id?: number;
  application_id?: number;
  voter_id: number;
  vote_type: "support" | "oppose" | "neutral";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(community_votes).values({
    grant_id: data.grant_id,
    application_id: data.application_id,
    voter_id: data.voter_id,
    vote_type: data.vote_type,
  });
}

export async function getCommunityVotesByGrantId(grantId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(community_votes).where(eq(community_votes.grant_id, grantId));
}

// ============ COMMENT OPERATIONS ============

export async function createComment(data: {
  grant_id?: number;
  application_id?: number;
  user_id: number;
  content: string;
  parent_comment_id?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(comments).values({
    grant_id: data.grant_id,
    application_id: data.application_id,
    user_id: data.user_id,
    content: data.content,
    parent_comment_id: data.parent_comment_id,
  });
}

export async function getCommentsByGrantId(grantId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(comments).where(eq(comments.grant_id, grantId)).orderBy(desc(comments.createdAt));
}

// ============ FOLLOW OPERATIONS ============

export async function createFollow(followerId: number, followeeId?: number, grantId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(follows).values({
    follower_id: followerId,
    followee_id: followeeId,
    grant_id: grantId,
  });
}

export async function getFollowersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(follows).where(eq(follows.followee_id, userId));
}

// ============ GRANT WATCH OPERATIONS ============

export async function createGrantWatch(userId: number, grantId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(grant_watches).values({
    user_id: userId,
    grant_id: grantId,
  });
}

export async function getGrantWatchesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(grant_watches).where(eq(grant_watches.user_id, userId));
}

// ============ NOTIFICATION OPERATIONS ============

export async function createNotification(data: {
  user_id: number;
  title: string;
  content?: string;
  type: "application_update" | "grant_update" | "comment" | "vote" | "follow" | "system";
  related_grant_id?: number;
  related_application_id?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(notifications).values({
    user_id: data.user_id,
    title: data.title,
    content: data.content,
    type: data.type,
    related_grant_id: data.related_grant_id,
    related_application_id: data.related_application_id,
  });
}

export async function getNotificationsByUserId(userId: number, unreadOnly = false) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(notifications.user_id, userId)];
  if (unreadOnly) {
    conditions.push(eq(notifications.read, false));
  }

  return db.select().from(notifications).where(and(...conditions)).orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(notifications).set({ read: true }).where(eq(notifications.id, id));
}

// ============ ANALYTICS OPERATIONS ============

export async function getAnalyticsByPeriod(period: string) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(analytics).where(eq(analytics.period, period));
}

// ============ COMMUNITY POSTS OPERATIONS ============

export async function createCommunityPost(data: {
  user_id: number;
  grant_id?: number;
  title: string;
  content: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(community_posts).values({
    user_id: data.user_id,
    grant_id: data.grant_id,
    title: data.title,
    content: data.content,
  });
}

export async function getCommunityPostsByGrantId(grantId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(community_posts).where(eq(community_posts.grant_id, grantId)).orderBy(desc(community_posts.createdAt));
}
