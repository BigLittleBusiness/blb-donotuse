import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { publicProcedure, router } from "./_core/trpc";
import { adminProcedure, staffProcedure, communityProcedure } from "./auth";
import * as db from "./db";
import { z } from "zod";
import { exportRouter } from "./routers/export";
import { filtersRouter } from "./routers/filters";

export const appRouter = router({
  system: router({
    notifyOwner: publicProcedure
      .input(z.object({ title: z.string(), content: z.string() }))
      .mutation(async ({ input }) => {
        // Placeholder for owner notification
        console.log(`[Notification] ${input.title}: ${input.content}`);
        return { success: true };
      }),
  }),

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ GRANT MANAGEMENT ROUTERS ============

  grants: router({
    /**
     * Advanced search for grants with multiple filter options
     */
    search: publicProcedure
      .input(
        z.object({
          query: z.string().optional(),
          status: z.string().optional(),
          category: z.string().optional(),
          minBudget: z.number().optional(),
          maxBudget: z.number().optional(),
          sortBy: z.string().optional(),
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        return db.searchGrants({
          query: input.query,
          status: input.status,
          category: input.category,
          minBudget: input.minBudget,
          maxBudget: input.maxBudget,
          sortBy: input.sortBy,
          limit: input.limit,
          offset: input.offset,
        });
      }),
    /**
     * Get all grants (public access with basic filtering)
     */
    list: publicProcedure
      .input(
        z.object({
          status: z.string().optional(),
          category: z.string().optional(),
          limit: z.number().optional(),
          offset: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        return db.getAllGrants({
          status: input.status,
          category: input.category,
          limit: input.limit,
          offset: input.offset,
        });
      }),

    /**
     * Get single grant by ID (public access)
     */
    getById: publicProcedure.input(z.number()).query(async ({ input }) => {
      return db.getGrantById(input);
    }),

    /**
     * Create new grant (admin only)
     */
    create: adminProcedure
      .input(
        z.object({
          title: z.string().min(3),
          description: z.string().min(10),
          budget: z.string(),
          category: z.string(),
          opening_date: z.date().optional(),
          closing_date: z.date().optional(),
          eligibility_criteria: z.string().optional(),
          application_requirements: z.string().optional(),
          max_applications: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return db.createGrant({
          ...input,
          created_by: ctx.user.id,
        });
      }),

    /**
     * Update grant (admin only)
     */
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          status: z.enum(["draft", "open", "closed", "awarded", "completed"]).optional(),
          category: z.string().optional(),
          budget: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateGrant(id, data);
      }),

    /**
     * Delete grant (admin only)
     */
    delete: adminProcedure.input(z.number()).mutation(async ({ input }) => {
      return db.deleteGrant(input);
    }),
  }),

  // ============ APPLICATION MANAGEMENT ROUTERS ============

  applications: router({
    /**
     * Get applications for a grant (staff/admin can see all, community members see their own)
     */
    listByGrant: publicProcedure
      .input(z.object({ grantId: z.number(), status: z.string().optional() }))
      .query(async ({ input, ctx }) => {
        const applications = await db.getApplicationsByGrantId(input.grantId);

        // Filter for community members - only show their own applications
        if (ctx.user && ctx.user.role === "user") {
          return applications.filter((app) => app.applicant_id === ctx.user!.id);
        }

        return applications;
      }),

    /**
     * Get single application
     */
    getById: publicProcedure.input(z.number()).query(async ({ input, ctx }) => {
      const app = await db.getApplicationById(input);
      if (!app) return null;

      // Check authorization
      if (ctx.user && ctx.user.role === "user" && app.applicant_id !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      return app;
    }),

    /**
     * Create application (community members)
     */
    create: communityProcedure
      .input(
        z.object({
          grant_id: z.number(),
          application_text: z.string().min(10),
          requested_amount: z.string(),
          supporting_documents: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return db.createApplication({
          grant_id: input.grant_id,
          applicant_id: ctx.user.id,
          application_text: input.application_text,
          requested_amount: parseFloat(input.requested_amount),
        });
      }),

    /**
     * Update application status (staff/admin)
     */
    updateStatus: staffProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["draft", "submitted", "under_review", "approved", "rejected", "withdrawn"]),
        })
      )
      .mutation(async ({ input }) => {
        return db.updateApplication(input.id, { status: input.status });
      }),
  }),

  // ============ REVIEW ROUTERS ============

  reviews: router({
    /**
     * Get reviews for an application
     */
    listByApplication: publicProcedure.input(z.number()).query(async ({ input }) => {
      return db.getReviewsByApplicationId(input);
    }),

    /**
     * Create review (staff/admin)
     */
    create: staffProcedure
      .input(
        z.object({
          application_id: z.number(),
          score: z.string(),
          comments: z.string().optional(),
          recommendation: z.enum(["approve", "reject", "needs_revision"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return db.createReview({
          ...input,
          reviewer_id: ctx.user.id,
        });
      }),
  }),

  // ============ COMMUNITY ENGAGEMENT ROUTERS ============

  community: router({
    /**
     * Create community vote
     */
    vote: communityProcedure
      .input(
        z.object({
          grant_id: z.number().optional(),
          application_id: z.number().optional(),
          vote_type: z.enum(["support", "oppose", "neutral"]),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return db.createCommunityVote({
          grant_id: input.grant_id,
          application_id: input.application_id,
          voter_id: ctx.user.id,
          vote_type: input.vote_type,
        });
      }),

    /**
     * Get votes for a grant
     */
    getVotes: publicProcedure.input(z.number()).query(async ({ input }) => {
      return db.getCommunityVotesByGrantId(input);
    }),

    /**
     * Create comment
     */
    comment: communityProcedure
      .input(
        z.object({
          grant_id: z.number().optional(),
          application_id: z.number().optional(),
          content: z.string().min(1),
          parent_comment_id: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return db.createComment({
          grant_id: input.grant_id,
          application_id: input.application_id,
          user_id: ctx.user.id,
          content: input.content,
          parent_comment_id: input.parent_comment_id,
        });
      }),

    /**
     * Get comments for a grant
     */
    getComments: publicProcedure.input(z.number()).query(async ({ input }) => {
      return db.getCommentsByGrantId(input);
    }),

    /**
     * Get votes for an application
     */
    getVotesForApplication: publicProcedure.input(z.number()).query(async ({ input }) => {
      return db.getCommunityVotesByGrantId(input);
    }),

    /**
     * Follow a user or grant
     */
    follow: communityProcedure
      .input(
        z.object({
          followee_id: z.number().optional(),
          grant_id: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return db.createFollow(ctx.user.id, input.followee_id, input.grant_id);
      }),

    /**
     * Watch a grant
     */
    watchGrant: communityProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
      return db.createGrantWatch(ctx.user.id, input);
    }),

    /**
     * Get watched grants for user
     */
    getWatchedGrants: communityProcedure.query(async ({ ctx }) => {
      return db.getGrantWatchesByUserId(ctx.user.id);
    }),

    /**
     * Create community post
     */
    createPost: communityProcedure
      .input(
        z.object({
          grant_id: z.number().optional(),
          title: z.string().min(3),
          content: z.string().min(10),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return db.createCommunityPost({
          user_id: ctx.user.id,
          grant_id: input.grant_id,
          title: input.title,
          content: input.content,
        });
      }),

    /**
     * Get community posts for a grant
     */
    getPosts: publicProcedure.input(z.number()).query(async ({ input }) => {
      return db.getCommunityPostsByGrantId(input);
    }),
  }),

  // ============ NOTIFICATION ROUTERS ============

  notifications: router({
    /**
     * Get notifications for current user
     */
    list: communityProcedure
      .input(z.object({ unreadOnly: z.boolean().optional() }))
      .query(async ({ input, ctx }) => {
        return db.getNotificationsByUserId(ctx.user.id, input.unreadOnly);
      }),

    /**
     * Mark notification as read
     */
    markAsRead: communityProcedure.input(z.number()).mutation(async ({ input }) => {
      return db.markNotificationAsRead(input);
    }),
  }),

  // ============ ANALYTICS ROUTERS ============

  analytics: router({
    /**
     * Get analytics metrics
     */
    getMetrics: publicProcedure
      .input(
        z.object({
          metricType: z.string(),
          period: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        return db.getAnalyticsByPeriod(input.period || "2025-02");
      }),
  }),

   // ============ USER ROUTERS ============
  users: router({
    /**
     * Get current user profile
     */
    profile: communityProcedure.query(async ({ ctx }) => {
      return db.getUserById(ctx.user.id);
    }),
    /**
     * Get user by ID (public)
     */
    getById: publicProcedure.input(z.number()).query(async ({ input }) => {
      return db.getUserById(input);
    }),
  }),

  // ============ EXPORT ROUTERS ============
  export: exportRouter,

  // ============ FILTERS ROUTERS ============
  filters: filtersRouter,
});

export type AppRouter = typeof appRouter;
