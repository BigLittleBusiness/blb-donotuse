import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportVotingSection } from "@/components/ReportVotingSection";
import { TrendingUp, Download, Share2 } from "lucide-react";

interface MonthlyReportViewProps {
  lgaId: number;
  year: number;
  month: number;
}

export function MonthlyReportView({ lgaId, year, month }: MonthlyReportViewProps) {
  const [selectedGrant, setSelectedGrant] = useState<number | null>(null);

  // Fetch the monthly report
  const { data: reportData, isLoading } = trpc.reports.getLGAMonthlyReport.useQuery({
    lgaId,
    year,
    month,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 rounded animate-pulse" />
        <div className="h-64 bg-slate-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!reportData?.success || !reportData?.report) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-red-900">Failed to load report</div>
        </CardContent>
      </Card>
    );
  }

  const report = reportData.report;
  const monthName = new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Monthly Performance Report</h1>
          <p className="text-slate-600 mt-1">
            {report.lga.lga_name} • {monthName}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600">Total Grants</div>
            <div className="text-3xl font-bold text-slate-900 mt-2">{report.totalGrants}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600">Applications</div>
            <div className="text-3xl font-bold text-slate-900 mt-2">{report.totalApplications}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600">Success Rate</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{report.successRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-600">Funding Awarded</div>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              ${(report.totalFundingAwarded / 1000).toFixed(0)}K
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Community Voting Section */}
      <ReportVotingSection
        title="Community Voting Summary"
        voting={report.communityVoting}
        description="Aggregate community feedback across all grants in this LGA for the period"
      />

      {/* Grant Details with Voting */}
      <Card>
        <CardHeader>
          <CardTitle>Grant Performance & Community Feedback</CardTitle>
          <CardDescription>Individual grant metrics including community voting data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.grantDetails.map((grant: any) => (
              <div
                key={grant.grantId}
                className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => setSelectedGrant(selectedGrant === grant.grantId ? null : grant.grantId)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{grant.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{grant.category}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900">${(grant.budget / 1000).toFixed(0)}K</div>
                    <div className="text-xs text-slate-500">Budget</div>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <div className="text-xs text-slate-600">Applications</div>
                    <div className="text-lg font-semibold text-slate-900">{grant.totalApplications}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Approved</div>
                    <div className="text-lg font-semibold text-green-600">{grant.approvedApplications}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Success Rate</div>
                    <div className="text-lg font-semibold text-slate-900">{grant.successRate}%</div>
                  </div>
                </div>

                {/* Voting Summary */}
                {grant.voting && grant.voting.totalVotes > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <span className="text-green-600 font-semibold">{grant.voting.supportPercentage}%</span>
                        <span className="text-xs text-slate-600">Support</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-600 font-semibold">{grant.voting.neutralPercentage}%</span>
                        <span className="text-xs text-slate-600">Neutral</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-red-600 font-semibold">{grant.voting.opposePercentage}%</span>
                        <span className="text-xs text-slate-600">Oppose</span>
                      </div>
                      <div className="ml-auto text-xs text-slate-500">
                        {grant.voting.totalVotes} votes
                      </div>
                    </div>
                  </div>
                )}

                {/* Expanded Details */}
                {selectedGrant === grant.grantId && grant.voting && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <ReportVotingSection
                      title="Detailed Voting Breakdown"
                      voting={grant.voting}
                      description={`Community feedback for "${grant.title}"`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Footer */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-6">
          <div className="text-sm text-slate-600">
            <p className="font-semibold mb-2">Report Generated</p>
            <p>{new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
            <p className="mt-2 text-xs">
              This report includes community voting data showing support, oppose, and neutral percentages for each grant.
              Community feedback helps inform future grant development and priorities.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
