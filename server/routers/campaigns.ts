import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import * as db from "../db-campaigns";

export const campaignsRouter = router({
  /**
   * Create a new email campaign
   */
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        subject: z.string().min(1),
        content: z.string().min(1),
        template_type: z.enum(["announcement", "reminder", "update", "custom"]),
        target_type: z.enum(["all_users", "by_grant_category", "by_application_status", "by_user_role", "custom_list"]),
        target_categories: z.array(z.string()).nullable(),
        target_statuses: z.array(z.string()).nullable(),
        target_roles: z.array(z.string()).nullable(),
        target_user_ids: z.array(z.number()).nullable(),
        status: z.enum(["draft", "scheduled", "sending", "sent", "paused", "cancelled"]),
        scheduled_at: z.date().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const campaign = await db.createCampaign({
        created_by: ctx.user.id,
        name: input.name,
        subject: input.subject,
        content: input.content,
        template_type: input.template_type,
        target_type: input.target_type,
        target_categories: input.target_categories,
        target_statuses: input.target_statuses,
        target_roles: input.target_roles,
        target_user_ids: input.target_user_ids,
        status: input.status,
        scheduled_at: input.scheduled_at,
        total_recipients: 0,
      });

      // Get target recipients and add them
      const recipients = await db.getTargetRecipients(input);
      if (recipients.length > 0) {
        const campaignId = (campaign as any)[0]?.id || 1;
        await db.addCampaignRecipients(campaignId, recipients);
        await db.updateCampaign(campaignId, { total_recipients: recipients.length });
      }

      return campaign;
    }),

  /**
   * Get all campaigns
   */
  list: adminProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return await db.getAllCampaigns(input.limit, input.offset);
    }),

  /**
   * Get campaign by ID
   */
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getCampaignById(input.id);
    }),

  /**
   * Update campaign
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        updates: z.object({
          name: z.string().optional(),
          subject: z.string().optional(),
          content: z.string().optional(),
          status: z.enum(["draft", "scheduled", "sending", "sent", "paused", "cancelled"]).optional(),
          scheduled_at: z.date().nullable().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      await db.updateCampaign(input.id, input.updates);
      return { success: true };
    }),

  /**
   * Delete campaign
   */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteCampaign(input.id);
      return { success: true };
    }),

  /**
   * Get campaign recipients
   */
  getRecipients: adminProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => {
      return await db.getCampaignRecipients(input.campaignId);
    }),

  /**
   * Get campaign statistics
   */
  getStats: adminProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => {
      return await db.getCampaignStats(input.campaignId);
    }),

  /**
   * Search campaigns
   */
  search: adminProcedure
    .input(z.object({ query: z.string(), limit: z.number().default(20) }))
    .query(async ({ input }) => {
      return await db.searchCampaigns(input.query, input.limit);
    }),
});
