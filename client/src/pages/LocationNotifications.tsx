import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bell, MapPin, Settings, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { LocationNotificationCenter } from "@/components/LocationNotificationCenter";
import { NotificationsList } from "@/components/NotificationsList";

export default function LocationNotifications() {
  const [searchQuery, setSearchQuery] = useState("");

  // Get user's location
  const { data: userLocation } = trpc.locations.getUserLocation.useQuery();

  // Search suburbs
  const { data: suburbs } = trpc.locations.searchSuburbs.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Location-Based Notifications</h1>
          </div>
          <p className="text-gray-600">
            Stay informed about grants available in your area and nearby suburbs
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Location Card */}
            {userLocation && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Your Primary Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Suburb</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {userLocation.name || "Not set"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Postcode</p>
                      <p className="font-medium text-gray-900">{userLocation.postcode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">State</p>
                      <p className="font-medium text-gray-900">{userLocation.state}</p>
                    </div>
                  </div>

                  {userLocation.id && (
                    <LocationNotificationCenter
                      suburbId={userLocation.id}
                      suburbName={userLocation.name || "Your area"}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notifications List */}
            <NotificationsList />

            {/* How It Works */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How Location Notifications Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-semibold">
                        1
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Set Your Location</h4>
                      <p className="text-sm text-gray-600">
                        Choose your primary suburb to receive notifications about grants in your area
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-semibold">
                        2
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Configure Preferences</h4>
                      <p className="text-sm text-gray-600">
                        Choose what types of notifications you want and how often you want to receive them
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-semibold">
                        3
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Receive Updates</h4>
                      <p className="text-sm text-gray-600">
                        Get notified when new grants become available or when grant details change
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-semibold">
                        4
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Take Action</h4>
                      <p className="text-sm text-gray-600">
                        Review grants and submit applications directly from your notifications
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Add Location Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Another Location</CardTitle>
                <CardDescription>
                  Get notifications for multiple suburbs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search suburbs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                {searchQuery && suburbs && suburbs.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {suburbs.map((suburb) => (
                      <div
                        key={suburb.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{suburb.name}</p>
                            <p className="text-sm text-gray-500">
                              {suburb.postcode} {suburb.state}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery && suburbs && suburbs.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No suburbs found matching "{searchQuery}"
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Notification Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notification Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Locations Monitored</p>
                  <p className="text-2xl font-bold text-gray-900">1</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Notification Frequency</p>
                  <Badge variant="secondary">Immediate</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-gray-900 mb-1">Enable Nearby Areas</p>
                  <p className="text-gray-600">
                    Get notified about grants in suburbs within 10-50km of your location
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Set Daily Digest</p>
                  <p className="text-gray-600">
                    Receive a daily summary of new grants instead of immediate notifications
                  </p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Monitor Multiple Areas</p>
                  <p className="text-gray-600">
                    Add multiple locations to stay informed about grants across regions
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
