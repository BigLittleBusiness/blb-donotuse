import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit2, Copy, Share2, Eye, EyeOff } from "lucide-react";
import FilterBuilder, { FilterCondition } from "@/components/FilterBuilder";
import { toast } from "sonner";

interface SavedFilter {
  id: number;
  name: string;
  description?: string;
  filters: FilterCondition[];
  is_public: boolean;
  is_preset: boolean;
  usage_count: number;
  createdAt: string;
}

export default function SavedFilters() {
  const { user } = useAuth();
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [presetFilters, setPresetFilters] = useState<SavedFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Simulate loading saved filters
    const mockFilters: SavedFilter[] = [
      {
        id: 1,
        name: "Open Education Grants",
        description: "All open grants in the Education category",
        filters: [
          { id: "1", field: "status", operator: "equals", value: "open", logicalOperator: "AND" },
          { id: "2", field: "category", operator: "equals", value: "Education", logicalOperator: "AND" },
        ],
        is_public: true,
        is_preset: false,
        usage_count: 15,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: "High Budget Infrastructure",
        description: "Infrastructure grants over $100,000",
        filters: [
          { id: "1", field: "category", operator: "equals", value: "Infrastructure", logicalOperator: "AND" },
          { id: "2", field: "budget_min", operator: "greater_than", value: "100000", logicalOperator: "AND" },
        ],
        is_public: false,
        is_preset: false,
        usage_count: 8,
        createdAt: new Date().toISOString(),
      },
    ];

    const mockPresets: SavedFilter[] = [
      {
        id: 101,
        name: "Closing This Month",
        description: "Grants closing within 30 days",
        filters: [
          { id: "1", field: "status", operator: "equals", value: "open", logicalOperator: "AND" },
        ],
        is_public: true,
        is_preset: true,
        usage_count: 42,
        createdAt: new Date().toISOString(),
      },
      {
        id: 102,
        name: "Recently Opened",
        description: "Grants opened in the last 7 days",
        filters: [
          { id: "1", field: "status", operator: "equals", value: "open", logicalOperator: "AND" },
        ],
        is_public: true,
        is_preset: true,
        usage_count: 28,
        createdAt: new Date().toISOString(),
      },
    ];

    setSavedFilters(mockFilters);
    setPresetFilters(mockPresets);
    setLoading(false);
  }, []);

  const handleSaveFilter = (filters: FilterCondition[]) => {
    const newFilter: SavedFilter = {
      id: Date.now(),
      name: "New Filter",
      filters,
      is_public: false,
      is_preset: false,
      usage_count: 0,
      createdAt: new Date().toISOString(),
    };
    setSavedFilters([...savedFilters, newFilter]);
    toast.success("Filter saved successfully!");
  };

  const handleDeleteFilter = (id: number) => {
    setSavedFilters(savedFilters.filter((f) => f.id !== id));
    toast.success("Filter deleted");
  };

  const handleTogglePublic = (id: number) => {
    setSavedFilters(
      savedFilters.map((f) =>
        f.id === id ? { ...f, is_public: !f.is_public } : f
      )
    );
  };

  const handleDuplicateFilter = (filter: SavedFilter) => {
    const duplicate: SavedFilter = {
      ...filter,
      id: Date.now(),
      name: `${filter.name} (Copy)`,
      usage_count: 0,
    };
    setSavedFilters([...savedFilters, duplicate]);
    toast.success("Filter duplicated!");
  };

  const filteredSavedFilters = savedFilters.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-6">Loading filters...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Filter Management</h1>
        <p className="text-gray-600">Create, save, and manage complex filter combinations for grant data</p>
      </div>

      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Build Filter</TabsTrigger>
          <TabsTrigger value="saved">My Filters ({savedFilters.length})</TabsTrigger>
          <TabsTrigger value="presets">Presets ({presetFilters.length})</TabsTrigger>
        </TabsList>

        {/* Filter Builder Tab */}
        <TabsContent value="builder" className="space-y-4">
          <FilterBuilder onSave={handleSaveFilter} />
        </TabsContent>

        {/* Saved Filters Tab */}
        <TabsContent value="saved" className="space-y-4">
          <div className="mb-4">
            <Input
              placeholder="Search filters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="grid gap-4">
            {filteredSavedFilters.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-600">No saved filters yet. Create one using the builder!</p>
              </Card>
            ) : (
              filteredSavedFilters.map((filter) => (
                <Card key={filter.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{filter.name}</h3>
                        {filter.is_public && <Badge variant="secondary">Public</Badge>}
                      </div>
                      {filter.description && (
                        <p className="text-sm text-gray-600 mb-2">{filter.description}</p>
                      )}
                      <div className="text-xs text-gray-500">
                        Used {filter.usage_count} times • {filter.filters.length} conditions
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePublic(filter.id)}
                        title={filter.is_public ? "Make private" : "Make public"}
                      >
                        {filter.is_public ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicateFilter(filter)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingId(filter.id)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFilter(filter.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Presets Tab */}
        <TabsContent value="presets" className="space-y-4">
          <div className="grid gap-4">
            {presetFilters.map((filter) => (
              <Card key={filter.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{filter.name}</h3>
                      <Badge>Preset</Badge>
                    </div>
                    {filter.description && (
                      <p className="text-sm text-gray-600 mb-2">{filter.description}</p>
                    )}
                    <div className="text-xs text-gray-500">
                      Used {filter.usage_count} times • {filter.filters.length} conditions
                    </div>
                  </div>
                  <Button variant="default" size="sm">
                    Use Filter
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
