import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ExportDialog from "@/components/ExportDialog";
import { trpc } from "@/lib/trpc";
import { FileText, Sheet } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { toast } from "sonner";

export default function ExportReviews() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if not authenticated or not staff/admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Mock data for reviews - in production, this would come from an API
  const mockReviews = [
    {
      id: 1,
      application_id: 1,
      reviewer_id: 2,
      score: "85",
      comments: "Strong application with clear objectives",
      recommendation: "approve",
      createdAt: new Date(),
    },
    {
      id: 2,
      application_id: 2,
      reviewer_id: 3,
      score: "72",
      comments: "Good proposal but needs more detail on budget",
      recommendation: "needs_revision",
      createdAt: new Date(),
    },
    {
      id: 3,
      application_id: 3,
      reviewer_id: 2,
      score: "45",
      comments: "Does not meet eligibility criteria",
      recommendation: "reject",
      createdAt: new Date(),
    },
  ];

  const handleReviewsExport = async (format: "csv" | "pdf") => {
    try {
      const response = await fetch("/api/export/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, reviews: mockReviews }),
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reviews.${format}`;
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
    total: mockReviews.length,
    approved: mockReviews.filter((r) => r.recommendation === "approve").length,
    needsRevision: mockReviews.filter((r) => r.recommendation === "needs_revision").length,
    rejected: mockReviews.filter((r) => r.recommendation === "reject").length,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Export Reviews</h1>
          <p className="text-gray-600">Download application reviews data in CSV or PDF format</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
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
              <CardTitle className="text-sm font-medium text-gray-600">Needs Revision</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.needsRevision}</div>
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
                Export all reviews in CSV format. Perfect for importing into Excel, Google Sheets, or other
                spreadsheet applications for analysis and reporting.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm space-y-1">
                <p className="font-semibold text-blue-900">Includes:</p>
                <ul className="text-blue-800 space-y-1">
                  <li>• Review ID and application reference</li>
                  <li>• Reviewer information</li>
                  <li>• Score and recommendation</li>
                  <li>• Comments and review date</li>
                </ul>
              </div>
              <ExportDialog
                title="Export Reviews as CSV"
                description="Download all reviews in CSV format"
                onExport={async (format) => {
                  if (format === "csv") {
                    await handleReviewsExport("csv");
                  }
                }}
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
                Export all reviews as a formatted PDF report. Ideal for printing, sharing with stakeholders, or
                archiving for compliance and audit purposes.
              </p>
              <div className="bg-red-50 border border-red-200 rounded p-3 text-sm space-y-1">
                <p className="font-semibold text-red-900">Includes:</p>
                <ul className="text-red-800 space-y-1">
                  <li>• Summary statistics by recommendation</li>
                  <li>• Formatted review table</li>
                  <li>• Average scores</li>
                  <li>• Export timestamp</li>
                </ul>
              </div>
              <ExportDialog
                title="Export Reviews as PDF"
                description="Download reviews as a formatted PDF report"
                onExport={async (format) => {
                  if (format === "pdf") {
                    await handleReviewsExport("pdf");
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Recent Reviews Preview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>Latest {Math.min(5, mockReviews.length)} reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-3 font-semibold">ID</th>
                    <th className="text-left py-2 px-3 font-semibold">Score</th>
                    <th className="text-left py-2 px-3 font-semibold">Recommendation</th>
                    <th className="text-left py-2 px-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mockReviews.slice(0, 5).map((review: any) => (
                    <tr key={review.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">{review.id}</td>
                      <td className="py-2 px-3">{review.score}/100</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            review.recommendation === "approve"
                              ? "bg-green-100 text-green-800"
                              : review.recommendation === "reject"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {review.recommendation === "approve"
                            ? "Approved"
                            : review.recommendation === "reject"
                              ? "Rejected"
                              : "Needs Revision"}
                        </span>
                      </td>
                      <td className="py-2 px-3">{new Date(review.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
