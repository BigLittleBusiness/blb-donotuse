/**
 * Email Provider tRPC Router
 * Admin-only procedures for monitoring and managing email providers
 */

import { adminProcedure, router } from "../_core/trpc";
import { checkEmailProviderHealth, getEmailSystemHealth, getProviderConfiguration } from "../email-health";
import { getDeliveryStats, getRecentDeliveries, getProviderStats, getFailedDeliveries } from "../db-email-stats";
import { z } from "zod";

export const emailProviderRouter = router({
  /**
   * Get current email provider health status
   */
  getHealth: adminProcedure.query(async () => {
    return await getEmailSystemHealth();
  }),

  /**
   * Get delivery statistics for a time period
   */
  getDeliveryStats: adminProcedure
    .input(z.object({ hours: z.number().default(24).optional() }))
    .query(async ({ input }) => {
      return await getDeliveryStats(input.hours || 24);
    }),

  /**
   * Get recent delivery logs
   */
  getRecentDeliveries: adminProcedure
    .input(z.object({ limit: z.number().default(20).optional() }))
    .query(async ({ input }) => {
      return await getRecentDeliveries(input.limit || 20);
    }),

  /**
   * Get provider-specific statistics
   */
  getProviderStats: adminProcedure.query(async () => {
    return await getProviderStats();
  }),

  /**
   * Get failed deliveries for troubleshooting
   */
  getFailedDeliveries: adminProcedure
    .input(z.object({ limit: z.number().default(50).optional() }))
    .query(async ({ input }) => {
      return await getFailedDeliveries(input.limit || 50);
    }),

  /**
   * Get current provider configuration
   */
  getConfiguration: adminProcedure.query(async () => {
    return await getProviderConfiguration();
  }),

  /**
   * Verify provider configuration
   */
  verifyConfiguration: adminProcedure.mutation(async () => {
    const health = await checkEmailProviderHealth();
    return {
      success: health.healthy,
      message: health.message,
      responseTime: health.responseTime,
    };
  }),
});
