import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Star, 
  Filter, 
  Search,
  ChevronRight,
  AlertCircle 
} from "lucide-react";

interface ApplicationReview {
  id: number;
  application_id: number;
  score: number;
  feedback: string;
  status: "pending" | "approved" | "rejected";
  reviewer_id: number;
  created_at: Date;
}

export default function ReviewApplications() {
  const { user } = useAuth();
  const [selectedApplication, setSelectedApplication] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("pending");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [reviewScore, setReviewScore] = useState<number>(50);
  const [reviewFeedback, setReviewFeedback] = useState<string>("");
  const [reviewStatus, setReviewStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data - would be replaced with actual API calls
  const applications = [
    {
      id: 1,
      grant_id: 1,
      grant_title: "Community Center Renovation",
      applicant_id: 1,
      applicant_name: "John Smith",
      organization: "Community Center Inc",
      requested_amount: 50000,
      application_text: "We need funding to renovate our community center...",
      status: "under_review",
      submitted_date: new Date("2025-02-01"),
      reviews_count: 1,
      average_score: 78,
    },
    {
      id: 2,
      grant_id: 1,
      grant_title: "Community Center Renovation",
      applicant_id: 2,
      applicant_name: "Sarah Johnson",
      organization: "Youth Programs Ltd",
      requested_amount: 25000,
      application_text: "Our youth program requires additional funding...",
      status: "under_review",
      submitted_date: new Date("2025-02-02"),
      reviews_count: 0,
      average_score: 0,
    },
    {
      id: 3,
      grant_id: 2,
      grant_title: "Environmental Conservation",
      applicant_id: 3,
      applicant_name: "Michael Brown",
      organization: "Green Earth Foundation",
      requested_amount: 75000,
      application_text: "Environmental project to protect local ecosystems...",
      status: "under_review",
      submitted_date: new Date("2025-01-28"),
      reviews_count: 2,
      average_score: 82,
    },
  ];

  const filteredApplications = applications.filter((app) => {
    const matchesStatus = filterStatus === "all" || app.status === filterStatus;
    const matchesSearch =
      searchTerm === "" ||
      app.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.grant_title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const selectedApp = applications.find((app) => app.id === selectedApplication);

  const handleSubmitReview = async () => {
    if (!selectedApplication) return;
    setIsSubmitting(true);
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setReviewScore(50);
      setReviewFeedback("");
      setReviewStatus("pending");
      setSelectedApplication(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  if (!user || user.role !== "staff") {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access this page. Only staff members can review applications.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Review Applications</h1>
        <p className="text-slate-600 mt-2">Review and score grant applications</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Applications List */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <div className="space-y-4">
              {/* Search and Filter */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-600" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Applications List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredApplications.length === 0 ? (
                  <p className="text-slate-600 text-center py-4">No applications found</p>
                ) : (
                  filteredApplications.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => setSelectedApplication(app.id)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                        selectedApplication === app.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate text-sm">
                            {app.applicant_name}
                          </p>
                          <p className="text-xs text-slate-600 truncate">{app.organization}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                        {app.reviews_count > 0 && (
                          <span className="text-xs font-semibold text-blue-600">
                            {app.average_score}/100
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Review Panel */}
        <div className="lg:col-span-2">
          {selectedApp ? (
            <Tabs defaultValue="details" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">Application Details</h2>

                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600">Applicant</label>
                        <p className="text-slate-900 font-semibold">{selectedApp.applicant_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">Organization</label>
                        <p className="text-slate-900 font-semibold">{selectedApp.organization}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-600">Grant</label>
                        <p className="text-slate-900 font-semibold">{selectedApp.grant_title}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">Requested Amount</label>
                        <p className="text-slate-900 font-semibold">
                          ${selectedApp.requested_amount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-600">Application Text</label>
                      <div className="mt-2 p-4 bg-slate-50 rounded-lg text-slate-900 text-sm max-h-48 overflow-y-auto">
                        {selectedApp.application_text}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <label className="text-sm font-medium text-slate-600">Submitted</label>
                        <p className="text-slate-900">
                          {selectedApp.submitted_date.toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">Reviews</label>
                        <p className="text-slate-900">{selectedApp.reviews_count} review(s)</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Review Tab */}
              <TabsContent value="review" className="space-y-4">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">Submit Review</h2>

                  <div className="space-y-4">
                    {/* Score Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-slate-700">Score</label>
                        <span className="text-2xl font-bold text-blue-600">{reviewScore}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={reviewScore}
                        onChange={(e) => setReviewScore(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-slate-600 mt-1">
                        <span>0</span>
                        <span>50</span>
                        <span>100</span>
                      </div>
                    </div>

                    {/* Score Indicators */}
                    <div className="grid grid-cols-5 gap-2">
                      {[
                        { label: "Poor", range: [0, 20], color: "bg-red-500" },
                        { label: "Fair", range: [21, 40], color: "bg-orange-500" },
                        { label: "Good", range: [41, 60], color: "bg-yellow-500" },
                        { label: "Very Good", range: [61, 80], color: "bg-blue-500" },
                        { label: "Excellent", range: [81, 100], color: "bg-green-500" },
                      ].map((indicator, idx) => (
                        <div key={idx} className="text-center">
                          <div
                            className={`h-2 rounded-full mb-1 ${
                              reviewScore >= indicator.range[0] && reviewScore <= indicator.range[1]
                                ? indicator.color
                                : "bg-slate-200"
                            }`}
                          />
                          <p className="text-xs text-slate-600">{indicator.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Feedback */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-slate-700">Feedback</label>
                        <span className="text-xs text-slate-600">
                          {reviewFeedback.length} / 1000 characters
                        </span>
                      </div>
                      <Textarea
                        placeholder="Provide detailed feedback about this application..."
                        value={reviewFeedback}
                        onChange={(e) => setReviewFeedback(e.target.value.slice(0, 1000))}
                        rows={5}
                        className="resize-none"
                      />
                    </div>

                    {/* Status Selection */}
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Recommendation
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["pending", "approved", "rejected"] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => setReviewStatus(status)}
                            className={`p-3 rounded-lg border-2 transition-colors ${
                              reviewStatus === status
                                ? "border-blue-500 bg-blue-50"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex items-center justify-center mb-1">
                              {status === "approved" && <CheckCircle className="w-5 h-5 text-green-600" />}
                              {status === "rejected" && <XCircle className="w-5 h-5 text-red-600" />}
                              {status === "pending" && <Clock className="w-5 h-5 text-yellow-600" />}
                            </div>
                            <p className="text-xs font-semibold capitalize">{status}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={handleSubmitReview}
                      disabled={isSubmitting}
                      className="w-full"
                      size="lg"
                    >
                      {isSubmitting ? "Submitting Review..." : "Submit Review"}
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-4">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">Review History</h2>

                  {selectedApp.reviews_count === 0 ? (
                    <p className="text-slate-600 text-center py-8">No reviews yet</p>
                  ) : (
                    <div className="space-y-4">
                      {[1, 2].map((idx) => (
                        <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-semibold text-slate-900">Reviewer {idx}</p>
                              <p className="text-xs text-slate-600">Staff Member</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-blue-600">78</p>
                              <p className="text-xs text-slate-600">Score</p>
                            </div>
                          </div>
                          <p className="text-slate-700 text-sm mb-2">
                            Strong application with clear objectives and realistic budget.
                          </p>
                          <p className="text-xs text-slate-600">
                            Reviewed on {new Date().toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="p-12 text-center">
              <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Select an application to review</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
