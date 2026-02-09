import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";

interface VotingStats {
  totalVotes: number;
  supportVotes: number;
  opposeVotes: number;
  neutralVotes: number;
  supportPercentage: number;
  opposePercentage: number;
  neutralPercentage: number;
}

interface ReportVotingSectionProps {
  title: string;
  voting: VotingStats;
  description?: string;
}

export function ReportVotingSection({
  title,
  voting,
  description,
}: ReportVotingSectionProps) {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Votes Summary */}
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="text-sm font-medium text-slate-600 mb-2">Community Votes</div>
          <div className="text-3xl font-bold text-slate-900">{voting.totalVotes}</div>
          <div className="text-xs text-slate-500 mt-1">
            {voting.totalVotes === 1 ? "vote" : "votes"} received
          </div>
        </div>

        {voting.totalVotes > 0 ? (
          <>
            {/* Support Votes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-slate-700">Support</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{voting.supportPercentage}%</div>
                  <div className="text-xs text-slate-500">{voting.supportVotes} votes</div>
                </div>
              </div>
              <Progress value={voting.supportPercentage} className="h-2 bg-green-100" />
            </div>

            {/* Oppose Votes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThumbsDown className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-slate-700">Oppose</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">{voting.opposePercentage}%</div>
                  <div className="text-xs text-slate-500">{voting.opposeVotes} votes</div>
                </div>
              </div>
              <Progress value={voting.opposePercentage} className="h-2 bg-red-100" />
            </div>

            {/* Neutral Votes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Minus className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Neutral</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-600">{voting.neutralPercentage}%</div>
                  <div className="text-xs text-slate-500">{voting.neutralVotes} votes</div>
                </div>
              </div>
              <Progress value={voting.neutralPercentage} className="h-2 bg-slate-200" />
            </div>

            {/* Engagement Insight */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <div className="text-xs font-medium text-blue-900">Community Engagement</div>
              <div className="text-sm text-blue-800 mt-1">
                {voting.supportPercentage > voting.opposePercentage
                  ? "Community shows strong support for this grant"
                  : voting.opposePercentage > voting.supportPercentage
                    ? "Community has concerns about this grant"
                    : "Community feedback is mixed on this grant"}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <div className="text-sm text-slate-600">No community votes yet</div>
            <div className="text-xs text-slate-500 mt-1">
              Community members can vote on this grant to provide feedback
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
