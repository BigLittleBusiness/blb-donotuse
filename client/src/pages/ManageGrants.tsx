import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GrantLocationSelector } from "@/components/GrantLocationSelector";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  Download,
  QrCode,
} from "lucide-react";

interface Grant {
  id: number;
  title: string;
  description: string;
  category: string;
  budget: number;
  status: "draft" | "open" | "closed" | "archived";
  opening_date: string;
  closing_date: string;
  created_at: string;
  applications_count: number;
  qr_code?: string;
}

export default function ManageGrants() {
  const [grants, setGrants] = useState<Grant[]>([
    {
      id: 1,
      title: "Community Center Renovation",
      description: "Funding for community center renovation and upgrades",
      category: "Infrastructure",
      budget: 100000,
      status: "open",
      opening_date: "2025-01-15",
      closing_date: "2025-03-15",
      created_at: "2025-01-01",
      applications_count: 12,
      qr_code: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=grant_1",
    },
    {
      id: 2,
      title: "Youth Programs",
      description: "Support for youth development and education programs",
      category: "Education",
      budget: 50000,
      status: "open",
      opening_date: "2025-02-01",
      closing_date: "2025-04-30",
      created_at: "2025-01-15",
      applications_count: 8,
      qr_code: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=grant_2",
    },
  ]);

  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    opening_date: "",
    closing_date: "",
  });

  const filteredGrants = grants.filter((grant) => {
    const matchesSearch = grant.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grant.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || grant.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateGrant = () => {
    setIsCreating(true);
    setSelectedGrant(null);
    setFormData({
      title: "",
      description: "",
      category: "",
      budget: "",
      opening_date: "",
      closing_date: "",
    });
  };

  const handleEditGrant = (grant: Grant) => {
    setIsCreating(false);
    setSelectedGrant(grant);
    setFormData({
      title: grant.title,
      description: grant.description,
      category: grant.category,
      budget: grant.budget.toString(),
      opening_date: grant.opening_date,
      closing_date: grant.closing_date,
    });
  };

  const handleSaveGrant = () => {
    if (!formData.title || !formData.budget) {
      alert("Please fill in all required fields");
      return;
    }

    if (isCreating) {
      const newGrant: Grant = {
        id: Math.max(...grants.map((g) => g.id), 0) + 1,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budget: parseFloat(formData.budget),
        status: "draft",
        opening_date: formData.opening_date,
        closing_date: formData.closing_date,
        created_at: new Date().toISOString().split("T")[0],
        applications_count: 0,
        qr_code: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=grant_${Math.random()}`,
      };
      setGrants([...grants, newGrant]);
    } else if (selectedGrant) {
      setGrants(
        grants.map((g) =>
          g.id === selectedGrant.id
            ? {
                ...g,
                title: formData.title,
                description: formData.description,
                category: formData.category,
                budget: parseFloat(formData.budget),
                opening_date: formData.opening_date,
                closing_date: formData.closing_date,
              }
            : g
        )
      );
    }

    setIsCreating(false);
    setSelectedGrant(null);
  };

  const handleDeleteGrant = (id: number) => {
    if (confirm("Are you sure you want to delete this grant?")) {
      setGrants(grants.filter((g) => g.id !== id));
    }
  };

  const handleChangeStatus = (id: number, newStatus: string) => {
    setGrants(
      grants.map((g) =>
        g.id === id ? { ...g, status: newStatus as Grant["status"] } : g
      )
    );
  };

  const handleBulkStatusChange = (status: string) => {
    setGrants(
      grants.map((g) =>
        filteredGrants.find((fg) => fg.id === g.id)
          ? { ...g, status: status as Grant["status"] }
          : g
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-700";
      case "closed":
        return "bg-red-100 text-red-700";
      case "draft":
        return "bg-yellow-100 text-yellow-700";
      case "archived":
        return "bg-slate-100 text-slate-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manage Grants</h1>
          <p className="text-slate-600 mt-2">Create, edit, and manage grant opportunities</p>
        </div>
        <Button onClick={handleCreateGrant} size="lg" className="gap-2">
          <Plus className="w-4 h-4" />
          New Grant
        </Button>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Grant List</TabsTrigger>
          <TabsTrigger value="form">{isCreating ? "Create Grant" : "Edit Grant"}</TabsTrigger>
        </TabsList>

        {/* Grant List Tab */}
        <TabsContent value="list" className="space-y-4">
          <Card className="p-4">
            <div className="space-y-4">
              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search grants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Bulk Actions */}
              {filteredGrants.length > 0 && (
                <div className="flex gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm text-blue-700 font-medium">Bulk Actions:</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkStatusChange("open")}
                  >
                    Open Selected
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkStatusChange("closed")}
                  >
                    Close Selected
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkStatusChange("archived")}
                  >
                    Archive Selected
                  </Button>
                </div>
              )}

              {/* Grants Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Title</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Category</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-900">Budget</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-900">Applications</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Closing</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGrants.map((grant) => (
                      <tr key={grant.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium text-slate-900">{grant.title}</td>
                        <td className="py-3 px-4 text-slate-600">{grant.category}</td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-900">
                          ${grant.budget.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={grant.status}
                            onChange={(e) => handleChangeStatus(grant.id, e.target.value)}
                            className={`px-2 py-1 rounded text-xs font-semibold border-0 ${getStatusColor(
                              grant.status
                            )}`}
                          >
                            <option value="draft">Draft</option>
                            <option value="open">Open</option>
                            <option value="closed">Closed</option>
                            <option value="archived">Archived</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-center text-slate-600">{grant.applications_count}</td>
                        <td className="py-3 px-4 text-slate-600">{grant.closing_date}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditGrant(grant)}
                              className="p-1 hover:bg-blue-100 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => window.open(grant.qr_code, "_blank")}
                              className="p-1 hover:bg-green-100 rounded transition-colors"
                              title="QR Code"
                            >
                              <QrCode className="w-4 h-4 text-green-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteGrant(grant.id)}
                              className="p-1 hover:bg-red-100 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredGrants.length === 0 && (
                <div className="text-center py-8 text-slate-600">
                  No grants found matching your criteria
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Form Tab */}
        <TabsContent value="form" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              {isCreating ? "Create New Grant" : "Edit Grant"}
            </h2>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Grant Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter grant title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category *
                  </label>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Infrastructure, Education"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter grant description"
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Budget ($) *
                  </label>
                  <Input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Opening Date
                  </label>
                  <Input
                    type="date"
                    value={formData.opening_date}
                    onChange={(e) => setFormData({ ...formData, opening_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Closing Date
                  </label>
                  <Input
                    type="date"
                    value={formData.closing_date}
                    onChange={(e) => setFormData({ ...formData, closing_date: e.target.value })}
                  />
                </div>
              </div>

              {!isCreating && selectedGrant && (
                <div className="border-t pt-6 mt-6">
                  <GrantLocationSelector grantId={selectedGrant.id} />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSaveGrant} size="lg">
                  {isCreating ? "Create Grant" : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setIsCreating(false);
                    setSelectedGrant(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-slate-600 mb-1">Total Grants</p>
          <p className="text-2xl font-bold text-slate-900">{grants.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600 mb-1">Open Grants</p>
          <p className="text-2xl font-bold text-green-600">{grants.filter((g) => g.status === "open").length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600 mb-1">Total Budget</p>
          <p className="text-2xl font-bold text-slate-900">
            ${grants.reduce((sum, g) => sum + g.budget, 0).toLocaleString()}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600 mb-1">Total Applications</p>
          <p className="text-2xl font-bold text-blue-600">
            {grants.reduce((sum, g) => sum + g.applications_count, 0)}
          </p>
        </Card>
      </div>
    </div>
  );
}
