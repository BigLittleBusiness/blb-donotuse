import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, DollarSign, FileText, Heart, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";

export default function GrantDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const grantId = parseInt(id || "0");

  const { data: grant, isLoading: grantLoading } = trpc.grants.getById.useQuery(grantId);
  const { data: comments } = trpc.community.getComments.useQuery(grantId);
  const { data: votes } = trpc.community.getVotes.useQuery(grantId);
  const { data: posts } = trpc.community.getPosts.useQuery(grantId);

  const voteMutation = trpc.community.vote.useMutation();
  const commentMutation = trpc.community.comment.useMutation();
  const watchMutation = trpc.community.watchGrant.useMutation();

  const [commentText, setCommentText] = useState("");

  const handleVote = (voteType: "support" | "oppose" | "neutral") => {
    voteMutation.mutate({ grant_id: grantId, vote_type: voteType });
  };

  const handleComment = () => {
    if (commentText.trim()) {
      commentMutation.mutate({ grant_id: grantId, content: commentText });
      setCommentText("");
    }
  };

  const handleWatch = () => {
    watchMutation.mutate(grantId);
  };

  if (grantLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!grant) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 text-center">
          <p className="text-slate-600 mb-4">Grant not found</p>
          <Button onClick={() => navigate("/grants")}>Back to Grants</Button>
        </Card>
      </div>
    );
  }

  const supportVotes = votes?.filter((v) => v.vote_type === "support").length || 0;
  const opposeVotes = votes?.filter((v) => v.vote_type === "oppose").length || 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" onClick={() => navigate("/grants")} className="mb-4">
            ← Back to Grants
          </Button>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{grant.title}</h1>
          <div className="flex flex-wrap gap-4 items-center">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
              {grant.status}
            </span>
            <span className="text-slate-600">{grant.category}</span>
            {grant.closing_date && (
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4" />
                <span>Closes: {new Date(grant.closing_date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
                <TabsTrigger value="community">Community ({comments?.length || 0})</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-2xl font-semibold text-slate-900 mb-4">Grant Details</h2>
                  <p className="text-slate-600 mb-6 whitespace-pre-wrap">{grant.description}</p>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-slate-600">Grant Amount</span>
                      </div>
                      <p className="text-3xl font-bold text-blue-600">${Number(grant.budget).toLocaleString()}</p>
                    </div>
                    {grant.max_applications && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-slate-600">Max Applications</span>
                        </div>
                        <p className="text-3xl font-bold text-green-600">{grant.max_applications}</p>
                      </div>
                    )}
                  </div>

                  {grant.application_requirements && (
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-slate-900 mb-2">Application Requirements</h3>
                      <p className="text-slate-600 whitespace-pre-wrap">{grant.application_requirements}</p>
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="eligibility" className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-2xl font-semibold text-slate-900 mb-4">Eligibility Criteria</h2>
                  {grant.eligibility_criteria ? (
                    <p className="text-slate-600 whitespace-pre-wrap">{grant.eligibility_criteria}</p>
                  ) : (
                    <p className="text-slate-600">No specific eligibility criteria provided.</p>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="community" className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-2xl font-semibold text-slate-900 mb-4">Community Discussion</h2>

                  {user && (
                    <div className="mb-6 pb-6 border-b">
                      <textarea
                        placeholder="Share your thoughts about this grant..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                        rows={3}
                      />
                      <Button onClick={handleComment} disabled={!commentText.trim()}>
                        Post Comment
                      </Button>
                    </div>
                  )}

                  <div className="space-y-4">
                    {comments && comments.length > 0 ? (
                      comments.map((comment) => (
                        <div key={comment.id} className="bg-slate-50 p-4 rounded-lg">
                          <p className="text-sm text-slate-600 mb-2">User #{comment.user_id}</p>
                          <p className="text-slate-900">{comment.content}</p>
                          <p className="text-xs text-slate-500 mt-2">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-600 text-center py-8">No comments yet. Be the first to share!</p>
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-20 space-y-4">
              {user ? (
                <>
                  <Button className="w-full" size="lg">
                    Apply for Grant
                  </Button>
                  <Button variant="outline" className="w-full" onClick={handleWatch}>
                    <Heart className="w-4 h-4 mr-2" /> Watch Grant
                  </Button>
                </>
              ) : (
                <Button className="w-full" size="lg">
                  Sign In to Apply
                </Button>
              )}

              <div className="border-t pt-4">
                <h3 className="font-semibold text-slate-900 mb-3">Community Support</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Support</span>
                    <span className="font-bold text-green-600">{supportVotes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Oppose</span>
                    <span className="font-bold text-red-600">{opposeVotes}</span>
                  </div>
                </div>

                {user && (
                  <div className="mt-4 space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleVote("support")}
                    >
                      👍 Support
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleVote("oppose")}
                    >
                      👎 Oppose
                    </Button>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-slate-900 mb-3">Share</h3>
                <Button variant="outline" className="w-full" size="sm">
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
