import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface VoteStatisticsProps {
  grantId: number;
  lgaId?: number;
  showVisibilityWarning?: boolean;
}

export function VoteStatistics({
  grantId,
  lgaId,
  showVisibilityWarning = false,
}: VoteStatisticsProps) {
  const [voteStats, setVoteStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get vote statistics
  const { data: stats, refetch } = trpc.voting.getGrantVoteStats.useQuery(
    { grantId },
    { enabled: !!grantId }
  );

  useEffect(() => {
    if (stats) {
      setVoteStats(stats);
      setIsLoading(false);
    }
  }, [stats]);

  if (isLoading || !voteStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Community Votes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading vote data...</div>
        </CardContent>
      </Card>
    );
  }

  const totalVotes = voteStats.total || 0;

  if (totalVotes === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Community Votes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            No votes yet. Be the first to vote!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Community Votes ({totalVotes})</CardTitle>
        {showVisibilityWarning && (
          <p className="text-xs text-muted-foreground mt-2">
            Vote visibility is restricted by administrator settings
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Support */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Support</span>
            </div>
            <span className="text-sm font-semibold">
              {voteStats.support} ({voteStats.supportPercentage.toFixed(1)}%)
            </span>
          </div>
          <Progress
            value={voteStats.supportPercentage}
            className="h-2"
          />
        </div>

        {/* Neutral */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Minus className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Neutral</span>
            </div>
            <span className="text-sm font-semibold">
              {voteStats.neutral} ({voteStats.neutralPercentage.toFixed(1)}%)
            </span>
          </div>
          <Progress
            value={voteStats.neutralPercentage}
            className="h-2"
          />
        </div>

        {/* Oppose */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ThumbsDown className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium">Oppose</span>
            </div>
            <span className="text-sm font-semibold">
              {voteStats.oppose} ({voteStats.opposePercentage.toFixed(1)}%)
            </span>
          </div>
          <Progress
            value={voteStats.opposePercentage}
            className="h-2"
          />
        </div>

        {/* Community Feedback */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-900">
            <strong>Community Feedback:</strong> This voting data helps councils and government
            understand which grants are most valued by the community.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
