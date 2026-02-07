import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Map, MapPin, Filter, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";

export default function GrantMap() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSuburb, setSelectedSuburb] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: suburbs } = trpc.locations.searchSuburbs.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  const { data: grantsForSuburb } = trpc.locations.getGrantsBySuburb.useQuery(
    { suburbId: selectedSuburb?.id || 0 },
    { enabled: !!selectedSuburb }
  );

  const categories = [
    "Infrastructure",
    "Education",
    "Environment",
    "Healthcare",
    "Economic Development",
    "Arts & Culture",
    "Social Services",
    "Recreation",
  ];

  const filteredGrants = grantsForSuburb?.filter(
    (grant) => !selectedCategory || grant.category === selectedCategory
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Grant Distribution Map</h1>
          <p className="text-slate-600 mt-1">
            Visualize grant opportunities across Australian suburbs and postcodes
          </p>
        </div>
        <MapPin className="w-8 h-8 text-blue-600" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map and Search Panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5" />
                Interactive Grant Map
              </CardTitle>
              <CardDescription>
                Search for suburbs to view available grants and their distribution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Suburbs */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Suburb or Postcode</label>
                <Input
                  placeholder="Enter suburb name or postcode..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Suburb Results */}
              {searchQuery && suburbs && suburbs.length > 0 && (
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  {suburbs.map((suburb) => (
                    <button
                      key={suburb.id}
                      onClick={() => {
                        setSelectedSuburb(suburb);
                        setSearchQuery("");
                      }}
                      className={`w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-blue-50 transition-colors ${
                        selectedSuburb?.id === suburb.id ? "bg-blue-100" : ""
                      }`}
                    >
                      <div className="font-medium text-sm">{suburb.name}</div>
                      <div className="text-xs text-gray-600">
                        {suburb.postcode} • {suburb.state}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected Suburb Info */}
              {selectedSuburb && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-blue-900">{selectedSuburb.name}</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Postcode: {selectedSuburb.postcode} • State: {selectedSuburb.state}
                      </p>
                      {selectedSuburb.latitude && selectedSuburb.longitude && (
                        <p className="text-xs text-blue-600 mt-1">
                          Coordinates: {selectedSuburb.latitude.toFixed(4)}, {selectedSuburb.longitude.toFixed(4)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedSuburb(null)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Map Placeholder */}
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
                <Map className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <p className="text-sm text-blue-700">
                  {selectedSuburb
                    ? `Map showing ${selectedSuburb.name} and nearby grant opportunities`
                    : "Select a suburb to view on the map"}
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  Interactive map powered by Google Maps integration
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grants List Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedSuburb ? `Grants in ${selectedSuburb.name}` : "Select a Suburb"}
              </CardTitle>
              {selectedSuburb && (
                <CardDescription>
                  {filteredGrants.length} grant{filteredGrants.length !== 1 ? "s" : ""} available
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category Filter */}
              {selectedSuburb && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filter by Category
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        selectedCategory === null
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          selectedCategory === category
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Grants List */}
              {selectedSuburb && (
                <div className="border-t pt-4 space-y-3 max-h-96 overflow-y-auto">
                  {filteredGrants.length > 0 ? (
                    filteredGrants.map((grant) => (
                      <div key={grant.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium text-sm line-clamp-2">{grant.title}</h4>
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {grant.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>Category: {grant.category}</p>
                          <p>Budget: ${Number(grant.budget).toLocaleString()}</p>
                          {grant.closing_date && (
                            <p>
                              Closes:{" "}
                              {new Date(grant.closing_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No grants found in this category
                    </div>
                  )}
                </div>
              )}

              {!selectedSuburb && (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a suburb to view available grants</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Map Statistics */}
      {selectedSuburb && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Total Grants</p>
            <p className="text-2xl font-bold text-slate-900">{grantsForSuburb?.length || 0}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Open Grants</p>
            <p className="text-2xl font-bold text-green-600">
              {grantsForSuburb?.filter((g) => g.status === "open").length || 0}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Total Budget</p>
            <p className="text-2xl font-bold text-blue-600">
              ${(grantsForSuburb?.reduce((sum, g) => sum + Number(g.budget), 0) || 0).toLocaleString()}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Categories</p>
            <p className="text-2xl font-bold text-purple-600">
              {new Set(grantsForSuburb?.map((g) => g.category)).size || 0}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
