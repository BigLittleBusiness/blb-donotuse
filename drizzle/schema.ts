import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  datetime,
  json,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with additional fields for the GrantThrive platform.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "staff"]).default("user").notNull(),
  location: varchar("location", { length: 255 }), // Council location or region
  bio: text("bio"), // User biography
  avatar: varchar("avatar", { length: 512 }), // Avatar URL
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Grants table - stores all grant information
 */
export const grants = mysqlTable("grants", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  budget: decimal("budget", { precision: 12, scale: 2 }).notNull(), // Grant amount
  budgetAlias: decimal("budgetAlias", { precision: 12, scale: 2 }), // Alias for budget property
  status: mysqlEnum("status", ["draft", "open", "closed", "awarded", "completed"]).default("draft").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // e.g., "Community", "Infrastructure", "Education"
  council_id: int("council_id"), // Reference to council/organization
  created_by: int("created_by").notNull(), // User who created the grant
  opening_date: datetime("opening_date"),
  closing_date: datetime("closing_date"),
  eligibility_criteria: text("eligibility_criteria"),
  application_requirements: text("application_requirements"),
  max_applications: int("max_applications"), // Maximum number of applications allowed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Grant = typeof grants.$inferSelect;
export type InsertGrant = typeof grants.$inferInsert;

/**
 * Applications table - stores grant applications from community members
 */
export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  grant_id: int("grant_id").notNull(), // Reference to grant
  applicant_id: int("applicant_id").notNull(), // User who applied
  status: mysqlEnum("status", ["draft", "submitted", "under_review", "approved", "rejected", "withdrawn"]).default("draft").notNull(),
  application_text: text("application_text").notNull(),
  requested_amount: decimal("requested_amount", { precision: 12, scale: 2 }),
  supporting_documents: json("supporting_documents"), // Array of document URLs
  submission_date: datetime("submission_date"),
  review_score: decimal("review_score", { precision: 5, scale: 2 }), // Overall review score
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

/**
 * Reviews table - stores reviews of applications
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  application_id: int("application_id").notNull(), // Reference to application
  reviewer_id: int("reviewer_id").notNull(), // Staff member reviewing
  score: decimal("score", { precision: 5, scale: 2 }).notNull(), // Review score (0-100)
  comments: text("comments"), // Reviewer comments
  recommendation: mysqlEnum("recommendation", ["approve", "reject", "needs_revision"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Community Votes table - stores community voting on grants/applications
 */
export const community_votes = mysqlTable("community_votes", {
  id: int("id").autoincrement().primaryKey(),
  grant_id: int("grant_id"), // Reference to grant (can be null if voting on application)
  application_id: int("application_id"), // Reference to application (can be null if voting on grant)
  voter_id: int("voter_id").notNull(), // User who voted
  vote_type: mysqlEnum("vote_type", ["support", "oppose", "neutral"]).notNull(),
  session_id: varchar("session_id", { length: 64 }), // Session ID alias for vote_type
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommunityVote = typeof community_votes.$inferSelect;
export type InsertCommunityVote = typeof community_votes.$inferInsert;

/**
 * Comments table - stores comments on grants and applications
 */
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  grant_id: int("grant_id"), // Reference to grant (can be null)
  application_id: int("application_id"), // Reference to application (can be null)
  user_id: int("user_id").notNull(), // User who commented
  content: text("content").notNull(),
  parent_comment_id: int("parent_comment_id"), // For nested comments/replies
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

/**
 * Follows table - stores user follows (users following grants/projects)
 */
export const follows = mysqlTable("follows", {
  id: int("id").autoincrement().primaryKey(),
  follower_id: int("follower_id").notNull(), // User who is following
  followee_id: int("followee_id"), // User being followed (can be null if following a grant)
  grant_id: int("grant_id"), // Grant being followed (can be null if following a user)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = typeof follows.$inferInsert;

/**
 * Grant Watches table - stores grants that users are watching
 */
export const grant_watches = mysqlTable("grant_watches", {
  id: int("id").autoincrement().primaryKey(),
  user_id: int("user_id").notNull(), // User watching the grant
  grant_id: int("grant_id").notNull(), // Grant being watched
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GrantWatch = typeof grant_watches.$inferSelect;
export type InsertGrantWatch = typeof grant_watches.$inferInsert;

/**
 * Notifications table - stores notifications for users
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  user_id: int("user_id").notNull(), // User receiving notification
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  type: mysqlEnum("type", ["application_update", "grant_update", "comment", "vote", "follow", "system"]).notNull(),
  related_grant_id: int("related_grant_id"), // Optional reference to related grant
  related_application_id: int("related_application_id"), // Optional reference to related application
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Analytics table - stores aggregated analytics data
 */
export const analytics = mysqlTable("analytics", {
  id: int("id").autoincrement().primaryKey(),
  metric_type: varchar("metric_type", { length: 100 }).notNull(), // e.g., "total_grants", "total_applications", "approval_rate"
  metric_value: decimal("metric_value", { precision: 12, scale: 2 }).notNull(),
  period: varchar("period", { length: 50 }).notNull(), // e.g., "2025-01", "2025-Q1", "2025"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = typeof analytics.$inferInsert;

/**
 * Community Posts table - for community engagement and discussion
 */
export const community_posts = mysqlTable("community_posts", {
  id: int("id").autoincrement().primaryKey(),
  user_id: int("user_id").notNull(), // User who created the post
  grant_id: int("grant_id"), // Related grant (optional)
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  likes: int("likes").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommunityPost = typeof community_posts.$inferSelect;
export type InsertCommunityPost = typeof community_posts.$inferInsert;
