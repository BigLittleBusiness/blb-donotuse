import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, MapPin, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function LocationGrantSearch() {
  const [showMyAreaGrants, setShowMyAreaGrants] = useState(false);

  const { data: userLocation, isLoading: locationLoading } = trpc.locations.getUserLocation.useQuery();
  const { data: grantsForMyArea, isLoading: grantsLoading } = trpc.locations.getGrantsForMyArea.useQuery(
    undefined,
    { enabled: showMyAreaGrants }
  );

  if (!userLocation && !locationLoading) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-900">Location Not Set</p>
              <p className="text-sm text-yellow-800 mt-1">
                Please set your location in your profile to see grants available in your area.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Grants Available in My Area
        </CardTitle>
        {userLocation && (
          <CardDescription>
            Showing grants available in {userLocation.name} ({userLocation.postcode})
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={() => setShowMyAreaGrants(!showMyAreaGrants)}
          variant={showMyAreaGrants ? "default" : "outline"}
          className="w-full"
          disabled={grantsLoading}
        >
          {grantsLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {showMyAreaGrants ? "Hide" : "Show"} Grants for My Area
        </Button>

        {showMyAreaGrants && grantsForMyArea && grantsForMyArea.length > 0 && (
          <div className="space-y-3">
            {grantsForMyArea.map((grant) => (
              <div
                key={grant.id}
                className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{grant.title}</h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {grant.description}
                    </p>
                  </div>
                  <Badge variant="outline">{grant.category}</Badge>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs text-gray-600">
                  <span>Budget: ${Number(grant.budget).toLocaleString()}</span>
                  {grant.closing_date && (
                    <span>
                      Closes {formatDistanceToNow(new Date(grant.closing_date), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showMyAreaGrants && grantsForMyArea?.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">No grants currently available in your area.</p>
            <p className="text-xs mt-1">Check back soon for new opportunities!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
