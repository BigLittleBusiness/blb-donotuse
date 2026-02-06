import { router, publicProcedure } from "../_core/trpc";
import { staffProcedure, communityProcedure } from "../auth";
import { z } from "zod";
import * as dbFilters from "../db-filters";

export const filtersRouter = router({
  /**
   * Create a new saved filter
   */
  create: staffProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        filters: z.array(
          z.object({
            id: z.string(),
            field: z.string(),
            operator: z.string(),
            value: z.string(),
            logicalOperator: z.enum(["AND", "OR"]),
          })
        ),
        is_public: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      try {
        const filter = await dbFilters.createSavedFilter({
          user_id: ctx.user.id,
          name: input.name,
          description: input.description,
          filters: input.filters as any,
          is_public: input.is_public || false,
          is_preset: false,
        });
        return { success: true, filter };
      } catch (error) {
        console.error("Failed to create filter:", error);
        throw new Error("Failed to create filter");
      }
    }),

  /**
   * Get all saved filters for the current user
   */
  list: staffProcedure.query(async ({ ctx }: any) => {
    try {
      return await dbFilters.getSavedFiltersByUserId(ctx.user.id);
    } catch (error) {
      console.error("Failed to list filters:", error);
      return [];
    }
  }),

  /**
   * Get a specific saved filter
   */
  get: communityProcedure
    .input(z.number())
    .query(async ({ input }: any) => {
      try {
        return await dbFilters.getSavedFilterById(input);
      } catch (error) {
        console.error("Failed to get filter:", error);
        return null;
      }
    }),

  /**
   * Update a saved filter
   */
  update: staffProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        filters: z.array(z.any()).optional(),
        is_public: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        const filter = await dbFilters.updateSavedFilter(input.id, {
          name: input.name,
          description: input.description,
          filters: input.filters as any,
          is_public: input.is_public,
        });
        return { success: true, filter };
      } catch (error) {
        console.error("Failed to update filter:", error);
        throw new Error("Failed to update filter");
      }
    }),

  /**
   * Delete a saved filter
   */
  delete: staffProcedure
    .input(z.number())
    .mutation(async ({ input }: any) => {
      try {
        const success = await dbFilters.deleteSavedFilter(input);
        return { success };
      } catch (error) {
        console.error("Failed to delete filter:", error);
        throw new Error("Failed to delete filter");
      }
    }),

  /**
   * Get all public and preset filters
   */
  getPublic: communityProcedure.query(async () => {
    try {
      return await dbFilters.getPublicFilters();
    } catch (error) {
      console.error("Failed to get public filters:", error);
      return [];
    }
  }),

  /**
   * Increment filter usage count
   */
  incrementUsage: communityProcedure
    .input(z.number())
    .mutation(async ({ input }: any) => {
      try {
        const success = await dbFilters.incrementFilterUsage(input);
        return { success };
      } catch (error) {
        console.error("Failed to increment usage:", error);
        return { success: false };
      }
    }),

  /**
   * Get most used filters
   */
  getMostUsed: communityProcedure
    .input(z.number().optional())
    .query(async ({ input }: any) => {
      try {
        return await dbFilters.getMostUsedFilters(input || 10);
      } catch (error) {
        console.error("Failed to get most used filters:", error);
        return [];
      }
    }),
});
