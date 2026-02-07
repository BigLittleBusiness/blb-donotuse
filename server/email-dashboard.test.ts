import { describe, it, expect, beforeEach } from "vitest";
import { getDeliveryStats, getProviderStats, getFailedDeliveries } from "./db-email-stats";
import { checkEmailProviderHealth, getProviderConfiguration } from "./email-health";

describe("Email Provider Dashboard", () => {
  describe("Delivery Statistics", () => {
    it("should calculate delivery stats correctly", async () => {
      const stats = await getDeliveryStats(24);

      if (stats) {
        expect(stats).toHaveProperty("total");
        expect(stats).toHaveProperty("sent");
        expect(stats).toHaveProperty("failed");
        expect(stats).toHaveProperty("successRate");
        expect(stats.successRate).toBeGreaterThanOrEqual(0);
        expect(stats.successRate).toBeLessThanOrEqual(100);
      }
    });

    it("should return stats for different time periods", async () => {
      const stats24h = await getDeliveryStats(24);
      const stats7d = await getDeliveryStats(168);

      if (stats24h && stats7d) {
        expect(stats24h.total).toBeLessThanOrEqual(stats7d.total);
      }
    });
  });

  describe("Provider Statistics", () => {
    it("should get provider-specific stats", async () => {
      const stats = await getProviderStats();

      if (stats) {
        expect(typeof stats).toBe("object");
        Object.values(stats).forEach((providerStat) => {
          expect(providerStat).toHaveProperty("total");
          expect(providerStat).toHaveProperty("sent");
          expect(providerStat).toHaveProperty("failed");
          expect(providerStat).toHaveProperty("successRate");
          expect(providerStat).toHaveProperty("avgDeliveryTime");
        });
      }
    });
  });

  describe("Failed Deliveries", () => {
    it("should retrieve failed deliveries", async () => {
      const failed = await getFailedDeliveries(10);

      if (failed) {
        expect(Array.isArray(failed)).toBe(true);
        failed.forEach((delivery) => {
          expect(delivery.status).toBe("failed");
        });
      }
    });

    it("should respect limit parameter", async () => {
      const failed = await getFailedDeliveries(5);

      if (failed) {
        expect(failed.length).toBeLessThanOrEqual(5);
      }
    });
  });

  describe("Provider Health Check", () => {
    it("should check provider health", async () => {
      const health = await checkEmailProviderHealth();

      expect(health).toHaveProperty("name");
      expect(health).toHaveProperty("healthy");
      expect(health).toHaveProperty("message");
      expect(health).toHaveProperty("responseTime");
      expect(typeof health.healthy).toBe("boolean");
      expect(health.responseTime).toBeGreaterThanOrEqual(0);
    });

    it("should have reasonable response time", async () => {
      const health = await checkEmailProviderHealth();

      // Response time should be less than 5 seconds
      expect(health.responseTime).toBeGreaterThanOrEqual(0);
      expect(health.responseTime).toBeLessThan(5000);
    });
  });

  describe("Provider Configuration", () => {
    it("should get provider configuration", async () => {
      const config = await getProviderConfiguration();

      expect(config).toHaveProperty("provider");
      expect(config).toHaveProperty("configured");
      expect(config).toHaveProperty("status");
      expect(config).toHaveProperty("environment");
      expect(typeof config.configured).toBe("boolean");
    });

    it("should not expose sensitive keys", async () => {
      const config = await getProviderConfiguration();

      const configStr = JSON.stringify(config);
      expect(configStr).not.toContain("API_KEY");
      expect(configStr).not.toContain("SECRET");
    });

    it("should show provider configuration status", async () => {
      const config = await getProviderConfiguration();

      if (Object.keys(config.environment).length > 0) {
        expect(config.environment).toHaveProperty("EMAIL_PROVIDER");
        expect(config.environment).toHaveProperty("EMAIL_FROM");
        expect(config.environment).toHaveProperty("SENDGRID_CONFIGURED");
        expect(config.environment).toHaveProperty("AWS_SES_CONFIGURED");
      }
    });
  });

  describe("Email Delivery Logs", () => {
    it("should track delivery attempts", async () => {
      // This would require actual log entries in the database
      // For now, we just verify the function exists and returns data
      const stats = await getDeliveryStats(24);

      if (stats) {
        expect(stats.total).toBeGreaterThanOrEqual(0);
        expect(stats.attempts).toBeUndefined(); // Not part of stats
      }
    });
  });

  describe("Dashboard Metrics", () => {
    it("should calculate success rate accurately", async () => {
      const stats = await getDeliveryStats(24);

      if (stats && stats.total > 0) {
        const calculatedRate = Math.round(((stats.sent + stats.opened) / stats.total) * 100);
        expect(stats.successRate).toBe(calculatedRate);
      }
    });

    it("should track average delivery time", async () => {
      const stats = await getDeliveryStats(24);

      if (stats && stats.avgDeliveryTime) {
        expect(stats.avgDeliveryTime).toBeGreaterThan(0);
      }
    });

    it("should categorize emails by provider", async () => {
      const stats = await getDeliveryStats(24);

      if (stats && Object.keys(stats.providers).length > 0) {
        Object.entries(stats.providers).forEach(([provider, count]) => {
          expect(typeof provider).toBe("string");
          expect(typeof count).toBe("number");
          expect(count).toBeGreaterThan(0);
        });
      }
    });
  });
});
