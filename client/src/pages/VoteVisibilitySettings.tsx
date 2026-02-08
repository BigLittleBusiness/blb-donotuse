import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react";

interface VisibilitySettings {
  lgaId: number;
  lgaName: string;
  currentVisibility: "public" | "community_only" | "admin_only";
  updatedAt?: string;
}

export default function VoteVisibilitySettings() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [settings, setSettings] = useState<VisibilitySettings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLga, setSelectedLga] = useState<number | null>(null);
  const [selectedVisibility, setSelectedVisibility] = useState<"public" | "community_only" | "admin_only">("public");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Get list of LGAs - simplified list for demo
  const lgas = [
    { id: 10050, lga_name: "Albury", state: "NSW" },
    { id: 10100, lga_name: "Armidale", state: "NSW" },
    { id: 10150, lga_name: "Ballina", state: "NSW" },
  ];

  // Get current visibility settings
  const { data: currentSettings, refetch: refetchSettings } = trpc.voting.getVoteVisibilitySettings.useQuery(
    { lgaId: selectedLga || 0 },
    { enabled: !!selectedLga }
  );

  // Update visibility settings mutation
  const updateSettingsMutation = trpc.voting.updateVoteVisibilitySettings.useMutation({
    onSuccess: () => {
      setSuccessMessage("Vote visibility settings updated successfully!");
      setIsSaving(false);
      refetchSettings();
      setTimeout(() => setSuccessMessage(""), 3000);
    },
    onError: (error) => {
      setErrorMessage(`Failed to update settings: ${error.message}`);
      setIsSaving(false);
      setTimeout(() => setErrorMessage(""), 3000);
    },
  });

  // Check authorization
  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "staff")) {
      navigate("/");
    }
  }, [user, navigate]);

  // Update selected visibility when current settings change
  useEffect(() => {
    if (currentSettings) {
      setSelectedVisibility(currentSettings.visibility_level || "public");
    }
  }, [currentSettings]);

  const handleSaveSettings = async () => {
    if (!selectedLga) {
      setErrorMessage("Please select an LGA");
      return;
    }

    setIsSaving(true);
    await updateSettingsMutation.mutateAsync({
      lgaId: selectedLga,
      visibilityLevel: selectedVisibility,
    });
  };

  const visibilityOptions = [
    {
      value: "public" as const,
      label: "Public",
      description: "All users can see vote counts and results",
      icon: Eye,
    },
    {
      value: "community_only" as const,
      label: "Community Only",
      description: "Only registered community members can see vote counts",
      icon: Eye,
    },
    {
      value: "admin_only" as const,
      label: "Admin Only",
      description: "Only council staff and admins can see vote results",
      icon: Lock,
    },
  ];

  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You do not have permission to access this page. Only administrators and council staff can configure vote visibility settings.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Vote Visibility Settings</h1>
          <p className="text-slate-600">
            Configure who can see grant voting results for each LGA
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}
        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LGA Selection Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select LGA</CardTitle>
                <CardDescription>Choose an LGA to configure its vote visibility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {lgas?.map((lga: any) => (
                      <button
                        key={lga.id}
                        onClick={() => setSelectedLga(lga.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                          selectedLga === lga.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="font-medium text-slate-900">{lga.lga_name || lga.name}</div>
                        <div className="text-xs text-slate-500">{lga.state}</div>
                      </button>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Configuration */}
          <div className="lg:col-span-2">
            {selectedLga ? (
              <Card>
                <CardHeader>
                  <CardTitle>Visibility Options</CardTitle>
                  <CardDescription>
                    Choose who can see voting results for grants in this LGA
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {visibilityOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <div
                        key={option.value}
                        onClick={() => setSelectedVisibility(option.value)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedVisibility === option.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <Icon className="w-5 h-5 text-slate-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">{option.label}</h3>
                            <p className="text-sm text-slate-600 mt-1">{option.description}</p>
                          </div>
                          <input
                            type="radio"
                            name="visibility"
                            value={option.value}
                            checked={selectedVisibility === option.value}
                            onChange={() => setSelectedVisibility(option.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Current Settings Info */}
                  {currentSettings && (
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <p className="text-sm text-slate-600">
                        <strong>Current Setting:</strong> {currentSettings.visibility_level}
                        {currentSettings.updatedAt && (
                          <span className="block text-xs mt-1">
                            Last updated: {new Date(currentSettings.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Save Button */}
                  <Button
                    onClick={handleSaveSettings}
                    disabled={isSaving || selectedVisibility === currentSettings?.visibility_level}
                    className="w-full"
                    size="lg"
                  >
                    {isSaving ? "Saving..." : "Save Settings"}
                  </Button>

                  {/* Info Box */}
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Note:</strong> Community members can always see their own votes. These settings only control visibility of aggregate voting statistics.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-8 text-center">
                  <p className="text-slate-600">Select an LGA from the list to configure its vote visibility settings</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Settings Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Settings Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-slate-600">
              <p>
                <strong>Public:</strong> All visitors can see how many people support, oppose, or are neutral on each grant
              </p>
              <p>
                <strong>Community Only:</strong> Only registered users can see voting statistics, encouraging community engagement
              </p>
              <p>
                <strong>Admin Only:</strong> Only council staff and administrators can view voting data for internal decision-making
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
