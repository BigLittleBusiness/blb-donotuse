import { useParams, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, FileText, User, Calendar, DollarSign } from "lucide-react";

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" onClick={() => navigate("/my-applications")} className="mb-4">
          ← Back to Applications
        </Button>
        <h1 className="text-3xl font-bold text-slate-900">Application Details</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card className="p-6">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Application Information</h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Grant</label>
                    <p className="text-lg text-slate-900">Community Center Renovation</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Requested Amount</label>
                      <p className="text-lg text-slate-900">$50,000</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Status</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <span className="text-lg text-slate-900">Under Review</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-600">Application Text</label>
                    <div className="mt-2 p-4 bg-slate-50 rounded-lg text-slate-900">
                      <p>
                        Our community center has been serving the local area for over 20 years. The building requires
                        significant renovations to ensure it remains a safe and welcoming space for all residents. This
                        grant will help us upgrade the facilities, improve accessibility, and expand our community programs.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-600">Supporting Documents</label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="text-slate-900">budget_proposal.pdf</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="text-slate-900">project_timeline.pdf</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <Card className="p-6">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Review Scores</h2>

                <div className="space-y-4">
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">Reviewer: John Smith</p>
                        <p className="text-sm text-slate-600">Staff Member</p>
                      </div>
                      <span className="text-2xl font-bold text-yellow-600">78/100</span>
                    </div>
                    <p className="text-slate-700 mb-2">
                      Strong project proposal with clear objectives. Budget is well-justified. Recommend approval with minor revisions.
                    </p>
                    <p className="text-xs text-slate-600">Reviewed on Feb 3, 2025</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">Reviewer: Sarah Johnson</p>
                        <p className="text-sm text-slate-600">Staff Member</p>
                      </div>
                      <span className="text-2xl font-bold text-green-600">85/100</span>
                    </div>
                    <p className="text-slate-700 mb-2">
                      Excellent community impact potential. Well-organized application. Meets all eligibility criteria.
                    </p>
                    <p className="text-xs text-slate-600">Reviewed on Feb 2, 2025</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card className="p-6">
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">Application Timeline</h2>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-blue-600 rounded-full mt-2"></div>
                      <div className="w-0.5 h-16 bg-slate-300"></div>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Application Submitted</p>
                      <p className="text-sm text-slate-600">Jan 15, 2025</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-blue-600 rounded-full mt-2"></div>
                      <div className="w-0.5 h-16 bg-slate-300"></div>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Under Review</p>
                      <p className="text-sm text-slate-600">Jan 20, 2025</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 bg-yellow-600 rounded-full mt-2"></div>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Awaiting Final Decision</p>
                      <p className="text-sm text-slate-600">Current Status</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-20 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-600">Application ID</p>
                  <p className="font-semibold text-slate-900">#APP-2025-001</p>
                </div>
                <div>
                  <p className="text-slate-600">Submitted</p>
                  <p className="font-semibold text-slate-900">Jan 15, 2025</p>
                </div>
                <div>
                  <p className="text-slate-600">Last Updated</p>
                  <p className="font-semibold text-slate-900">Feb 3, 2025</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-slate-900 mb-3">Average Score</h3>
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600">81.5</p>
                <p className="text-sm text-slate-600 mt-1">Out of 100</p>
              </div>
            </div>

            <div className="border-t pt-4 space-y-2">
              <Button className="w-full" disabled>
                Edit Application
              </Button>
              <Button variant="outline" className="w-full">
                Download PDF
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
