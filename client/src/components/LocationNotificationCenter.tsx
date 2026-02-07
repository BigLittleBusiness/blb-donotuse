import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, MapPin, Clock, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface LocationNotificationCenterProps {
  suburbId: number;
  suburbName: string;
}

export function LocationNotificationCenter({
  suburbId,
  suburbName,
}: LocationNotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get current preferences
  const { data: preferences, isLoading } = trpc.locations.getNotificationPreferences.useQuery({
    suburbId,
  });

  // Update preferences mutation
  const updatePrefs = trpc.locations.updateNotificationPreferences.useMutation({
    onSuccess: () => {
      toast.success("Notification preferences updated");
    },
    onError: (error) => {
      toast.error(`Failed to update preferences: ${error.message}`);
    },
  });

  const handleToggleNewGrants = async (checked: boolean) => {
    await updatePrefs.mutateAsync({
      suburbId,
      notify_new_grants: checked,
    });
  };

  const handleToggleUpdates = async (checked: boolean) => {
    await updatePrefs.mutateAsync({
      suburbId,
      notify_grant_updates: checked,
    });
  };

  const handleToggleNearby = async (checked: boolean) => {
    await updatePrefs.mutateAsync({
      suburbId,
      notify_nearby_areas: checked,
    });
  };

  const handleFrequencyChange = async (frequency: string) => {
    await updatePrefs.mutateAsync({
      suburbId,
      notification_frequency: frequency as "immediate" | "daily" | "weekly" | "never",
    });
  };

  const handleRadiusChange = async (radius: string) => {
    await updatePrefs.mutateAsync({
      suburbId,
      nearby_radius_km: parseInt(radius),
    });
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <Bell className="w-4 h-4" />
        Notification Settings
      </Button>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle>Location Notifications</CardTitle>
              <CardDescription>
                Manage notifications for {suburbName}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">Loading preferences...</div>
        ) : (
          <>
            {/* New Grants Notification */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="new-grants"
                  checked={preferences?.notify_new_grants ?? true}
                  onCheckedChange={handleToggleNewGrants}
                  disabled={updatePrefs.isPending}
                />
                <label
                  htmlFor="new-grants"
                  className="text-sm font-medium cursor-pointer flex-1"
                >
                  Notify me about new grants in {suburbName}
                </label>
              </div>
              <p className="text-xs text-gray-500 ml-6">
                Get notified whenever a new grant becomes available in your area
              </p>
            </div>

            {/* Grant Updates Notification */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="grant-updates"
                  checked={preferences?.notify_grant_updates ?? true}
                  onCheckedChange={handleToggleUpdates}
                  disabled={updatePrefs.isPending}
                />
                <label
                  htmlFor="grant-updates"
                  className="text-sm font-medium cursor-pointer flex-1"
                >
                  Notify me about grant updates
                </label>
              </div>
              <p className="text-xs text-gray-500 ml-6">
                Get notified when grant details, deadlines, or status changes
              </p>
            </div>

            {/* Nearby Areas Notification */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="nearby-areas"
                  checked={preferences?.notify_nearby_areas ?? false}
                  onCheckedChange={handleToggleNearby}
                  disabled={updatePrefs.isPending}
                />
                <label
                  htmlFor="nearby-areas"
                  className="text-sm font-medium cursor-pointer flex-1"
                >
                  Include nearby areas
                </label>
              </div>
              <p className="text-xs text-gray-500 ml-6">
                Also get notified about grants in nearby suburbs
              </p>

              {/* Nearby Radius Selection */}
              {preferences?.notify_nearby_areas && (
                <div className="ml-6 mt-3">
                  <label className="text-sm text-gray-600 mb-2 block">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Notification radius
                  </label>
                  <Select
                    value={preferences?.nearby_radius_km?.toString() || "10"}
                    onValueChange={handleRadiusChange}
                    disabled={updatePrefs.isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 km</SelectItem>
                      <SelectItem value="10">10 km</SelectItem>
                      <SelectItem value="15">15 km</SelectItem>
                      <SelectItem value="20">20 km</SelectItem>
                      <SelectItem value="30">30 km</SelectItem>
                      <SelectItem value="50">50 km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Notification Frequency */}
            <div className="space-y-3 pt-3 border-t">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Notification Frequency
              </label>
              <Select
                value={preferences?.notification_frequency || "immediate"}
                onValueChange={handleFrequencyChange}
                disabled={updatePrefs.isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">
                    <div>
                      <div className="font-medium">Immediate</div>
                      <div className="text-xs text-gray-500">Get notified right away</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="daily">
                    <div>
                      <div className="font-medium">Daily</div>
                      <div className="text-xs text-gray-500">Once per day at 9 AM</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="weekly">
                    <div>
                      <div className="font-medium">Weekly</div>
                      <div className="text-xs text-gray-500">Once per week on Monday</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="never">
                    <div>
                      <div className="font-medium">Never</div>
                      <div className="text-xs text-gray-500">Disable notifications</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Badge */}
            <div className="pt-3 border-t">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">
                  {preferences?.notification_frequency === "never"
                    ? "Notifications disabled"
                    : "Notifications enabled"}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
