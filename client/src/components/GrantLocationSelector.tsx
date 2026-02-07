import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { X, Plus, Search } from "lucide-react";
import { toast } from "sonner";

interface GrantLocationSelectorProps {
  grantId: number;
  onLocationsUpdated?: (locations: any[]) => void;
}

export function GrantLocationSelector({ grantId, onLocationsUpdated }: GrantLocationSelectorProps) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const { data: grantLocations, refetch: refetchLocations } = trpc.locations.getGrantLocations.useQuery(
    { grantId }
  );
  const { data: searchResults } = trpc.locations.searchSuburbs.useQuery(
    { query },
    { enabled: query.length > 0 }
  );

  const addLocationMutation = trpc.locations.addGrantLocation.useMutation({
    onSuccess: () => {
      toast.success("Location added to grant");
      setQuery("");
      setShowResults(false);
      refetchLocations();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add location");
    },
  });

  const removeLocationMutation = trpc.locations.removeGrantLocation.useMutation({
    onSuccess: () => {
      toast.success("Location removed from grant");
      refetchLocations();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove location");
    },
  });

  const handleAddLocation = (suburb: any) => {
    addLocationMutation.mutate({ grantId, suburbId: suburb.id });
  };

  const handleRemoveLocation = (suburbId: number) => {
    removeLocationMutation.mutate({ grantId, suburbId });
  };

  const isLocationAlreadyAdded = (suburbId: number) => {
    return grantLocations?.some((loc) => loc.id === suburbId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grant Locations</CardTitle>
        <CardDescription>
          Select the suburbs and postcodes where this grant is available
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Locations */}
        {grantLocations && grantLocations.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Currently Available In:</label>
            <div className="flex flex-wrap gap-2">
              {grantLocations.map((location) => (
                <Badge key={location.id} variant="secondary" className="flex items-center gap-2 px-3 py-1">
                  <span>
                    {location.name} ({location.postcode})
                  </span>
                  <button
                    onClick={() => handleRemoveLocation(location.id)}
                    className="ml-1 hover:text-red-600"
                    disabled={removeLocationMutation.isPending}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Search and Add */}
        <div className="space-y-2 border-t pt-4">
          <label className="text-sm font-medium">Add Location</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search suburb or postcode..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowResults(true);
              }}
              className="pl-10"
            />
          </div>

          {showResults && searchResults && searchResults.length > 0 && (
            <div className="border rounded-lg max-h-48 overflow-y-auto">
              {searchResults.map((suburb) => {
                const isAdded = isLocationAlreadyAdded(suburb.id);
                return (
                  <div
                    key={suburb.id}
                    className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <div>
                      <div className="font-medium text-sm">{suburb.name}</div>
                      <div className="text-xs text-gray-600">
                        {suburb.postcode} • {suburb.state}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isAdded ? "outline" : "default"}
                      onClick={() => handleAddLocation(suburb)}
                      disabled={isAdded || addLocationMutation.isPending}
                    >
                      {isAdded ? (
                        <>
                          <span className="text-green-600">✓ Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 mr-1" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {showResults && query && searchResults?.length === 0 && (
            <div className="text-sm text-gray-500 py-2">No suburbs found.</div>
          )}
        </div>

        {!grantLocations || grantLocations.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            No locations added yet. Search and add suburbs above.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
