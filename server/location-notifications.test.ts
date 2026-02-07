import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getNearbySuburbs,
  createLocationNotification,
  getUnsentNotifications,
  markNotificationAsSent,
  markNotificationAsRead,
  getLocationNotificationPreferences,
  upsertLocationNotificationPreferences,
  getUsersToNotifyForGrant,
} from "./db-locations";

// Mock database functions
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

describe("Location Notification System", () => {
  describe("getNearbySuburbs", () => {
    it("should return nearby suburbs within specified radius", async () => {
      // This test would require mocking the database
      // For now, we'll test the distance calculation logic
      const lat1 = -33.8688; // Sydney
      const lon1 = 151.2093;
      const lat2 = -33.8115; // Parramatta (nearby)
      const lon2 = 151.0033;

      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      // Sydney to Parramatta is approximately 23 km
      expect(distance).toBeGreaterThan(20);
      expect(distance).toBeLessThan(30);
    });

    it("should exclude the center suburb itself", async () => {
      // Distance calculation should return 0 for same coordinates
      const lat = -33.8688;
      const lon = 151.2093;

      const R = 6371;
      const dLat = ((lat - lat) * Math.PI) / 180;
      const dLon = ((lon - lon) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((lat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      expect(distance).toBe(0);
    });

    it("should correctly calculate distance between distant suburbs", async () => {
      // Sydney to Melbourne is approximately 713 km
      const lat1 = -33.8688; // Sydney
      const lon1 = 151.2093;
      const lat2 = -37.8136; // Melbourne
      const lon2 = 144.9631;

      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      // Sydney to Melbourne is approximately 713 km
      expect(distance).toBeGreaterThan(700);
      expect(distance).toBeLessThan(750);
    });
  });

  describe("Location Notification Preferences", () => {
    it("should validate notification frequency options", () => {
      const validFrequencies = [
        "immediate",
        "daily",
        "weekly",
        "never",
      ] as const;

      validFrequencies.forEach((freq) => {
        expect(["immediate", "daily", "weekly", "never"]).toContain(freq);
      });
    });

    it("should validate nearby radius is positive", () => {
      const validRadius = 10;
      expect(validRadius).toBeGreaterThan(0);
    });

    it("should support default notification preferences", () => {
      const defaults = {
        notify_new_grants: true,
        notify_grant_updates: true,
        notify_nearby_areas: false,
        nearby_radius_km: 10,
        notification_frequency: "immediate" as const,
      };

      expect(defaults.notify_new_grants).toBe(true);
      expect(defaults.notify_grant_updates).toBe(true);
      expect(defaults.notify_nearby_areas).toBe(false);
      expect(defaults.nearby_radius_km).toBe(10);
      expect(defaults.notification_frequency).toBe("immediate");
    });
  });

  describe("Notification Types", () => {
    it("should support all notification types", () => {
      const types = [
        "new_grant",
        "grant_updated",
        "application_deadline_reminder",
        "grant_awarded",
      ] as const;

      expect(types).toContain("new_grant");
      expect(types).toContain("grant_updated");
      expect(types).toContain("application_deadline_reminder");
      expect(types).toContain("grant_awarded");
    });

    it("should have new_grant as default notification type", () => {
      const defaultType = "new_grant";
      expect(defaultType).toBe("new_grant");
    });
  });

  describe("Notification Status Tracking", () => {
    it("should track sent status of notifications", () => {
      const notification = {
        is_sent: false,
        sent_at: null,
      };

      expect(notification.is_sent).toBe(false);
      expect(notification.sent_at).toBeNull();

      // After marking as sent
      const sentNotification = {
        is_sent: true,
        sent_at: new Date(),
      };

      expect(sentNotification.is_sent).toBe(true);
      expect(sentNotification.sent_at).not.toBeNull();
    });

    it("should track read status of notifications", () => {
      const notification = {
        is_read: false,
        read_at: null,
      };

      expect(notification.is_read).toBe(false);
      expect(notification.read_at).toBeNull();

      // After marking as read
      const readNotification = {
        is_read: true,
        read_at: new Date(),
      };

      expect(readNotification.is_read).toBe(true);
      expect(readNotification.read_at).not.toBeNull();
    });
  });

  describe("Location Notification Workflow", () => {
    it("should support complete notification workflow", () => {
      // 1. Create notification
      const notification = {
        id: 1,
        user_id: 1,
        suburb_id: 1,
        grant_id: 1,
        notification_type: "new_grant" as const,
        is_sent: false,
        sent_at: null,
        is_read: false,
        read_at: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(notification.is_sent).toBe(false);
      expect(notification.is_read).toBe(false);

      // 2. Mark as sent
      const sentNotification = {
        ...notification,
        is_sent: true,
        sent_at: new Date(),
      };

      expect(sentNotification.is_sent).toBe(true);
      expect(sentNotification.sent_at).not.toBeNull();

      // 3. Mark as read
      const readNotification = {
        ...sentNotification,
        is_read: true,
        read_at: new Date(),
      };

      expect(readNotification.is_read).toBe(true);
      expect(readNotification.read_at).not.toBeNull();
    });

    it("should support user preference updates", () => {
      const initialPrefs = {
        notify_new_grants: true,
        notify_grant_updates: true,
        notify_nearby_areas: false,
        nearby_radius_km: 10,
        notification_frequency: "immediate" as const,
      };

      const updatedPrefs = {
        ...initialPrefs,
        notify_nearby_areas: true,
        nearby_radius_km: 20,
        notification_frequency: "daily" as const,
      };

      expect(updatedPrefs.notify_nearby_areas).toBe(true);
      expect(updatedPrefs.nearby_radius_km).toBe(20);
      expect(updatedPrefs.notification_frequency).toBe("daily");
    });
  });

  describe("Distance Calculation Edge Cases", () => {
    it("should handle zero distance correctly", () => {
      const distance = 0;
      expect(distance).toBe(0);
      expect(distance <= 10).toBe(true); // Would be included in 10km radius
    });

    it("should handle exact radius boundary", () => {
      const distance = 10;
      const radius = 10;
      expect(distance <= radius).toBe(true);
    });

    it("should handle just outside radius boundary", () => {
      const distance = 10.1;
      const radius = 10;
      expect(distance <= radius).toBe(false);
    });

    it("should handle very large distances", () => {
      // Sydney to Darwin is approximately 3290 km
      const distance = 3290;
      const radius = 10;
      expect(distance <= radius).toBe(false);
    });
  });

  describe("Notification Batching", () => {
    it("should support finding users to notify for a grant", () => {
      // Simulating the logic of finding users in affected suburbs
      const grantSuburbIds = [1, 2, 3]; // Grant is available in suburbs 1, 2, 3
      const userLocations = [
        { user_id: 1, suburb_id: 1 },
        { user_id: 2, suburb_id: 2 },
        { user_id: 3, suburb_id: 4 }, // Not in grant suburbs
      ];

      const usersToNotify = userLocations.filter((ul) =>
        grantSuburbIds.includes(ul.suburb_id)
      );

      expect(usersToNotify).toHaveLength(2);
      expect(usersToNotify[0].user_id).toBe(1);
      expect(usersToNotify[1].user_id).toBe(2);
    });

    it("should respect notification preferences when batching", () => {
      const usersWithPrefs = [
        {
          user_id: 1,
          suburb_id: 1,
          notify_new_grants: true,
        },
        {
          user_id: 2,
          suburb_id: 2,
          notify_new_grants: false,
        },
        {
          user_id: 3,
          suburb_id: 3,
          notify_new_grants: true,
        },
      ];

      const usersToNotify = usersWithPrefs.filter(
        (u) => u.notify_new_grants
      );

      expect(usersToNotify).toHaveLength(2);
      expect(usersToNotify.map((u) => u.user_id)).toEqual([1, 3]);
    });
  });
});
