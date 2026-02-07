import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

export interface NotificationEvent {
  type: "application_submitted" | "status_changed" | "review_completed" | "comment_added" | "grant_announced";
  userId: number;
  grantId: number;
  applicationId?: number;
  title: string;
  message: string;
  data: Record<string, any>;
  timestamp: Date;
}

class RealtimeService {
  private io: SocketIOServer | null = null;
  private userSockets: Map<number, Set<string>> = new Map();

  /**
   * Initialize Socket.IO server
   */
  initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.VITE_FRONTEND_URL || "*",
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
    });

    this.io.on("connection", (socket: Socket) => {
      console.log(`[Realtime] User connected: ${socket.id}`);

      // User joins their personal notification room
      socket.on("join_user", (userId: number) => {
        socket.join(`user_${userId}`);
        if (!this.userSockets.has(userId)) {
          this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId)!.add(socket.id);
        console.log(`[Realtime] User ${userId} joined notification room`);
      });

      // User joins grant-specific room for live updates
      socket.on("join_grant", (grantId: number) => {
        socket.join(`grant_${grantId}`);
        console.log(`[Realtime] User joined grant ${grantId} room`);
      });

      // User leaves grant room
      socket.on("leave_grant", (grantId: number) => {
        socket.leave(`grant_${grantId}`);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        // Remove from user sockets map
        this.userSockets.forEach((sockets, userId) => {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            this.userSockets.delete(userId);
          }
        });
        console.log(`[Realtime] User disconnected: ${socket.id}`);
      });

      // Error handling
      socket.on("error", (error: any) => {
        console.error(`[Realtime] Socket error:`, error);
      });
    });

    return this.io;
  }

  /**
   * Emit notification to specific user
   */
  notifyUser(userId: number, event: NotificationEvent) {
    if (!this.io) return;

    this.io.to(`user_${userId}`).emit("notification", {
      ...event,
      timestamp: event.timestamp.toISOString(),
    });

    console.log(`[Realtime] Notification sent to user ${userId}: ${event.title}`);
  }

  /**
   * Emit notification to all staff members
   */
  notifyStaff(event: NotificationEvent) {
    if (!this.io) return;

    this.io.to("staff").emit("notification", {
      ...event,
      timestamp: event.timestamp.toISOString(),
    });

    console.log(`[Realtime] Staff notification: ${event.title}`);
  }

  /**
   * Emit notification to all users watching a grant
   */
  notifyGrantWatchers(grantId: number, event: NotificationEvent) {
    if (!this.io) return;

    this.io.to(`grant_${grantId}`).emit("notification", {
      ...event,
      timestamp: event.timestamp.toISOString(),
    });

    console.log(`[Realtime] Grant ${grantId} watchers notified: ${event.title}`);
  }

  /**
   * Broadcast to all connected users
   */
  broadcast(event: NotificationEvent) {
    if (!this.io) return;

    this.io.emit("notification", {
      ...event,
      timestamp: event.timestamp.toISOString(),
    });

    console.log(`[Realtime] Broadcast: ${event.title}`);
  }

  /**
   * Get Socket.IO instance
   */
  getIO(): SocketIOServer | null {
    return this.io;
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: number): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }

  /**
   * Get online user count
   */
  getOnlineUserCount(): number {
    return this.userSockets.size;
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();
