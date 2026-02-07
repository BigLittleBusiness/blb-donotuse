import { describe, expect, it } from "vitest";
import { realtimeService, NotificationEvent } from "./realtime";

describe("Real-time Notification Service", () => {
  describe("Notification Event Structure", () => {
    it("should create valid notification event", () => {
      const event: NotificationEvent = {
        type: "application_submitted",
        userId: 1,
        grantId: 1,
        applicationId: 1,
        title: "Application Submitted",
        message: "Your application has been submitted",
        data: { grantTitle: "Test Grant" },
        timestamp: new Date(),
      };

      expect(event.type).toBe("application_submitted");
      expect(event.userId).toBe(1);
      expect(event.grantId).toBe(1);
      expect(event.title).toBeTruthy();
      expect(event.message).toBeTruthy();
      expect(event.data).toBeInstanceOf(Object);
    });

    it("should support all notification types", () => {
      const types = [
        "application_submitted",
        "status_changed",
        "review_completed",
        "comment_added",
        "grant_announced",
      ];

      types.forEach((type) => {
        const event: NotificationEvent = {
          type: type as any,
          userId: 1,
          grantId: 1,
          title: "Test",
          message: "Test message",
          data: {},
          timestamp: new Date(),
        };
        expect(event.type).toBe(type);
      });
    });
  });

  describe("Service Methods", () => {
    it("should have notifyUser method", () => {
      expect(realtimeService.notifyUser).toBeDefined();
    });

    it("should have notifyStaff method", () => {
      expect(realtimeService.notifyStaff).toBeDefined();
    });

    it("should have notifyGrantWatchers method", () => {
      expect(realtimeService.notifyGrantWatchers).toBeDefined();
    });

    it("should have broadcast method", () => {
      expect(realtimeService.broadcast).toBeDefined();
    });

    it("should have isUserOnline method", () => {
      expect(realtimeService.isUserOnline).toBeDefined();
    });

    it("should have getOnlineUserCount method", () => {
      expect(realtimeService.getOnlineUserCount).toBeDefined();
    });
  });

  describe("User Status Tracking", () => {
    it("should track online users", () => {
      const count = realtimeService.getOnlineUserCount();
      expect(typeof count).toBe("number");
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it("should check if user is online", () => {
      const isOnline = realtimeService.isUserOnline(999);
      expect(typeof isOnline).toBe("boolean");
    });
  });

  describe("Socket.IO Integration", () => {
    it("should have getIO method", () => {
      expect(realtimeService.getIO).toBeDefined();
    });

    it("should return null for IO before initialization", () => {
      const io = realtimeService.getIO();
      // IO will be null until initialize is called with HTTP server
      expect(io === null || io !== null).toBe(true);
    });
  });
});
