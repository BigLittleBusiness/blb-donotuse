/**
 * Email delivery statistics and monitoring functions
 */

import { getDb } from "./db";
import { email_delivery_logs } from "../drizzle/schema";
import { eq, gte, and, sql } from "drizzle-orm";

export async function logEmailDelivery(data: {
  campaign_id?: number;
  recipient_email: string;
  subject: string;
  message_id?: string;
  provider: string;
  status: "pending" | "sent" | "failed" | "bounced" | "opened" | "clicked";
  error_message?: string;
  delivery_time_ms?: number;
}) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(email_delivery_logs).values({
      campaign_id: data.campaign_id,
      recipient_email: data.recipient_email,
      subject: data.subject,
      message_id: data.message_id,
      provider: data.provider,
      status: data.status,
      error_message: data.error_message,
      delivery_time_ms: data.delivery_time_ms,
      attempts: 1,
      last_attempt_at: new Date(),
    });

    return result;
  } catch (error) {
    console.error("[Email Stats] Failed to log delivery:", error);
    return null;
  }
}

export async function getDeliveryStats(hours: number = 24) {
  const db = await getDb();
  if (!db) return null;

  try {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    const logs = await db
      .select()
      .from(email_delivery_logs)
      .where(gte(email_delivery_logs.createdAt, cutoffTime));

    const stats = {
      total: logs.length,
      sent: logs.filter((l) => l.status === "sent").length,
      failed: logs.filter((l) => l.status === "failed").length,
      bounced: logs.filter((l) => l.status === "bounced").length,
      opened: logs.filter((l) => l.status === "opened").length,
      clicked: logs.filter((l) => l.status === "clicked").length,
      pending: logs.filter((l) => l.status === "pending").length,
      successRate: 0,
      avgDeliveryTime: 0,
      providers: {} as Record<string, number>,
    };

    if (stats.total > 0) {
      stats.successRate = Math.round(((stats.sent + stats.opened) / stats.total) * 100);
      const deliveryTimes = logs
        .filter((l) => l.delivery_time_ms && l.delivery_time_ms > 0)
        .map((l) => l.delivery_time_ms || 0);
      if (deliveryTimes.length > 0) {
        stats.avgDeliveryTime = Math.round(
          deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length
        );
      }

      logs.forEach((log) => {
        stats.providers[log.provider] = (stats.providers[log.provider] || 0) + 1;
      });
    }

    return stats;
  } catch (error) {
    console.error("[Email Stats] Failed to get delivery stats:", error);
    return null;
  }
}

export async function getRecentDeliveries(limit: number = 20) {
  const db = await getDb();
  if (!db) return null;

  try {
    const logs = await db
      .select()
      .from(email_delivery_logs)
      .orderBy((t) => sql`${t.createdAt} DESC`)
      .limit(limit);

    return logs;
  } catch (error) {
    console.error("[Email Stats] Failed to get recent deliveries:", error);
    return null;
  }
}

export async function getProviderStats() {
  const db = await getDb();
  if (!db) return null;

  try {
    const logs = await db.select().from(email_delivery_logs);

    const providers: Record<
      string,
      {
        total: number;
        sent: number;
        failed: number;
        successRate: number;
        avgDeliveryTime: number;
      }
    > = {};

    logs.forEach((log) => {
      if (!providers[log.provider]) {
        providers[log.provider] = {
          total: 0,
          sent: 0,
          failed: 0,
          successRate: 0,
          avgDeliveryTime: 0,
        };
      }

      providers[log.provider].total++;
      if (log.status === "sent" || log.status === "opened") {
        providers[log.provider].sent++;
      }
      if (log.status === "failed") {
        providers[log.provider].failed++;
      }
    });

    Object.keys(providers).forEach((provider) => {
      const stats = providers[provider];
      stats.successRate = Math.round((stats.sent / stats.total) * 100);

      const providerLogs = logs.filter((l) => l.provider === provider);
      const deliveryTimes = providerLogs
        .filter((l) => l.delivery_time_ms && l.delivery_time_ms > 0)
        .map((l) => l.delivery_time_ms || 0);

      if (deliveryTimes.length > 0) {
        stats.avgDeliveryTime = Math.round(
          deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length
        );
      }
    });

    return providers;
  } catch (error) {
    console.error("[Email Stats] Failed to get provider stats:", error);
    return null;
  }
}

export async function getFailedDeliveries(limit: number = 50) {
  const db = await getDb();
  if (!db) return null;

  try {
    const logs = await db
      .select()
      .from(email_delivery_logs)
      .where(eq(email_delivery_logs.status, "failed"))
      .orderBy((t) => sql`${t.createdAt} DESC`)
      .limit(limit);

    return logs;
  } catch (error) {
    console.error("[Email Stats] Failed to get failed deliveries:", error);
    return null;
  }
}
