import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, XCircle, RefreshCw, Mail, TrendingUp, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function EmailProviderDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Check if user is admin
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page. Admin access required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Mock data for demonstration - in production, this would come from tRPC
  const [healthStatus] = useState({
    overall: "healthy" as const,
    provider: {
      name: "Mock Email Provider",
      healthy: true,
      message: "Provider is configured and ready",
      lastChecked: new Date(),
      uptime: 100,
      responseTime: 45,
    },
    checks: {
      providerConfigured: true,
      providerResponding: true,
      databaseConnected: true,
    },
  });

  const [deliveryStats] = useState({
    total: 1250,
    sent: 1180,
    failed: 35,
    bounced: 15,
    opened: 892,
    clicked: 234,
    pending: 5,
    successRate: 94,
    avgDeliveryTime: 156,
    providers: {
      mock: 450,
      sendgrid: 600,
      ses: 200,
    },
  });

  const [providerStats] = useState({
    mock: {
      total: 450,
      sent: 425,
      failed: 15,
      successRate: 94,
      avgDeliveryTime: 120,
    },
    sendgrid: {
      total: 600,
      sent: 570,
      failed: 15,
      successRate: 95,
      avgDeliveryTime: 180,
    },
    ses: {
      total: 200,
      sent: 185,
      failed: 5,
      successRate: 93,
      avgDeliveryTime: 150,
    },
  });

  const [configuration] = useState({
    provider: "Mock Email Provider",
    configured: true,
    status: "Provider is configured and ready",
    environment: {
      EMAIL_PROVIDER: "mock",
      EMAIL_FROM: "noreply@grantthrive.local",
      SENDGRID_CONFIGURED: false,
      AWS_SES_CONFIGURED: false,
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate refresh
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Health check completed");
    } catch (error) {
      toast.error("Failed to refresh health status");
    } finally {
      setRefreshing(false);
    }
  };

  const statusColor = healthStatus.overall === "healthy" ? "text-green-600" : "text-red-600";
  const statusIcon = healthStatus.overall === "healthy" ? <CheckCircle2 /> : <XCircle />;

  // Chart data
  const chartData = [
    { name: "Mon", sent: 180, failed: 5, opened: 120 },
    { name: "Tue", sent: 220, failed: 8, opened: 150 },
    { name: "Wed", sent: 200, failed: 6, opened: 140 },
    { name: "Thu", sent: 250, failed: 10, opened: 180 },
    { name: "Fri", sent: 210, failed: 4, opened: 160 },
    { name: "Sat", sent: 190, failed: 2, opened: 130 },
    { name: "Sun", sent: 130, failed: 0, opened: 90 },
  ];

  const providerChartData = Object.entries(providerStats).map(([name, stats]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: stats.total,
    successRate: stats.successRate,
  }));

  const statusChartData = [
    { name: "Sent", value: deliveryStats.sent, fill: "#10b981" },
    { name: "Failed", value: deliveryStats.failed, fill: "#ef4444" },
    { name: "Bounced", value: deliveryStats.bounced, fill: "#f59e0b" },
    { name: "Opened", value: deliveryStats.opened, fill: "#3b82f6" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Email Provider Dashboard</h1>
              <p className="text-slate-600 mt-1">Monitor email delivery and provider health</p>
            </div>
            <Button onClick={handleRefresh} disabled={refreshing} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Checking..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Health Status Alert */}
        <Alert className={`mb-6 border-2 ${healthStatus.overall === "healthy" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
          <div className={`flex items-center gap-3 ${statusColor}`}>
            {statusIcon}
            <div>
              <h3 className="font-semibold">System Status: {healthStatus.overall.toUpperCase()}</h3>
              <p className="text-sm mt-1">{healthStatus.provider.message}</p>
            </div>
          </div>
        </Alert>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Emails</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{deliveryStats.total.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{deliveryStats.successRate}%</div>
              <p className="text-xs text-slate-500 mt-1">{deliveryStats.sent} sent successfully</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{deliveryStats.failed}</div>
              <p className="text-xs text-slate-500 mt-1">{((deliveryStats.failed / deliveryStats.total) * 100).toFixed(1)}% failure rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Avg Delivery Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{deliveryStats.avgDeliveryTime}ms</div>
              <p className="text-xs text-slate-500 mt-1">Average response time</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="logs">Recent Logs</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Trends (7 Days)</CardTitle>
                <CardDescription>Email delivery performance over the last week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sent" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="opened" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Status Distribution</CardTitle>
                <CardDescription>Breakdown of email statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={statusChartData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Providers Tab */}
          <TabsContent value="providers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Provider Performance</CardTitle>
                <CardDescription>Statistics by email provider</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={providerChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#3b82f6" name="Total Emails" />
                    <Bar dataKey="successRate" fill="#10b981" name="Success Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(providerStats).map(([name, stats]) => (
                <Card key={name}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium capitalize">{name} Provider</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Total:</span>
                      <span className="font-semibold">{stats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Sent:</span>
                      <span className="font-semibold text-green-600">{stats.sent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Failed:</span>
                      <span className="font-semibold text-red-600">{stats.failed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Success Rate:</span>
                      <Badge variant={stats.successRate >= 95 ? "default" : "secondary"}>{stats.successRate}%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Avg Time:</span>
                      <span className="font-semibold">{stats.avgDeliveryTime}ms</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="configuration" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Configuration</CardTitle>
                <CardDescription>Email provider settings and environment variables</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Active Provider</label>
                    <p className="text-lg font-semibold text-slate-900 mt-1">{configuration.provider}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Status</label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="default">{configuration.configured ? "Configured" : "Not Configured"}</Badge>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-slate-900 mb-3">Environment Variables</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-sm font-mono">EMAIL_PROVIDER</span>
                      <Badge variant="outline">{configuration.environment.EMAIL_PROVIDER}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-sm font-mono">EMAIL_FROM</span>
                      <Badge variant="outline">{configuration.environment.EMAIL_FROM}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-sm font-mono">SENDGRID_CONFIGURED</span>
                      <Badge variant={configuration.environment.SENDGRID_CONFIGURED ? "default" : "secondary"}>
                        {configuration.environment.SENDGRID_CONFIGURED ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-sm font-mono">AWS_SES_CONFIGURED</span>
                      <Badge variant={configuration.environment.AWS_SES_CONFIGURED ? "default" : "secondary"}>
                        {configuration.environment.AWS_SES_CONFIGURED ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    To switch email providers, update the EMAIL_PROVIDER environment variable and restart the server. See EMAIL_PROVIDER_SETUP.md for detailed instructions.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Delivery Logs</CardTitle>
                <CardDescription>Latest email delivery attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">user{i}@example.com</p>
                        <p className="text-xs text-slate-500">Campaign email #{i + 1}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={i % 3 === 0 ? "default" : i % 3 === 1 ? "secondary" : "destructive"}>
                          {i % 3 === 0 ? "Sent" : i % 3 === 1 ? "Opened" : "Failed"}
                        </Badge>
                        <span className="text-xs text-slate-500">{145 + i}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
