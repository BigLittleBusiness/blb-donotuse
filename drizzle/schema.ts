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

/**
 * Saved Filters table - for staff to save and manage complex filter combinations
 */
export const saved_filters = mysqlTable("saved_filters", {
  id: int("id").autoincrement().primaryKey(),
  user_id: int("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  filters: json("filters").notNull(),
  is_public: boolean("is_public").default(false).notNull(),
  is_preset: boolean("is_preset").default(false).notNull(),
  usage_count: int("usage_count").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SavedFilter = typeof saved_filters.$inferSelect;
export type InsertSavedFilter = typeof saved_filters.$inferInsert;


/**
 * Email Campaigns table - for admin bulk email campaigns
 */
export const email_campaigns = mysqlTable("email_campaigns", {
  id: int("id").autoincrement().primaryKey(),
  created_by: int("created_by").notNull(), // Admin who created the campaign
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  content: text("content").notNull(),
  template_type: mysqlEnum("template_type", ["announcement", "reminder", "update", "custom"]).default("custom").notNull(),
  
  // Targeting criteria
  target_type: mysqlEnum("target_type", ["all_users", "by_grant_category", "by_application_status", "by_user_role", "custom_list"]).notNull(),
  target_grants: json("target_grants"), // Array of grant IDs
  target_categories: json("target_categories"), // Array of grant categories
  target_statuses: json("target_statuses"), // Array of application statuses
  target_roles: json("target_roles"), // Array of user roles
  target_user_ids: json("target_user_ids"), // Array of specific user IDs
  
  // Campaign settings
  status: mysqlEnum("status", ["draft", "scheduled", "sending", "sent", "paused", "cancelled"]).default("draft").notNull(),
  scheduled_at: datetime("scheduled_at"), // When to send
  sent_at: datetime("sent_at"), // When it was actually sent
  
  // Statistics
  total_recipients: int("total_recipients").default(0).notNull(),
  sent_count: int("sent_count").default(0).notNull(),
  opened_count: int("opened_count").default(0).notNull(),
  clicked_count: int("clicked_count").default(0).notNull(),
  bounced_count: int("bounced_count").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailCampaign = typeof email_campaigns.$inferSelect;
export type InsertEmailCampaign = typeof email_campaigns.$inferInsert;

/**
 * Campaign Recipients table - tracks individual recipient delivery status
 */
export const campaign_recipients = mysqlTable("campaign_recipients", {
  id: int("id").autoincrement().primaryKey(),
  campaign_id: int("campaign_id").notNull(),
  user_id: int("user_id").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  status: mysqlEnum("status", ["pending", "sent", "opened", "clicked", "bounced", "failed"]).default("pending").notNull(),
  sent_at: datetime("sent_at"),
  opened_at: datetime("opened_at"),
  clicked_at: datetime("clicked_at"),
  error_message: text("error_message"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CampaignRecipient = typeof campaign_recipients.$inferSelect;
export type InsertCampaignRecipient = typeof campaign_recipients.$inferInsert;


/**
 * Email Delivery Logs table - tracks all email delivery attempts
 */
export const email_delivery_logs = mysqlTable("email_delivery_logs", {
  id: int("id").autoincrement().primaryKey(),
  campaign_id: int("campaign_id"),
  recipient_email: varchar("recipient_email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message_id: varchar("message_id", { length: 255 }),
  provider: varchar("provider", { length: 50 }).notNull(), // mock, sendgrid, ses
  status: mysqlEnum("status", ["pending", "sent", "failed", "bounced", "opened", "clicked"]).default("pending").notNull(),
  error_message: text("error_message"),
  delivery_time_ms: int("delivery_time_ms"), // Time taken to deliver in milliseconds
  attempts: int("attempts").default(1).notNull(),
  last_attempt_at: datetime("last_attempt_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailDeliveryLog = typeof email_delivery_logs.$inferSelect;
export type InsertEmailDeliveryLog = typeof email_delivery_logs.$inferInsert;


/**
 * Suburbs table - stores Australian suburbs and their postcodes
 */
export const suburbs = mysqlTable("suburbs", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  postcode: varchar("postcode", { length: 10 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(), // NSW, VIC, QLD, WA, SA, TAS, ACT, NT
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Suburb = typeof suburbs.$inferSelect;
export type InsertSuburb = typeof suburbs.$inferInsert;

/**
 * Grant Locations table - tracks which suburbs/postcodes each grant is available in
 */
export const grant_locations = mysqlTable("grant_locations", {
  id: int("id").autoincrement().primaryKey(),
  grant_id: int("grant_id").notNull(),
  suburb_id: int("suburb_id").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type GrantLocation = typeof grant_locations.$inferSelect;
export type InsertGrantLocation = typeof grant_locations.$inferInsert;

/**
 * User Locations table - tracks user's home suburb/postcode for personalized filtering
 */
export const user_locations = mysqlTable("user_locations", {
  id: int("id").autoincrement().primaryKey(),
  user_id: int("user_id").notNull(),
  suburb_id: int("suburb_id").notNull(),
  is_primary: boolean("is_primary").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type UserLocation = typeof user_locations.$inferSelect;
export type InsertUserLocation = typeof user_locations.$inferInsert;

/**
 * Location Notifications table - tracks location-based notification preferences and delivery
 */
export const location_notifications = mysqlTable("location_notifications", {
  id: int("id").autoincrement().primaryKey(),
  user_id: int("user_id").notNull(),
  suburb_id: int("suburb_id").notNull(),
  grant_id: int("grant_id").notNull(),
  notification_type: mysqlEnum("notification_type", [
    "new_grant",
    "grant_updated",
    "application_deadline_reminder",
    "grant_awarded"
  ]).notNull(),
  is_sent: boolean("is_sent").default(false).notNull(),
  sent_at: timestamp("sent_at"),
  is_read: boolean("is_read").default(false).notNull(),
  read_at: timestamp("read_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type LocationNotification = typeof location_notifications.$inferSelect;
export type InsertLocationNotification = typeof location_notifications.$inferInsert;

/**
 * Location Notification Preferences table - user preferences for location-based notifications
 */
export const location_notification_preferences = mysqlTable("location_notification_preferences", {
  id: int("id").autoincrement().primaryKey(),
  user_id: int("user_id").notNull(),
  suburb_id: int("suburb_id").notNull(),
  notify_new_grants: boolean("notify_new_grants").default(true).notNull(),
  notify_grant_updates: boolean("notify_grant_updates").default(true).notNull(),
  notify_nearby_areas: boolean("notify_nearby_areas").default(false).notNull(),
  nearby_radius_km: int("nearby_radius_km").default(10).notNull(), // Radius in km for nearby area notifications
  notification_frequency: mysqlEnum("notification_frequency", [
    "immediate",
    "daily",
    "weekly",
    "never"
  ]).default("immediate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type LocationNotificationPreference = typeof location_notification_preferences.$inferSelect;
export type InsertLocationNotificationPreference = typeof location_notification_preferences.$inferInsert;


/**
 * Report Schedules table - tracks scheduled report generation for LGAs
 */
export const report_schedules = mysqlTable("report_schedules", {
  id: int("id").autoincrement().primaryKey(),
  lga_id: int("lga_id").notNull(), // Reference to LGA
  report_type: mysqlEnum("report_type", ["monthly", "quarterly", "annual"]).default("monthly").notNull(),
  schedule_day: int("schedule_day").default(1).notNull(), // Day of month (1-31) or day of quarter
  schedule_time: varchar("schedule_time", { length: 5 }).default("02:00").notNull(), // Time in HH:MM format (UTC)
  is_active: boolean("is_active").default(true).notNull(),
  last_generated_at: timestamp("last_generated_at"),
  next_scheduled_at: timestamp("next_scheduled_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReportSchedule = typeof report_schedules.$inferSelect;
export type InsertReportSchedule = typeof report_schedules.$inferInsert;

/**
 * Report History table - tracks generated reports and their delivery status
 */
export const report_history = mysqlTable("report_history", {
  id: int("id").autoincrement().primaryKey(),
  schedule_id: int("schedule_id").notNull(), // Reference to report schedule
  lga_id: int("lga_id").notNull(), // Reference to LGA
  report_period: varchar("report_period", { length: 7 }).notNull(), // YYYY-MM format
  report_year: int("report_year").notNull(),
  report_month: int("report_month").notNull(),
  report_data: json("report_data").notNull(), // Serialized report data
  report_file_url: varchar("report_file_url", { length: 512 }), // URL to stored report (PDF/CSV)
  generation_status: mysqlEnum("generation_status", ["pending", "generating", "completed", "failed"]).default("pending").notNull(),
  generation_error: text("generation_error"), // Error message if generation failed
  generated_at: timestamp("generated_at"),
  delivery_status: mysqlEnum("delivery_status", ["pending", "sent", "failed"]).default("pending").notNull(),
  delivery_error: text("delivery_error"), // Error message if delivery failed
  delivered_at: timestamp("delivered_at"),
  delivered_to: json("delivered_to"), // Array of email addresses report was sent to
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReportHistory = typeof report_history.$inferSelect;
export type InsertReportHistory = typeof report_history.$inferInsert;

/**
 * LGA Admins table - tracks which users are admins for each LGA
 */
export const lga_admins = mysqlTable("lga_admins", {
  id: int("id").autoincrement().primaryKey(),
  lga_id: int("lga_id").notNull(), // Reference to LGA
  user_id: int("user_id").notNull(), // Reference to user
  role: mysqlEnum("role", ["primary_admin", "secondary_admin", "viewer"]).default("secondary_admin").notNull(),
  email_reports: boolean("email_reports").default(true).notNull(), // Whether to receive reports via email
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LGAAdmin = typeof lga_admins.$inferSelect;
export type InsertLGAAdmin = typeof lga_admins.$inferInsert;
