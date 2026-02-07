import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import {
  getSuburbByName,
  getSuburbByPostcode,
  searchSuburbs,
  getGrantsBySuburb,
  setUserLocation,
  getUserLocation,
  getGrantsForUserArea,
  getGrantLocations,
  addGrantLocation,
  removeGrantLocation,
  getSuburbsByState,
} from "../db-locations";

export const locationsRouter = router({
  // Search suburbs by name or postcode
  searchSuburbs: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      return await searchSuburbs(input.query);
    }),

  // Get suburb by name
  getSuburbByName: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      return await getSuburbByName(input.name);
    }),

  // Get suburb by postcode
  getSuburbByPostcode: publicProcedure
    .input(z.object({ postcode: z.string() }))
    .query(async ({ input }) => {
      return await getSuburbByPostcode(input.postcode);
    }),

  // Get all suburbs for a state
  getSuburbsByState: publicProcedure
    .input(z.object({ state: z.string() }))
    .query(async ({ input }) => {
      return await getSuburbsByState(input.state);
    }),

  // Get grants available in a suburb
  getGrantsBySuburb: publicProcedure
    .input(z.object({ suburbId: z.number() }))
    .query(async ({ input }) => {
      return await getGrantsBySuburb(input.suburbId);
    }),

  // Set user's location
  setUserLocation: protectedProcedure
    .input(z.object({ suburbId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Not authenticated");
      return await setUserLocation(ctx.user.id, input.suburbId);
    }),

  // Get user's location
  getUserLocation: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Not authenticated");
    return await getUserLocation(ctx.user.id);
  }),

  // Get grants available to user's area
  getGrantsForMyArea: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Not authenticated");
    return await getGrantsForUserArea(ctx.user.id);
  }),

  // Get locations for a grant (admin/staff only)
  getGrantLocations: protectedProcedure
    .input(z.object({ grantId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user || ctx.user.role === "user") {
        throw new Error("Not authorized");
      }
      return await getGrantLocations(input.grantId);
    }),

  // Add location to grant (admin/staff only)
  addGrantLocation: protectedProcedure
    .input(z.object({ grantId: z.number(), suburbId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || ctx.user.role === "user") {
        throw new Error("Not authorized");
      }
      return await addGrantLocation(input.grantId, input.suburbId);
    }),

  // Remove location from grant (admin/staff only)
  removeGrantLocation: protectedProcedure
    .input(z.object({ grantId: z.number(), suburbId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || ctx.user.role === "user") {
        throw new Error("Not authorized");
      }
      return await removeGrantLocation(input.grantId, input.suburbId);
    }),

  // ============ LOCATION NOTIFICATION PROCEDURES ============

  // Get user's location notification preferences
  getNotificationPreferences: protectedProcedure
    .input(z.object({ suburbId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Not authenticated");
      const {
        getLocationNotificationPreferences,
      } = await import("../db-locations");
      return await getLocationNotificationPreferences(ctx.user.id, input.suburbId);
    }),

  // Update location notification preferences
  updateNotificationPreferences: protectedProcedure
    .input(
      z.object({
        suburbId: z.number(),
        notify_new_grants: z.boolean().optional(),
        notify_grant_updates: z.boolean().optional(),
        notify_nearby_areas: z.boolean().optional(),
        nearby_radius_km: z.number().optional(),
        notification_frequency: z
          .enum(["immediate", "daily", "weekly", "never"])
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Not authenticated");
      const {
        upsertLocationNotificationPreferences,
      } = await import("../db-locations");
      return await upsertLocationNotificationPreferences(ctx.user.id, input.suburbId, {
        notify_new_grants: input.notify_new_grants,
        notify_grant_updates: input.notify_grant_updates,
        notify_nearby_areas: input.notify_nearby_areas,
        nearby_radius_km: input.nearby_radius_km,
        notification_frequency: input.notification_frequency,
      });
    }),

  // Get unsent notifications for user
  getUnsentNotifications: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Not authenticated");
    const { getUnsentNotifications } = await import("../db-locations");
    return await getUnsentNotifications(ctx.user.id);
  }),

  // Mark notification as read
  markNotificationAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ input }) => {
      const { markNotificationAsRead } = await import("../db-locations");
      return await markNotificationAsRead(input.notificationId);
    }),

  // Get nearby suburbs for location-based notifications
  getNearbySuburbs: publicProcedure
    .input(z.object({ suburbId: z.number(), radiusKm: z.number().optional() }))
    .query(async ({ input }) => {
      const { getNearbySuburbs } = await import("../db-locations");
      return await getNearbySuburbs(input.suburbId, input.radiusKm);
    }),
});
