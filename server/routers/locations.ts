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
});
