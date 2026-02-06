import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "./_core/trpc";

/**
 * Admin-only procedure - only users with admin role can access
 */
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have permission to access this resource. Admin role required.",
    });
  }
  return next({ ctx });
});

/**
 * Staff-only procedure - staff and admin can access
 */
export const staffProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "staff" && ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You do not have permission to access this resource. Staff or Admin role required.",
    });
  }
  return next({ ctx });
});

/**
 * Community member procedure - all authenticated users can access
 */
export const communityProcedure = protectedProcedure;

/**
 * Helper function to check if user can manage grants (admin or staff)
 */
export function canManageGrants(userRole: string): boolean {
  return userRole === "admin" || userRole === "staff";
}

/**
 * Helper function to check if user can review applications (admin or staff)
 */
export function canReviewApplications(userRole: string): boolean {
  return userRole === "admin" || userRole === "staff";
}

/**
 * Helper function to check if user can create grants (admin only)
 */
export function canCreateGrants(userRole: string): boolean {
  return userRole === "admin";
}

/**
 * Helper function to check if user is admin
 */
export function isAdmin(userRole: string): boolean {
  return userRole === "admin";
}

/**
 * Helper function to check if user is staff or admin
 */
export function isStaffOrAdmin(userRole: string): boolean {
  return userRole === "staff" || userRole === "admin";
}
