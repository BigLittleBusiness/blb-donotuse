import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, Award, DollarSign } from "lucide-react";
import { Link } from "wouter";

const monthlyData = [
  { month: "Jan", awarded: 150000, applications: 45 },
  { month: "Feb", awarded: 200000, applications: 52 },
  { month: "Mar", awarded: 280000, applications: 68 },
  { month: "Apr", awarded: 220000, applications: 55 },
  { month: "May", awarded: 350000, applications: 72 },
  { month: "Jun", awarded: 420000, applications: 85 },
];

const categoryDistribution = [
  { name: "Community", value: 35, color: "#3b82f6" },
  { name: "Infrastructure", value: 25, color: "#10b981" },
  { name: "Education", value: 20, color: "#f59e0b" },
  { name: "Health", value: 12, color: "#ef4444" },
  { name: "Environment", value: 8, color: "#8b5cf6" },
];

const recentlyFunded = [
  {
    id: 1,
    title: "Community Center Renovation",
    category: "Community",
    amount: "$50,000",
    location: "Sydney",
    status: "Completed",
  },
  {
    id: 2,
    title: "Youth Program Development",
    category: "Education",
    amount: "$25,000",
    location: "Melbourne",
    status: "In Progress",
  },
  {
    id: 3,
    title: "Environmental Conservation",
    category: "Environment",
    amount: "$35,000",
    location: "Brisbane",
    status: "Completed",
  },
];

export default function PublicDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-4">Grant Transparency Dashboard</h1>
          <p className="text-xl opacity-90">
            View publicly funded grants and community impact across Australian councils
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Awarded</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">$2.4M</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Grants Funded</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">156</p>
              </div>
              <Award className="w-10 h-10 text-blue-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Community Members</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">2.3K</p>
              </div>
              <Users className="w-10 h-10 text-purple-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg. Grant Size</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">$15.4K</p>
              </div>
              <TrendingUp className="w-10 h-10 text-orange-600 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Funding Trend */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Funding Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="awarded" stroke="#3b82f6" name="Amount Awarded" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Category Distribution */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Grants by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Recently Funded Projects */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recently Funded Projects</h2>
          <div className="space-y-4">
            {recentlyFunded.map((project) => (
              <div key={project.id} className="border-l-4 border-blue-500 pl-4 py-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">{project.title}</h3>
                    <p className="text-sm text-slate-600">
                      {project.category} • {project.location}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-green-600">{project.amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    project.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {project.status}
                  </span>
                  <Link href={`/grants/${project.id}`}>
                    <a className="text-blue-600 hover:text-blue-700 text-sm font-medium">View Details →</a>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Call to Action */}
        <Card className="p-8 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Want to Apply for a Grant?</h2>
            <p className="text-slate-600 mb-6">
              Browse available grants and submit your application to help your community thrive.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/grants">
                <a>
                  <Button size="lg">Browse All Grants</Button>
                </a>
              </Link>
              <Link href="/roi-calculator">
                <a>
                  <Button size="lg" variant="outline">
                    View ROI Calculator
                  </Button>
                </a>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
