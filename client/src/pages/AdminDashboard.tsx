import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, FileText, TrendingUp, Plus } from "lucide-react";
import { useState } from "react";

export default function AdminDashboard() {
  const [showNewGrantForm, setShowNewGrantForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-2">Manage grants, applications, and platform activity</p>
        </div>
        <Button onClick={() => setShowNewGrantForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Grant
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Grants</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">24</p>
            </div>
            <FileText className="w-10 h-10 text-blue-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Active Applications</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">156</p>
            </div>
            <Users className="w-10 h-10 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending Reviews</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">23</p>
            </div>
            <BarChart3 className="w-10 h-10 text-yellow-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Awarded</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">$2.4M</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="grants" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grants">Grants</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="grants" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Grants</h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Community Center Renovation</p>
                    <p className="text-sm text-slate-600">Category: Community | Budget: $50,000</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Applications</h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Community Center Renovation - Application</p>
                    <p className="text-sm text-slate-600">Applicant: John Doe | Requested: $50,000</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                      Under Review
                    </span>
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Pending Reviews</h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Application #APP-2025-{i.toString().padStart(3, "0")}</p>
                    <p className="text-sm text-slate-600">Submitted: 3 days ago | Grant: Community Center Renovation</p>
                  </div>
                  <Button size="sm">
                    Review Now
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Users</h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">User {i}</p>
                    <p className="text-sm text-slate-600">user{i}@example.com | Role: Community Member</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
