import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, FileText, CheckCircle, Clock, XCircle } from "lucide-react";
import { Link } from "wouter";

export default function Applications() {
  const { user } = useAuth();

  // This would need to be implemented in the backend to fetch user's applications
  const { data: applications, isLoading } = trpc.applications.listByGrant.useQuery(
    { grantId: 0 }, // Placeholder - would need a dedicated endpoint
    { enabled: false }
  );

  const statuses = ["submitted", "under_review", "approved", "rejected"];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "under_review":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <FileText className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "under_review":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Applications</h1>
        <p className="text-slate-600 mt-2">Track and manage your grant applications</p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Applications</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="under_review">Under Review</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        {["all", ...statuses].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} className="h-32" />)
            ) : (
              <div className="space-y-4">
                {/* Placeholder applications - would be populated from API */}
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">Community Center Renovation</h3>
                      <p className="text-sm text-slate-600 mt-1">Grant ID: #GR-2025-001</p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor("under_review")}`}>
                      {getStatusIcon("under_review")}
                      <span>Under Review</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-slate-600">Requested Amount</p>
                      <p className="font-semibold text-slate-900">$50,000</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Submitted Date</p>
                      <p className="font-semibold text-slate-900">Jan 15, 2025</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Last Updated</p>
                      <p className="font-semibold text-slate-900">Feb 3, 2025</p>
                    </div>
                  </div>

                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">Youth Program Development</h3>
                      <p className="text-sm text-slate-600 mt-1">Grant ID: #GR-2025-002</p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor("approved")}`}>
                      {getStatusIcon("approved")}
                      <span>Approved</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-slate-600">Requested Amount</p>
                      <p className="font-semibold text-slate-900">$25,000</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Submitted Date</p>
                      <p className="font-semibold text-slate-900">Dec 10, 2024</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Approved Date</p>
                      <p className="font-semibold text-slate-900">Jan 28, 2025</p>
                    </div>
                  </div>

                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">Environmental Conservation Project</h3>
                      <p className="text-sm text-slate-600 mt-1">Grant ID: #GR-2025-003</p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor("rejected")}`}>
                      {getStatusIcon("rejected")}
                      <span>Rejected</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-slate-600">Requested Amount</p>
                      <p className="font-semibold text-slate-900">$75,000</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Submitted Date</p>
                      <p className="font-semibold text-slate-900">Nov 20, 2024</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Rejected Date</p>
                      <p className="font-semibold text-slate-900">Jan 10, 2025</p>
                    </div>
                  </div>

                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Card>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
