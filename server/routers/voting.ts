import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  submitVote,
  getGrantVoteStats,
  getUserVote,
  getLGAVoteStats,
  getVoteStatsByGrantType,
  getMostVotedGrants,
  getVoteVisibilitySettings,
  updateVoteVisibilitySettings,
  getVoteResultsWithVisibility,
} from "../db-voting";

export const votingRouter = router({
  /**
   * Submit a vote on a grant
   * Only registered community members can vote
   */
  submitVote: protectedProcedure
    .input(
      z.object({
        grantId: z.number().int().positive(),
        voteType: z.enum(["support", "oppose", "neutral"]),
        lgaId: z.number().int().positive().optional(),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      try {
        await submitVote(input.grantId, ctx.user.id, input.voteType, input.lgaId);
        return {
          success: true,
          message: "Vote submitted successfully",
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message || "Failed to submit vote",
        };
      }
    }),

  /**
   * Get vote statistics for a specific grant
   */
  getGrantVoteStats: publicProcedure
    .input(z.object({ grantId: z.number().int().positive() }))
    .query(async ({ input }: any) => {
      return await getGrantVoteStats(input.grantId);
    }),

  /**
   * Get user's vote on a specific grant
   */
  getUserVote: protectedProcedure
    .input(z.object({ grantId: z.number().int().positive() }))
    .query(async ({ input, ctx }: any) => {
      return await getUserVote(input.grantId, ctx.user.id);
    }),

  /**
   * Get vote statistics for all grants in an LGA
   */
  getLGAVoteStats: publicProcedure
    .input(z.object({ lgaId: z.number().int().positive() }))
    .query(async ({ input }: any) => {
      return await getLGAVoteStats(input.lgaId);
    }),

  /**
   * Get vote statistics by grant type/category
   */
  getVoteStatsByGrantType: publicProcedure
    .input(z.object({ grantType: z.string() }))
    .query(async ({ input }: any) => {
      return await getVoteStatsByGrantType(input.grantType);
    }),

  /**
   * Get most voted grants (sorted by vote count)
   */
  getMostVotedGrants: publicProcedure
    .input(z.object({ limit: z.number().int().positive().default(10) }))
    .query(async ({ input }: any) => {
      return await getMostVotedGrants(input.limit);
    }),

  /**
   * Get vote results with visibility filtering
   * Respects admin-configured visibility settings
   */
  getVoteResults: publicProcedure
    .input(
      z.object({
        grantId: z.number().int().positive(),
        lgaId: z.number().int().positive(),
      })
    )
    .query(async ({ input, ctx }: any) => {
      const userRole = ctx.user?.role || "user";
      const userId = ctx.user?.id || 0;

      return await getVoteResultsWithVisibility(input.grantId, input.lgaId, userRole, userId);
    }),

  /**
   * Get vote visibility settings for an LGA
   * Admin only - requires user authentication
   */
  getVoteVisibilitySettings: protectedProcedure
    .input(z.object({ lgaId: z.number().int().positive() }))
    .query(async ({ input }: any) => {
      return await getVoteVisibilitySettings(input.lgaId);
    }),

  /**
   * Update vote visibility settings for an LGA
   * Admin only
   */
  updateVoteVisibilitySettings: protectedProcedure
    .input(
      z.object({
        lgaId: z.number().int().positive(),
        visibilityLevel: z.enum(["public", "community_only", "admin_only"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await updateVoteVisibilitySettings(input.lgaId, input.visibilityLevel);
        return {
          success: true,
          message: "Vote visibility settings updated successfully",
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message || "Failed to update settings",
        };
      }
    }),
});
