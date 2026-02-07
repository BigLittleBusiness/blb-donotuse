import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Mail, Users, Settings } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const GRANT_CATEGORIES = [
  "Infrastructure",
  "Education",
  "Environment",
  "Healthcare",
  "Economic Development",
  "Arts & Culture",
  "Social Services",
  "Recreation",
];

const APPLICATION_STATUSES = [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "withdrawn",
];

const USER_ROLES = ["user", "admin", "staff"];

export default function CampaignBuilder() {
  const [step, setStep] = useState<"details" | "targeting" | "preview" | "schedule">("details");
  const [campaign, setCampaign] = useState({
    name: "",
    subject: "",
    content: "",
    template_type: "custom",
    target_type: "all_users",
    target_categories: [] as string[],
    target_statuses: [] as string[],
    target_roles: [] as string[],
    scheduled_at: "",
  });

  const [recipientCount, setRecipientCount] = useState(0);
  const [previewContent, setPreviewContent] = useState("");

  const createCampaignMutation = trpc.campaigns.create.useMutation({
    onSuccess: () => {
      toast.success("Campaign created successfully!");
      setCampaign({
        name: "",
        subject: "",
        content: "",
        template_type: "custom",
        target_type: "all_users",
        target_categories: [],
        target_statuses: [],
        target_roles: [],
        scheduled_at: "",
      });
      setStep("details");
    },
    onError: (error: any) => {
      toast.error(`Failed to create campaign: ${error.message}`);
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setCampaign((prev) => ({ ...prev, [field]: value }));
  };

  const toggleMultiSelect = (field: string, value: string) => {
    setCampaign((prev) => {
      const current = prev[field as keyof typeof campaign] as string[];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter((v) => v !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const handleCreateCampaign = async () => {
    if (!campaign.name || !campaign.subject || !campaign.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    const scheduledDate = campaign.scheduled_at ? new Date(campaign.scheduled_at) : null;

    createCampaignMutation.mutate({
      name: campaign.name,
      subject: campaign.subject,
      content: campaign.content,
      template_type: campaign.template_type as any,
      target_type: campaign.target_type as any,
      target_categories: campaign.target_categories.length > 0 ? campaign.target_categories : null,
      target_statuses: campaign.target_statuses.length > 0 ? campaign.target_statuses : null,
      target_roles: campaign.target_roles.length > 0 ? campaign.target_roles : null,
      target_user_ids: null,
      status: scheduledDate ? "scheduled" : "draft",
      scheduled_at: scheduledDate,
    });
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Email Campaign</h1>
        <p className="text-gray-600">Send targeted emails to user groups based on criteria</p>
      </div>

      <Tabs value={step} onValueChange={(v) => setStep(v as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="targeting">Targeting</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        {/* Step 1: Campaign Details */}
        <TabsContent value="details" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Campaign Details
            </h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Campaign Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Q1 Grant Reminder"
                  value={campaign.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="subject">Email Subject *</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Don't Miss Our Latest Grant Opportunities"
                  value={campaign.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="template">Template Type</Label>
                <Select value={campaign.template_type} onValueChange={(v) => handleInputChange("template_type", v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content">Email Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Write your email content here..."
                  value={campaign.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  rows={8}
                  className="mt-1 font-mono text-sm"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setStep("targeting")}>
                  Next: Targeting
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Step 2: Targeting */}
        <TabsContent value="targeting" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Target Audience
            </h2>

            <div className="space-y-6">
              <div>
                <Label htmlFor="target-type">Target Type</Label>
                <Select value={campaign.target_type} onValueChange={(v) => handleInputChange("target_type", v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_users">All Users</SelectItem>
                    <SelectItem value="by_grant_category">By Grant Category</SelectItem>
                    <SelectItem value="by_application_status">By Application Status</SelectItem>
                    <SelectItem value="by_user_role">By User Role</SelectItem>
                    <SelectItem value="custom_list">Custom User List</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {campaign.target_type === "by_grant_category" && (
                <div>
                  <Label>Select Categories</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {GRANT_CATEGORIES.map((cat) => (
                      <div key={cat} className="flex items-center space-x-2">
                        <Checkbox
                          id={`cat-${cat}`}
                          checked={campaign.target_categories.includes(cat)}
                          onCheckedChange={() => toggleMultiSelect("target_categories", cat)}
                        />
                        <Label htmlFor={`cat-${cat}`} className="font-normal cursor-pointer">
                          {cat}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {campaign.target_type === "by_application_status" && (
                <div>
                  <Label>Select Statuses</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {APPLICATION_STATUSES.map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status}`}
                          checked={campaign.target_statuses.includes(status)}
                          onCheckedChange={() => toggleMultiSelect("target_statuses", status)}
                        />
                        <Label htmlFor={`status-${status}`} className="font-normal cursor-pointer capitalize">
                          {status.replace("_", " ")}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {campaign.target_type === "by_user_role" && (
                <div>
                  <Label>Select Roles</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {USER_ROLES.map((role) => (
                      <div key={role} className="flex items-center space-x-2">
                        <Checkbox
                          id={`role-${role}`}
                          checked={campaign.target_roles.includes(role)}
                          onCheckedChange={() => toggleMultiSelect("target_roles", role)}
                        />
                        <Label htmlFor={`role-${role}`} className="font-normal cursor-pointer capitalize">
                          {role}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Estimated Recipients: {recipientCount}</p>
                  <p>Recipients will be calculated based on your targeting criteria.</p>
                </div>
              </div>

              <div className="flex justify-between gap-2">
                <Button variant="outline" onClick={() => setStep("details")}>
                  Back
                </Button>
                <Button onClick={() => setStep("preview")}>
                  Next: Preview
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Step 3: Preview */}
        <TabsContent value="preview" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Email Preview</h2>

            <div className="bg-gray-50 border rounded-lg p-6 space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Subject</p>
                <p className="text-lg font-semibold">{campaign.subject}</p>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Content</p>
                <div className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                  {campaign.content}
                </div>
              </div>
            </div>

            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>Ready to send?</strong> This campaign will be sent to {recipientCount} recipients.
              </p>
            </div>

            <div className="flex justify-between gap-2 mt-6">
              <Button variant="outline" onClick={() => setStep("targeting")}>
                Back
              </Button>
              <Button onClick={() => setStep("schedule")}>
                Next: Schedule
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Step 4: Schedule */}
        <TabsContent value="schedule" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Schedule & Send
            </h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="scheduled-at">Schedule Sending (Optional)</Label>
                <Input
                  id="scheduled-at"
                  type="datetime-local"
                  value={campaign.scheduled_at}
                  onChange={(e) => handleInputChange("scheduled_at", e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to send immediately
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Campaign Summary:</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Name: {campaign.name}</li>
                  <li>• Recipients: {recipientCount}</li>
                  <li>• Status: {campaign.scheduled_at ? "Scheduled" : "Send Immediately"}</li>
                </ul>
              </div>

              <div className="flex justify-between gap-2">
                <Button variant="outline" onClick={() => setStep("preview")}>
                  Back
                </Button>
                <Button
                  onClick={handleCreateCampaign}
                  disabled={createCampaignMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
