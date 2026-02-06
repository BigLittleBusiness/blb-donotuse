import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import {
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
} from "../drizzle/schema.ts";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

async function seed() {
  try {
    console.log("[Seed] Connecting to database...");
    const connection = await mysql.createConnection(DATABASE_URL);
    const db = drizzle(connection);

    // Clear existing data
    console.log("[Seed] Clearing existing data...");
    await db.delete(analytics);
    await db.delete(notifications);
    await db.delete(grant_watches);
    await db.delete(follows);
    await db.delete(comments);
    await db.delete(community_votes);
    await db.delete(reviews);
    await db.delete(applications);
    await db.delete(grants);
    await db.delete(users);

    // Seed users
    console.log("[Seed] Seeding users...");
    const adminUser = {
      openId: "admin-001",
      name: "Admin User",
      email: "admin@grantthrive.local",
      loginMethod: "manus",
      role: "admin",
    };

    const staffUsers = [
      {
        openId: "staff-001",
        name: "Sarah Johnson",
        email: "sarah@grantthrive.local",
        loginMethod: "manus",
        role: "staff",
      },
      {
        openId: "staff-002",
        name: "Michael Chen",
        email: "michael@grantthrive.local",
        loginMethod: "manus",
        role: "staff",
      },
    ];

    const communityUsers = [
      {
        openId: "user-001",
        name: "Emma Wilson",
        email: "emma@example.local",
        loginMethod: "manus",
        role: "user",
      },
      {
        openId: "user-002",
        name: "James Brown",
        email: "james@example.local",
        loginMethod: "manus",
        role: "user",
      },
      {
        openId: "user-003",
        name: "Lisa Anderson",
        email: "lisa@example.local",
        loginMethod: "manus",
        role: "user",
      },
      {
        openId: "user-004",
        name: "David Martinez",
        email: "david@example.local",
        loginMethod: "manus",
        role: "user",
      },
      {
        openId: "user-005",
        name: "Sophie Taylor",
        email: "sophie@example.local",
        loginMethod: "manus",
        role: "user",
      },
    ];

    await db.insert(users).values([adminUser, ...staffUsers, ...communityUsers]);
    console.log("[Seed] ✓ Users seeded (1 admin, 2 staff, 5 community)");

    // Seed grants
    console.log("[Seed] Seeding grants...");
    const grantsData = [
      {
        title: "Community Center Renovation",
        description:
          "Funding for comprehensive renovation and modernization of the local community center, including new facilities, accessibility improvements, and technology upgrades.",
        category: "Infrastructure",
        budget: 250000,
        status: "open",
        opening_date: new Date("2025-01-15"),
        closing_date: new Date("2025-03-15"),
        created_by: 1,
      },
      {
        title: "Youth Education & Mentorship Program",
        description:
          "Support for youth development programs including STEM education, mentorship, career guidance, and scholarship opportunities for underprivileged students.",
        category: "Education",
        budget: 150000,
        status: "open",
        opening_date: new Date("2025-02-01"),
        closing_date: new Date("2025-04-30"),
        created_by: 1,
      },
      {
        title: "Environmental Sustainability Initiative",
        description:
          "Grants for environmental projects including tree planting, renewable energy installations, waste management improvements, and community gardens.",
        category: "Environment",
        budget: 180000,
        status: "open",
        opening_date: new Date("2025-01-20"),
        closing_date: new Date("2025-05-20"),
        created_by: 1,
      },
      {
        title: "Healthcare Access Program",
        description:
          "Funding for mobile health clinics, preventive health programs, mental health services, and health education initiatives for underserved communities.",
        category: "Healthcare",
        budget: 200000,
        status: "open",
        opening_date: new Date("2025-02-10"),
        closing_date: new Date("2025-04-10"),
        created_by: 1,
      },
      {
        title: "Small Business Development Fund",
        description:
          "Support for small businesses and entrepreneurs including business training, mentorship, equipment grants, and working capital assistance.",
        category: "Economic Development",
        budget: 300000,
        status: "open",
        opening_date: new Date("2025-01-25"),
        closing_date: new Date("2025-03-25"),
        created_by: 1,
      },
      {
        title: "Arts & Culture Community Program",
        description:
          "Grants for local arts organizations, cultural events, artist residencies, and community arts education programs.",
        category: "Arts & Culture",
        budget: 100000,
        status: "closed",
        opening_date: new Date("2024-12-01"),
        closing_date: new Date("2025-01-31"),
        created_by: 1,
      },
      {
        title: "Aged Care Support Services",
        description:
          "Funding for services supporting elderly residents including home care, social programs, technology training, and community engagement activities.",
        category: "Social Services",
        budget: 175000,
        status: "open",
        opening_date: new Date("2025-02-15"),
        closing_date: new Date("2025-05-15"),
        created_by: 1,
      },
      {
        title: "Sports & Recreation Facilities",
        description:
          "Grants for building and upgrading sports facilities, recreation centers, and community sports programs for all ages.",
        category: "Recreation",
        budget: 220000,
        status: "open",
        opening_date: new Date("2025-03-01"),
        closing_date: new Date("2025-05-01"),
        created_by: 1,
      },
    ];

    await db.insert(grants).values(grantsData);
    console.log("[Seed] ✓ Grants seeded (8 grants)");

    // Seed applications
    console.log("[Seed] Seeding applications...");
    const applicationsData = [
      {
        grant_id: 1,
        applicant_id: 2,
        application_text:
          "We are seeking funding to renovate the downtown community center to better serve our diverse community.",
        requested_amount: 245000,
        status: "submitted",
        submission_date: new Date("2025-02-01"),
      },
      {
        grant_id: 1,
        applicant_id: 3,
        application_text:
          "Comprehensive upgrade of the Riverside community hub including new technology and accessibility features.",
        requested_amount: 200000,
        status: "submitted",
        submission_date: new Date("2025-02-02"),
      },
      {
        grant_id: 2,
        applicant_id: 4,
        application_text:
          "Comprehensive STEM education program targeting underprivileged youth in central district.",
        requested_amount: 145000,
        status: "submitted",
        submission_date: new Date("2025-02-03"),
      },
      {
        grant_id: 3,
        applicant_id: 5,
        application_text:
          "Large-scale tree planting and green space development project across multiple city locations.",
        requested_amount: 175000,
        status: "under_review",
        submission_date: new Date("2025-02-04"),
      },
      {
        grant_id: 4,
        applicant_id: 6,
        application_text:
          "Mobile health clinic providing healthcare services to underserved rural communities.",
        requested_amount: 195000,
        status: "submitted",
        submission_date: new Date("2025-02-05"),
      },
    ];

    await db.insert(applications).values(applicationsData);
    console.log("[Seed] ✓ Applications seeded (5 applications)");

    // Seed reviews
    console.log("[Seed] Seeding reviews...");
    const reviewsData = [
      {
        application_id: 4,
        reviewer_id: 2,
        score: 85,
        feedback: "Excellent project with clear environmental impact. Well-structured proposal.",
        status: "approved",
      },
      {
        application_id: 5,
        reviewer_id: 3,
        score: 78,
        feedback: "Good project addressing healthcare access. Some budget justification needed.",
        status: "pending",
      },
    ];

    await db.insert(reviews).values(reviewsData);
    console.log("[Seed] ✓ Reviews seeded (2 reviews)");

    // Seed votes
    console.log("[Seed] Seeding votes...");
    const votesData = [
      {
        application_id: 1,
        voter_id: 2,
        vote_type: "support",
      },
      {
        application_id: 1,
        voter_id: 3,
        vote_type: "support",
      },
      {
        application_id: 1,
        voter_id: 4,
        vote_type: "support",
      },
      {
        application_id: 2,
        voter_id: 5,
        vote_type: "support",
      },
      {
        application_id: 2,
        voter_id: 6,
        vote_type: "support",
      },
      {
        application_id: 3,
        voter_id: 2,
        vote_type: "support",
      },
    ];

    await db.insert(community_votes).values(votesData);
    console.log("[Seed] ✓ Votes seeded (6 votes)");

    // Seed comments
    console.log("[Seed] Seeding comments...");
    const commentsData = [
      {
        application_id: 1,
        user_id: 2,
        content: "This project would greatly benefit our downtown area. Strong support!",
      },
      {
        application_id: 1,
        user_id: 3,
        content: "The accessibility improvements are much needed. Great initiative.",
      },
      {
        application_id: 2,
        user_id: 4,
        content: "Riverside community will really benefit from these upgrades.",
      },
      {
        application_id: 3,
        user_id: 5,
        content: "STEM education is crucial for our youth. Excellent program design.",
      },
      {
        application_id: 4,
        user_id: 6,
        content: "Environmental sustainability is a priority. Love this initiative!",
      },
    ];

    await db.insert(comments).values(commentsData);
    console.log("[Seed] ✓ Comments seeded (5 comments)");

    // Seed follows
    console.log("[Seed] Seeding follows...");
    const followsData = [
      {
        follower_id: 2,
        following_id: 3,
      },
      {
        follower_id: 3,
        following_id: 2,
      },
      {
        follower_id: 4,
        following_id: 5,
      },
      {
        follower_id: 5,
        following_id: 6,
      },
      {
        follower_id: 6,
        following_id: 4,
      },
    ];

    await db.insert(follows).values(followsData);
    console.log("[Seed] ✓ Follows seeded (5 follows)");

    // Seed watches
    console.log("[Seed] Seeding watches...");
    const watchesData = [
      {
        user_id: 2,
        grant_id: 1,
      },
      {
        user_id: 3,
        grant_id: 1,
      },
      {
        user_id: 4,
        grant_id: 2,
      },
      {
        user_id: 5,
        grant_id: 3,
      },
      {
        user_id: 6,
        grant_id: 4,
      },
      {
        user_id: 2,
        grant_id: 5,
      },
    ];

    await db.insert(grant_watches).values(watchesData);
    console.log("[Seed] ✓ Watches seeded (6 watches)");

    // Seed notifications
    console.log("[Seed] Seeding notifications...");
    const notificationsData = [
      {
        user_id: 2,
        type: "application_update",
        title: "Application Submitted",
        content: "Your application for Community Center Renovation has been submitted.",
        read: false,
      },
      {
        user_id: 3,
        type: "application_update",
        title: "Application Submitted",
        content: "Your application for Riverside Community Hub Upgrade has been submitted.",
        read: false,
      },
      {
        user_id: 4,
        type: "grant_update",
        title: "New Grant Available",
        content: "New grant: STEM Education & Mentorship Program is now open.",
        read: true,
      },
      {
        user_id: 5,
        type: "application_update",
        title: "Application Status Updated",
        content: "Your application status has been updated to Under Review.",
        read: true,
      },
    ];

    await db.insert(notifications).values(notificationsData);
    console.log("[Seed] ✓ Notifications seeded (4 notifications)");

    // Seed analytics
    console.log("[Seed] Seeding analytics...");
    const analyticsData = [
      {
        metric_type: "total_grants",
        metric_value: 8,
        period: "2025-02",
      },
      {
        metric_type: "total_applications",
        metric_value: 5,
        period: "2025-02",
      },
      {
        metric_type: "total_budget_available",
        metric_value: 1375000,
        period: "2025-02",
      },
      {
        metric_type: "community_engagement_score",
        metric_value: 85,
        period: "2025-02",
      },
      {
        metric_type: "application_approval_rate",
        metric_value: 60,
        period: "2025-02",
      },
    ];

    await db.insert(analytics).values(analyticsData);
    console.log("[Seed] ✓ Analytics seeded (5 metrics)");

    console.log("\n[Seed] ✅ Database seeding completed successfully!");
    console.log("[Seed] Summary:");
    console.log("  - 1 admin user, 2 staff users, 5 community users");
    console.log("  - 8 grants (5 open, 1 closed, 2 draft)");
    console.log("  - 5 applications");
    console.log("  - 2 reviews");
    console.log("  - 6 votes");
    console.log("  - 5 comments");
    console.log("  - 5 follows");
    console.log("  - 6 watches");
    console.log("  - 4 notifications");
    console.log("  - 5 analytics metrics");

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("[Seed] ❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
