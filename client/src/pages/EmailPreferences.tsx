import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Mail, Bell, AlertCircle } from "lucide-react";

interface NotificationPreference {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  frequency: "immediate" | "daily" | "weekly" | "never";
}

export default function EmailPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: "application_submitted",
      name: "Application Submitted",
      description: "Receive confirmation when you submit a grant application",
      enabled: true,
      frequency: "immediate",
    },
    {
      id: "application_status_update",
      name: "Application Status Updates",
      description: "Get notified when your application status changes",
      enabled: true,
      frequency: "immediate",
    },
    {
      id: "application_approved",
      name: "Application Approved",
      description: "Receive notification when your application is approved",
      enabled: true,
      frequency: "immediate",
    },
    {
      id: "application_rejected",
      name: "Application Rejected",
      description: "Get notified if your application is not selected",
      enabled: true,
      frequency: "immediate",
    },
    {
      id: "grant_announcement",
      name: "New Grant Announcements",
      description: "Receive notifications about new grant opportunities",
      enabled: true,
      frequency: "immediate",
    },
    {
      id: "grant_closing_soon",
      name: "Grant Closing Reminders",
      description: "Get reminded when grant application deadlines are approaching",
      enabled: true,
      frequency: "daily",
    },
    {
      id: "community_activity",
      name: "Community Activity Digest",
      description: "Receive a weekly digest of community discussions and activities",
      enabled: true,
      frequency: "weekly",
    },
    {
      id: "grant_recommendations",
      name: "Personalized Grant Recommendations",
      description: "Get suggestions for grants that match your profile",
      enabled: false,
      frequency: "weekly",
    },
  ]);

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleTogglePreference = (id: string) => {
    setPreferences((prev) =>
      prev.map((pref) => (pref.id === id ? { ...pref, enabled: !pref.enabled } : pref))
    );
    setSaveSuccess(false);
  };

  const handleChangeFrequency = (id: string, frequency: "immediate" | "daily" | "weekly" | "never") => {
    setPreferences((prev) =>
      prev.map((pref) => (pref.id === id ? { ...pref, frequency } : pref))
    );
    setSaveSuccess(false);
  };

  const handleSavePreferences = async () => {
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case "immediate":
        return "Immediately";
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "never":
        return "Never";
      default:
        return frequency;
    }
  };

  const enabledCount = preferences.filter((p) => p.enabled).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Email Preferences</h1>
        <p className="text-slate-600 mt-2">Manage how you receive notifications from GrantThrive</p>
      </div>

      {saveSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Your email preferences have been saved successfully.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="digest">Digest Settings</TabsTrigger>
          <TabsTrigger value="unsubscribe">Unsubscribe</TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Notification Types</h2>
                <p className="text-slate-600 text-sm mt-1">
                  {enabledCount} of {preferences.length} notification types enabled
                </p>
              </div>
              <Mail className="w-8 h-8 text-blue-600" />
            </div>

            <div className="space-y-4">
              {preferences.map((pref) => (
                <div key={pref.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={pref.id}
                          checked={pref.enabled}
                          onChange={() => handleTogglePreference(pref.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <label htmlFor={pref.id} className="font-semibold text-slate-900 cursor-pointer">
                          {pref.name}
                        </label>
                      </div>
                      <p className="text-slate-600 text-sm mt-1 ml-6">{pref.description}</p>
                    </div>
                  </div>

                  {pref.enabled && (
                    <div className="ml-6 mt-3 pt-3 border-t border-slate-200">
                      <label className="text-sm font-medium text-slate-700 block mb-2">
                        Frequency
                      </label>
                      <select
                        value={pref.frequency}
                        onChange={(e) =>
                          handleChangeFrequency(
                            pref.id,
                            e.target.value as "immediate" | "daily" | "weekly" | "never"
                          )
                        }
                        className="w-full md:w-48 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="immediate">Immediately</option>
                        <option value="daily">Daily Digest</option>
                        <option value="weekly">Weekly Digest</option>
                        <option value="never">Never</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Digest Settings Tab */}
        <TabsContent value="digest" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Digest Preferences
            </h2>

            <div className="space-y-4">
              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-3">Daily Digest</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">
                      Preferred Delivery Time
                    </label>
                    <select className="w-full md:w-48 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>08:00 AM</option>
                      <option>09:00 AM</option>
                      <option>10:00 AM</option>
                      <option>12:00 PM</option>
                      <option>02:00 PM</option>
                      <option>05:00 PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">
                      Include in Daily Digest
                    </label>
                    <div className="space-y-2">
                      {[
                        { id: "daily_new_grants", label: "New grant opportunities" },
                        { id: "daily_closing_soon", label: "Grants closing soon" },
                        { id: "daily_status_updates", label: "Application status updates" },
                      ].map((item) => (
                        <div key={item.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={item.id}
                            defaultChecked
                            className="w-4 h-4 rounded border-slate-300 text-blue-600"
                          />
                          <label htmlFor={item.id} className="ml-2 text-sm text-slate-700">
                            {item.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-3">Weekly Digest</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">
                      Preferred Delivery Day
                    </label>
                    <select className="w-full md:w-48 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Monday</option>
                      <option>Tuesday</option>
                      <option>Wednesday</option>
                      <option>Thursday</option>
                      <option>Friday</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-2">
                      Include in Weekly Digest
                    </label>
                    <div className="space-y-2">
                      {[
                        { id: "weekly_community", label: "Community activity summary" },
                        { id: "weekly_recommendations", label: "Personalized recommendations" },
                        { id: "weekly_statistics", label: "Platform statistics" },
                      ].map((item) => (
                        <div key={item.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={item.id}
                            defaultChecked
                            className="w-4 h-4 rounded border-slate-300 text-blue-600"
                          />
                          <label htmlFor={item.id} className="ml-2 text-sm text-slate-700">
                            {item.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Unsubscribe Tab */}
        <TabsContent value="unsubscribe" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Unsubscribe Options
            </h2>

            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  Unsubscribing will stop all email notifications from GrantThrive. You can re-enable them anytime in
                  your preferences.
                </AlertDescription>
              </Alert>

              <div className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-3">Unsubscribe from</h3>
                <div className="space-y-3">
                  <div>
                    <Button variant="outline" className="w-full md:w-auto">
                      Unsubscribe from All Emails
                    </Button>
                    <p className="text-xs text-slate-600 mt-2">
                      You will not receive any emails from GrantThrive
                    </p>
                  </div>
                  <div>
                    <Button variant="outline" className="w-full md:w-auto">
                      Unsubscribe from Marketing Emails
                    </Button>
                    <p className="text-xs text-slate-600 mt-2">
                      You will still receive important account and application notifications
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button onClick={handleSavePreferences} size="lg">
          Save Preferences
        </Button>
        <Button variant="outline" size="lg">
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
