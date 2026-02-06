import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { toast } from "sonner";

// Validation schema
const applicationSchema = z.object({
  application_text: z
    .string()
    .min(50, "Application must be at least 50 characters")
    .max(5000, "Application cannot exceed 5000 characters"),
  requested_amount: z
    .string()
    .regex(/^\d+(\.\d{2})?$/, "Please enter a valid amount")
    .optional()
    .or(z.literal("")),
  organization_name: z
    .string()
    .min(3, "Organization name must be at least 3 characters")
    .max(255, "Organization name cannot exceed 255 characters"),
  contact_person: z
    .string()
    .min(2, "Contact person name is required")
    .max(255, "Contact person name cannot exceed 255 characters"),
  contact_email: z
    .string()
    .email("Please enter a valid email address"),
  contact_phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]+$/, "Please enter a valid phone number"),
  project_location: z
    .string()
    .min(2, "Project location is required")
    .max(255, "Project location cannot exceed 255 characters"),
  project_timeline: z
    .string()
    .min(10, "Please describe the project timeline")
    .max(500, "Project timeline cannot exceed 500 characters"),
  expected_outcomes: z
    .string()
    .min(20, "Please describe expected outcomes")
    .max(1000, "Expected outcomes cannot exceed 1000 characters"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface SupportingFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  uploadProgress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

interface ApplicationFormProps {
  grantId: number;
  grantTitle: string;
  onSubmit: (data: ApplicationFormData & { supporting_documents: File[] }) => Promise<void>;
  isSubmitting?: boolean;
}

export default function ApplicationForm({
  grantId,
  grantTitle,
  onSubmit,
  isSubmitting = false,
}: ApplicationFormProps) {
  const [files, setFiles] = useState<SupportingFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    mode: "onChange",
  });

  const applicationText = watch("application_text");
  const requestedAmount = watch("requested_amount");

  // File handling
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_FILE_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
  ];

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File size exceeds 10MB limit` };
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return { valid: false, error: `File type not allowed. Allowed: PDF, DOC, XLS, JPG, PNG` };
    }
    return { valid: true };
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    Array.from(selectedFiles).forEach((file) => {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.error}`);
        return;
      }

      const fileId = `${Date.now()}-${Math.random()}`;
      const newFile: SupportingFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        file,
        uploadProgress: 0,
        status: "pending",
      };

      setFiles((prev) => [...prev, newFile]);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const onFormSubmit = async (data: ApplicationFormData) => {
    setFormError(null);
    try {
      await onSubmit({
        ...data,
        supporting_documents: files.map((f) => f.file),
      });
      reset();
      setFiles([]);
      toast.success("Application submitted successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to submit application";
      setFormError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Apply for Grant</h2>
        <p className="text-slate-700">{grantTitle}</p>
      </Card>

      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Organization Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Organization Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Organization Name *
              </label>
              <Input
                {...register("organization_name")}
                placeholder="Enter your organization name"
                className={errors.organization_name ? "border-red-500" : ""}
              />
              {errors.organization_name && (
                <p className="text-red-600 text-sm mt-1">{errors.organization_name.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contact Person *
                </label>
                <Input
                  {...register("contact_person")}
                  placeholder="Full name"
                  className={errors.contact_person ? "border-red-500" : ""}
                />
                {errors.contact_person && (
                  <p className="text-red-600 text-sm mt-1">{errors.contact_person.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contact Email *
                </label>
                <Input
                  {...register("contact_email")}
                  type="email"
                  placeholder="email@example.com"
                  className={errors.contact_email ? "border-red-500" : ""}
                />
                {errors.contact_email && (
                  <p className="text-red-600 text-sm mt-1">{errors.contact_email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contact Phone *
              </label>
              <Input
                {...register("contact_phone")}
                placeholder="(02) 1234 5678"
                className={errors.contact_phone ? "border-red-500" : ""}
              />
              {errors.contact_phone && (
                <p className="text-red-600 text-sm mt-1">{errors.contact_phone.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Project Details */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Project Location *
              </label>
              <Input
                {...register("project_location")}
                placeholder="City, suburb, or region"
                className={errors.project_location ? "border-red-500" : ""}
              />
              {errors.project_location && (
                <p className="text-red-600 text-sm mt-1">{errors.project_location.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Requested Amount ($) *
              </label>
              <Input
                {...register("requested_amount")}
                type="number"
                step="0.01"
                placeholder="0.00"
                className={errors.requested_amount ? "border-red-500" : ""}
              />
              {errors.requested_amount && (
                <p className="text-red-600 text-sm mt-1">{errors.requested_amount.message}</p>
              )}
              {requestedAmount && (
                <p className="text-sm text-green-600 mt-1">✓ Valid amount entered</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Project Timeline *
              </label>
              <Textarea
                {...register("project_timeline")}
                placeholder="Describe the timeline for your project (start date, milestones, completion date)"
                rows={3}
                className={errors.project_timeline ? "border-red-500" : ""}
              />
              {errors.project_timeline && (
                <p className="text-red-600 text-sm mt-1">{errors.project_timeline.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Application Details */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Application Details</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Application Text *
                </label>
                <span className="text-xs text-slate-600">
                  {applicationText?.length || 0} / 5000 characters
                </span>
              </div>
              <Textarea
                {...register("application_text")}
                placeholder="Describe your project, its goals, expected outcomes, and how it aligns with the grant objectives. Be detailed and specific."
                rows={6}
                className={errors.application_text ? "border-red-500" : ""}
              />
              {errors.application_text && (
                <p className="text-red-600 text-sm mt-1">{errors.application_text.message}</p>
              )}
              {applicationText && applicationText.length >= 50 && (
                <p className="text-sm text-green-600 mt-1">✓ Minimum character requirement met</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Expected Outcomes *
              </label>
              <Textarea
                {...register("expected_outcomes")}
                placeholder="Describe the expected outcomes and benefits of your project"
                rows={4}
                className={errors.expected_outcomes ? "border-red-500" : ""}
              />
              {errors.expected_outcomes && (
                <p className="text-red-600 text-sm mt-1">{errors.expected_outcomes.message}</p>
              )}
            </div>
          </div>
        </Card>

        {/* File Upload */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Supporting Documents</h3>

          {/* Drag and Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-slate-300 bg-slate-50 hover:border-slate-400"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-900 font-medium mb-1">Drag and drop files here</p>
            <p className="text-slate-600 text-sm mb-3">or click to browse</p>
            <p className="text-xs text-slate-500">
              Supported formats: PDF, DOC, XLS, JPG, PNG (Max 10MB per file)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              className="hidden"
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6 space-y-2">
              <h4 className="text-sm font-medium text-slate-700 mb-3">
                Uploaded Files ({files.length})
              </h4>
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                      <p className="text-xs text-slate-600">{formatFileSize(file.size)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {file.status === "success" && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {file.status === "error" && (
                      <div title={file.error}>
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      </div>
                    )}
                    {file.status === "uploading" && (
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="p-1 hover:bg-slate-200 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-slate-600 mt-4">
            💡 Tip: Include supporting documents such as budget proposals, project plans, organizational credentials, and letters of support.
          </p>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="submit"
            size="lg"
            disabled={!isValid || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => {
              reset();
              setFiles([]);
              setFormError(null);
            }}
          >
            Clear Form
          </Button>
        </div>

        {/* Form Status */}
        {!isValid && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please fill in all required fields and fix any errors before submitting.
            </AlertDescription>
          </Alert>
        )}
      </form>
    </div>
  );
}
