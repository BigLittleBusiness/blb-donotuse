import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, MapPin, Target, Award } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";

export default function LocationAnalytics() {
  const [selectedSuburb, setSelectedSuburb] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: suburbs } = trpc.locations.searchSuburbs.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  const { data: locationStats } = trpc.locations.getLocationStats.useQuery({});

  // Sample data for demonstration
  const applicationRatesBySuburb = [
    { suburb: "Sydney", applications: 45, successRate: 68 },
    { suburb: "Melbourne", applications: 38, successRate: 72 },
    { suburb: "Brisbane", applications: 32, successRate: 65 },
    { suburb: "Perth", applications: 28, successRate: 70 },
    { suburb: "Adelaide", applications: 22, successRate: 75 },
    { suburb: "Hobart", applications: 15, successRate: 80 },
  ];

  const grantDistribution = [
    { name: "Infrastructure", value: 28, color: "#3b82f6" },
    { name: "Education", value: 22, color: "#10b981" },
    { name: "Healthcare", value: 18, color: "#f59e0b" },
    { name: "Arts & Culture", value: 15, color: "#8b5cf6" },
    { name: "Other", value: 17, color: "#6b7280" },
  ];

  const trendData = [
    { month: "Jan", applications: 120, approved: 85, rejected: 35 },
    { month: "Feb", applications: 135, approved: 98, rejected: 37 },
    { month: "Mar", applications: 150, approved: 110, rejected: 40 },
    { month: "Apr", applications: 145, approved: 105, rejected: 40 },
    { month: "May", applications: 160, approved: 118, rejected: 42 },
    { month: "Jun", applications: 175, approved: 132, rejected: 43 },
  ];

  const stateComparison = [
    { state: "NSW", grants: 45, applications: 320, successRate: 68 },
    { state: "VIC", grants: 38, applications: 280, successRate: 72 },
    { state: "QLD", grants: 32, applications: 220, successRate: 65 },
    { state: "WA", grants: 28, applications: 180, successRate: 70 },
    { state: "SA", grants: 22, applications: 140, successRate: 75 },
    { state: "TAS", grants: 15, applications: 85, successRate: 80 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Location-Based Analytics</h1>
          <p className="text-slate-600 mt-1">
            Analyze grant application and success rates across different suburbs and regions
          </p>
        </div>
        <MapPin className="w-8 h-8 text-blue-600" />
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Suburbs Covered</p>
                <p className="text-3xl font-bold text-slate-900">
                  {locationStats?.totalSuburbs || 156}
                </p>
              </div>
              <MapPin className="w-8 h-8 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                <p className="text-3xl font-bold text-slate-900">
                  {locationStats?.totalApplications || 1425}
                </p>
              </div>
              <Target className="w-8 h-8 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Success Rate</p>
                <p className="text-3xl font-bold text-slate-900">
                  {locationStats?.avgSuccessRate || 70}%
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Grants</p>
                <p className="text-3xl font-bold text-slate-900">
                  {locationStats?.totalGrants || 210}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Application Rates by Suburb */}
        <Card>
          <CardHeader>
            <CardTitle>Application Rates by Suburb</CardTitle>
            <CardDescription>Number of applications and success rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={applicationRatesBySuburb}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="suburb" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="applications" fill="#3b82f6" name="Applications" />
                <Bar dataKey="successRate" fill="#10b981" name="Success Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Grant Distribution by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Grant Distribution by Category</CardTitle>
            <CardDescription>Percentage of grants by category across all suburbs</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={grantDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {grantDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Application Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Application Trends Over Time</CardTitle>
          <CardDescription>Monthly applications, approvals, and rejections</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="applications" stroke="#3b82f6" name="Total Applications" />
              <Line type="monotone" dataKey="approved" stroke="#10b981" name="Approved" />
              <Line type="monotone" dataKey="rejected" stroke="#ef4444" name="Rejected" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* State Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>State-by-State Comparison</CardTitle>
          <CardDescription>Grants, applications, and success rates by state</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">State</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">Grants</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">Applications</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-900">Success Rate</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">Trend</th>
                </tr>
              </thead>
              <tbody>
                {stateComparison.map((state) => (
                  <tr key={state.state} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{state.state}</td>
                    <td className="py-3 px-4 text-right text-slate-600">{state.grants}</td>
                    <td className="py-3 px-4 text-right text-slate-600">{state.applications}</td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant="outline" className="bg-blue-50">
                        {state.successRate}%
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-green-600 text-lg">↑</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Suburb Search */}
      <Card>
        <CardHeader>
          <CardTitle>Suburb Deep Dive</CardTitle>
          <CardDescription>Search for detailed analytics on a specific suburb</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Suburb</label>
            <Input
              placeholder="Enter suburb name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {searchQuery && suburbs && suburbs.length > 0 && (
            <div className="border rounded-lg max-h-48 overflow-y-auto">
              {suburbs.map((suburb) => (
                <button
                  key={suburb.id}
                  onClick={() => setSelectedSuburb(suburb.name)}
                  className="w-full text-left px-4 py-3 border-b last:border-b-0 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-sm">{suburb.name}</div>
                  <div className="text-xs text-gray-600">
                    {suburb.postcode} • {suburb.state}
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedSuburb && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-blue-900 mb-3">{selectedSuburb} Analytics</h3>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="bg-white rounded p-3">
                  <p className="text-xs text-gray-600 mb-1">Applications</p>
                  <p className="text-2xl font-bold text-blue-600">45</p>
                </div>
                <div className="bg-white rounded p-3">
                  <p className="text-xs text-gray-600 mb-1">Approved</p>
                  <p className="text-2xl font-bold text-green-600">31</p>
                </div>
                <div className="bg-white rounded p-3">
                  <p className="text-xs text-gray-600 mb-1">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-600">69%</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
