import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, MapPin, CheckCircle, Clock, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function NotificationsList() {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Get unsent notifications
  const { data: notifications, isLoading, refetch } = trpc.locations.getUnsentNotifications.useQuery();

  // Mark notification as read mutation
  const markAsRead = trpc.locations.markNotificationAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to mark notification as read: ${error.message}`);
    },
  });

  const getNotificationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      new_grant: "New Grant Available",
      grant_updated: "Grant Updated",
      application_deadline_reminder: "Deadline Reminder",
      grant_awarded: "Grant Awarded",
    };
    return labels[type] || type;
  };

  const getNotificationTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      new_grant: "bg-blue-100 text-blue-800",
      grant_updated: "bg-yellow-100 text-yellow-800",
      application_deadline_reminder: "bg-orange-100 text-orange-800",
      grant_awarded: "bg-green-100 text-green-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Not sent";
    return new Date(date).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">Loading notifications...</div>
        </CardContent>
      </Card>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>You're all caught up!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No new notifications at this time</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                {notifications.length} new notification{notifications.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary">{notifications.length}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getNotificationTypeColor(notification.notification_type)}>
                    {getNotificationTypeLabel(notification.notification_type)}
                  </Badge>
                  {!notification.is_read && (
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-1">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Grant available in your area
                </p>

                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(notification.sent_at || notification.createdAt)}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (!notification.is_read) {
                    markAsRead.mutate({ notificationId: notification.id });
                  }
                  setExpandedId(expandedId === notification.id ? null : notification.id);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                {expandedId === notification.id ? "Hide" : "View"}
              </Button>
            </div>

            {expandedId === notification.id && (
              <div className="mt-4 pt-4 border-t space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium">Status</p>
                    <p className="text-gray-900">
                      {notification.is_sent ? "Sent" : "Pending"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Read Status</p>
                    <p className="text-gray-900">
                      {notification.is_read ? "Read" : "Unread"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Grant ID</p>
                    <p className="text-gray-900">#{notification.grant_id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Suburb ID</p>
                    <p className="text-gray-900">#{notification.suburb_id}</p>
                  </div>
                </div>

                {!notification.is_read && (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => markAsRead.mutate({ notificationId: notification.id })}
                    disabled={markAsRead.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Read
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
