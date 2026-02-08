import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface GrantVotingButtonsProps {
  grantId: number;
  lgaId?: number;
  onVoteSubmitted?: () => void;
}

export function GrantVotingButtons({
  grantId,
  lgaId,
  onVoteSubmitted,
}: GrantVotingButtonsProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Get user's current vote
  const { data: userVote } = trpc.voting.getUserVote.useQuery(
    { grantId },
    { enabled: !!user }
  );

  // Submit vote mutation
  const submitVoteMutation = trpc.voting.submitVote.useMutation({
    onSuccess: () => {
      setIsLoading(false);
      onVoteSubmitted?.();
    },
    onError: (error) => {
      setIsLoading(false);
      console.error("Failed to submit vote:", error);
    },
  });

  const handleVote = async (voteType: "support" | "oppose" | "neutral") => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = "/login";
      return;
    }

    if (userVote?.vote_type === voteType) {
      // User already voted this way
      return;
    }

    setIsLoading(true);
    await submitVoteMutation.mutateAsync({
      grantId,
      voteType,
      lgaId,
    });
  };

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled
          className="text-xs"
        >
          <ThumbsUp className="w-4 h-4 mr-1" />
          Support
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled
          className="text-xs"
        >
          <Minus className="w-4 h-4 mr-1" />
          Neutral
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled
          className="text-xs"
        >
          <ThumbsDown className="w-4 h-4 mr-1" />
          Oppose
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant={userVote?.vote_type === "support" ? "default" : "outline"}
        size="sm"
        disabled={isLoading}
        onClick={() => handleVote("support")}
        className="text-xs"
        title="Support this grant"
      >
        <ThumbsUp className="w-4 h-4 mr-1" />
        Support
      </Button>
      <Button
        variant={userVote?.vote_type === "neutral" ? "default" : "outline"}
        size="sm"
        disabled={isLoading}
        onClick={() => handleVote("neutral")}
        className="text-xs"
        title="Neutral on this grant"
      >
        <Minus className="w-4 h-4 mr-1" />
        Neutral
      </Button>
      <Button
        variant={userVote?.vote_type === "oppose" ? "default" : "outline"}
        size="sm"
        disabled={isLoading}
        onClick={() => handleVote("oppose")}
        className="text-xs"
        title="Oppose this grant"
      >
        <ThumbsDown className="w-4 h-4 mr-1" />
        Oppose
      </Button>
    </div>
  );
}
