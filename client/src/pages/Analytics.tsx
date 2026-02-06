import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, Filter } from "lucide-react";

const grantData = [
  { month: "Jan", grants: 12, applications: 45, approved: 8 },
  { month: "Feb", grants: 15, applications: 52, approved: 10 },
  { month: "Mar", grants: 18, applications: 68, approved: 14 },
  { month: "Apr", grants: 14, applications: 55, approved: 11 },
  { month: "May", grants: 20, applications: 72, approved: 16 },
  { month: "Jun", grants: 24, applications: 85, approved: 19 },
];

const categoryData = [
  { name: "Community", value: 35, color: "#3b82f6" },
  { name: "Infrastructure", value: 25, color: "#10b981" },
  { name: "Education", value: 20, color: "#f59e0b" },
  { name: "Health", value: 12, color: "#ef4444" },
  { name: "Environment", value: 8, color: "#8b5cf6" },
];

const statusData = [
  { status: "Open", count: 8, percentage: 33 },
  { status: "Closed", count: 10, percentage: 42 },
  { status: "Awarded", count: 6, percentage: 25 },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics & Reports</h1>
          <p className="text-slate-600 mt-2">Track platform metrics and grant performance</p>
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" /> Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6">
          <p className="text-sm text-slate-600">Total Grant Amount</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">$2.4M</p>
          <p className="text-xs text-green-600 mt-2">↑ 12% from last quarter</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-slate-600">Approval Rate</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">78%</p>
          <p className="text-xs text-green-600 mt-2">↑ 5% from last quarter</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-slate-600">Avg. Processing Time</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">18 days</p>
          <p className="text-xs text-red-600 mt-2">↓ 2 days from last quarter</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-slate-600">Community Engagement</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">2.3K</p>
          <p className="text-xs text-green-600 mt-2">↑ 23% from last quarter</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Grants Over Time */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Grants & Applications Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={grantData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="grants" stroke="#3b82f6" name="New Grants" />
              <Line type="monotone" dataKey="applications" stroke="#10b981" name="Applications" />
              <Line type="monotone" dataKey="approved" stroke="#f59e0b" name="Approved" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Grants by Category */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Grants by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Monthly Distribution */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Monthly Grant Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={grantData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="grants" fill="#3b82f6" name="New Grants" />
              <Bar dataKey="approved" fill="#10b981" name="Approved" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Grant Status Distribution */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Grant Status Distribution</h2>
          <div className="space-y-4">
            {statusData.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-900 font-medium">{item.status}</span>
                  <span className="text-slate-600">{item.count} grants ({item.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Detailed Reports</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: "Grant Performance Report", description: "Detailed metrics on grant distribution and outcomes" },
            { title: "Application Analysis", description: "Comprehensive analysis of application trends and approval rates" },
            { title: "Community Engagement Report", description: "Metrics on user participation and community activity" },
          ].map((report, idx) => (
            <Card key={idx} className="p-4 border hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="font-semibold text-slate-900 mb-2">{report.title}</h3>
              <p className="text-sm text-slate-600 mb-3">{report.description}</p>
              <Button variant="outline" size="sm" className="w-full">
                Generate
              </Button>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
}
