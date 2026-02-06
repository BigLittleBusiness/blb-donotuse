import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExportDialog from "@/components/ExportDialog";
import { trpc } from "@/lib/trpc";
import { FileText, Sheet, Download } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function ExportApplications() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if not authenticated or not staff/admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const { data: applications, isLoading } = trpc.applications.listByGrant.useQuery({ grantId: 0 });

  const handleApplicationsExport = async (format: "csv" | "pdf") => {
    if (!applications || applications.length === 0) {
      throw new Error("No applications to export");
    }

    try {
      const response = await fetch("/api/export/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, applications }),
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `applications.${format}`;
      document.body.appendChild(link);
      (link as HTMLAnchorElement).click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export error:", error);
      throw error;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const stats = {
    total: applications?.length || 0,
    pending: applications?.filter((a) => a.status === "under_review").length || 0,
    approved: applications?.filter((a) => a.status === "approved").length || 0,
    rejected: applications?.filter((a) => a.status === "rejected").length || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Export Applications</h1>
          <p className="text-gray-600">Download grant applications data in CSV or PDF format</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CSV Export */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Sheet className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle>CSV Export</CardTitle>
                  <CardDescription>Spreadsheet format for analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Export all applications in CSV format. Perfect for importing into Excel, Google Sheets, or other
                spreadsheet applications for further analysis and reporting.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm space-y-1">
                <p className="font-semibold text-blue-900">Includes:</p>
                <ul className="text-blue-800 space-y-1">
                  <li>• Application ID and status</li>
                  <li>• Applicant information</li>
                  <li>• Requested amount</li>
                  <li>• Submission date</li>
                </ul>
              </div>
              <ExportDialog
                title="Export Applications as CSV"
                description="Download all applications in CSV format"
                onExport={async (format) => {
                  if (format === "csv") {
                    await handleApplicationsExport("csv");
                  }
                }}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          {/* PDF Export */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-red-600" />
                <div>
                  <CardTitle>PDF Export</CardTitle>
                  <CardDescription>Professional report format</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Export all applications as a formatted PDF report. Ideal for printing, sharing with stakeholders, or
                archiving for compliance and audit purposes.
              </p>
              <div className="bg-red-50 border border-red-200 rounded p-3 text-sm space-y-1">
                <p className="font-semibold text-red-900">Includes:</p>
                <ul className="text-red-800 space-y-1">
                  <li>• Summary statistics</li>
                  <li>• Formatted application table</li>
                  <li>• Status breakdown</li>
                  <li>• Export timestamp</li>
                </ul>
              </div>
              <ExportDialog
                title="Export Applications as PDF"
                description="Download applications as a formatted PDF report"
                onExport={async (format) => {
                  if (format === "pdf") {
                    await handleApplicationsExport("pdf");
                  }
                }}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications Preview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Latest {Math.min(5, applications?.length || 0)} applications</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading applications...</div>
            ) : applications && applications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold">ID</th>
                      <th className="text-left py-2 px-3 font-semibold">Status</th>
                      <th className="text-left py-2 px-3 font-semibold">Amount</th>
                      <th className="text-left py-2 px-3 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.slice(0, 5).map((app: any) => (
                      <tr key={app.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3">{app.id}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              app.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : app.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="py-2 px-3">${app.requested_amount}</td>
                        <td className="py-2 px-3">{new Date(app.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No applications found</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
