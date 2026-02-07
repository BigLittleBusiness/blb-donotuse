import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MapPin, Search } from "lucide-react";

interface LocationSelectorProps {
  onLocationSelected?: (suburbId: number, suburbName: string) => void;
}

export function LocationSelector({ onLocationSelected }: LocationSelectorProps) {
  const [query, setQuery] = useState("");
  const [selectedSuburb, setSelectedSuburb] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const { data: userLocation } = trpc.locations.getUserLocation.useQuery();
  const { data: searchResults } = trpc.locations.searchSuburbs.useQuery(
    { query },
    { enabled: query.length > 0 }
  );

  const setLocationMutation = trpc.locations.setUserLocation.useMutation({
    onSuccess: () => {
      toast.success("Location updated successfully");
      setQuery("");
      setShowResults(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update location");
    },
  });

  const handleSelectSuburb = (suburb: any) => {
    setSelectedSuburb(suburb);
    setLocationMutation.mutate({ suburbId: suburb.id });
    if (onLocationSelected) {
      onLocationSelected(suburb.id, suburb.name);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Your Location
        </CardTitle>
        <CardDescription>
          Select your suburb to see grants available in your area
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {userLocation && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-900">
              Current Location: <span className="font-semibold">{userLocation.name}</span>
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Postcode: {userLocation.postcode} • {userLocation.state}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Search Suburb or Postcode</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Enter suburb name or postcode (e.g., Sydney or 2000)"
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
              {searchResults.map((suburb) => (
                <button
                  key={suburb.id}
                  onClick={() => handleSelectSuburb(suburb)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0 transition-colors"
                >
                  <div className="font-medium text-sm">{suburb.name}</div>
                  <div className="text-xs text-gray-600">
                    {suburb.postcode} • {suburb.state}
                  </div>
                </button>
              ))}
            </div>
          )}

          {showResults && query && searchResults?.length === 0 && (
            <div className="text-sm text-gray-500 py-2">
              No suburbs found. Try another search.
            </div>
          )}
        </div>

        {selectedSuburb && (
          <Button
            onClick={() => handleSelectSuburb(selectedSuburb)}
            disabled={setLocationMutation.isPending}
            className="w-full"
          >
            {setLocationMutation.isPending ? "Updating..." : "Confirm Location"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
