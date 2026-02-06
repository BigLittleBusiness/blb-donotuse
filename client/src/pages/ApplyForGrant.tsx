import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ApplicationForm from "@/components/ApplicationForm";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function ApplyForGrant() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const grantId = parseInt(id || "0");

  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: grant, isLoading: grantLoading } = trpc.grants.getById.useQuery(grantId);

  const createApplicationMutation = trpc.applications.create.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign In Required</h2>
          <p className="text-slate-600 mb-6">
            You must be signed in to apply for a grant. Please sign in to your account to continue.
          </p>
          <Button onClick={() => navigate("/")} size="lg">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  if (grantLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!grant) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Grant Not Found</h2>
          <p className="text-slate-600 mb-6">The grant you're trying to apply for doesn't exist.</p>
          <Button onClick={() => navigate("/grants")} size="lg">
            Back to Grants
          </Button>
        </Card>
      </div>
    );
  }

  if (grant.status !== "open") {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Grant Not Open</h2>
          <p className="text-slate-600 mb-6">
            This grant is currently {grant.status}. You cannot submit applications at this time.
          </p>
          <Button onClick={() => navigate("/grants")} size="lg">
            Back to Grants
          </Button>
        </Card>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-12 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
          <p className="text-slate-600 mb-6">
            Your application for "{grant.title}" has been successfully submitted.
          </p>
          <p className="text-slate-600 mb-8">
            You will receive email updates about your application status. You can also track your application in your dashboard.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/my-applications")} size="lg">
              View My Applications
            </Button>
            <Button onClick={() => navigate("/grants")} variant="outline" size="lg">
              Browse More Grants
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleFormSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      // Create FormData for file upload
      const formDataWithFiles = new FormData();
      formDataWithFiles.append("grant_id", grantId.toString());
      formDataWithFiles.append("application_text", formData.application_text);
      formDataWithFiles.append("requested_amount", formData.requested_amount || "0");
      formDataWithFiles.append("organization_name", formData.organization_name);
      formDataWithFiles.append("contact_person", formData.contact_person);
      formDataWithFiles.append("contact_email", formData.contact_email);
      formDataWithFiles.append("contact_phone", formData.contact_phone);
      formDataWithFiles.append("project_location", formData.project_location);
      formDataWithFiles.append("project_timeline", formData.project_timeline);
      formDataWithFiles.append("expected_outcomes", formData.expected_outcomes);

      // Add supporting documents
      formData.supporting_documents.forEach((file: File, index: number) => {
        formDataWithFiles.append(`supporting_documents`, file);
      });

      // Submit application
      await createApplicationMutation.mutateAsync({
        grant_id: grantId,
        application_text: formData.application_text,
        requested_amount: (formData.requested_amount || "0").toString(),
      });

      setSubmitSuccess(true);
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" onClick={() => navigate(`/grants/${grantId}`)} className="mb-4">
            ← Back to Grant
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Grant Summary */}
        <Card className="p-6 mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">{grant.title}</h1>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-600">Grant Amount</p>
              <p className="text-2xl font-bold text-slate-900">${Number(grant.budget).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Category</p>
              <p className="text-2xl font-bold text-slate-900">{grant.category}</p>
            </div>
            {grant.closing_date && (
              <div>
                <p className="text-sm text-slate-600">Closing Date</p>
                <p className="text-2xl font-bold text-slate-900">
                  {new Date(grant.closing_date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Application Form */}
        <ApplicationForm
          grantId={grantId}
          grantTitle={grant.title}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
        />

        {/* Help Section */}
        <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Need Help?</h3>
          <div className="space-y-2 text-slate-700">
            <p>
              <strong>Tips for a strong application:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Be specific about your project goals and expected outcomes</li>
              <li>Provide a realistic budget and timeline</li>
              <li>Include supporting documents that demonstrate capacity and credibility</li>
              <li>Explain how your project aligns with the grant objectives</li>
              <li>Highlight the community impact and benefits</li>
            </ul>
          </div>
          <div className="mt-6 pt-6 border-t border-blue-200">
            <p className="text-slate-700 mb-3">
              <strong>Questions?</strong> Contact the grants team at{" "}
              <a href="mailto:grants@council.gov.au" className="text-blue-600 hover:text-blue-700">
                grants@council.gov.au
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
