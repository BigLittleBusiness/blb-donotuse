import { ENV } from "./_core/env";

/**
 * Email template types and interfaces
 */
export type EmailTemplate =
  | "application_submitted"
  | "application_approved"
  | "application_rejected"
  | "application_under_review"
  | "grant_announcement"
  | "grant_closing_soon"
  | "community_activity_digest";

interface EmailRecipient {
  email: string;
  name?: string;
}

interface EmailContext {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Email template definitions with subject and body
 */
const emailTemplates: Record<EmailTemplate, { subject: string; body: (ctx: EmailContext) => string }> = {
  application_submitted: {
    subject: "Application Submitted Successfully",
    body: (ctx) => `
Dear ${ctx.applicant_name},

Thank you for submitting your application for the "${ctx.grant_title}" grant. We have received your submission and will review it shortly.

Application Details:
- Grant: ${ctx.grant_title}
- Application ID: ${ctx.application_id}
- Submitted: ${ctx.submitted_date}
- Requested Amount: $${ctx.requested_amount}

You will receive updates about your application status via email. You can also track your application in your dashboard.

Best regards,
GrantThrive Team
    `.trim(),
  },

  application_approved: {
    subject: "Application Approved - Grant Award",
    body: (ctx) => `
Dear ${ctx.applicant_name},

Congratulations! Your application for the "${ctx.grant_title}" grant has been approved.

Award Details:
- Grant: ${ctx.grant_title}
- Application ID: ${ctx.application_id}
- Award Amount: $${ctx.award_amount}
- Approval Date: ${ctx.approval_date}

Next Steps:
1. Review the grant agreement and conditions
2. Complete any required documentation
3. Arrange fund disbursement timing

Please contact us if you have any questions about your award.

Best regards,
GrantThrive Team
    `.trim(),
  },

  application_rejected: {
    subject: "Application Status Update",
    body: (ctx) => `
Dear ${ctx.applicant_name},

Thank you for your application for the "${ctx.grant_title}" grant. After careful review, we regret to inform you that your application was not selected for funding at this time.

Application Details:
- Grant: ${ctx.grant_title}
- Application ID: ${ctx.application_id}
- Decision Date: ${ctx.decision_date}

Feedback:
${ctx.feedback}

We encourage you to apply for future grants. Please feel free to contact us if you would like more detailed feedback on your application.

Best regards,
GrantThrive Team
    `.trim(),
  },

  application_under_review: {
    subject: "Your Application is Under Review",
    body: (ctx) => `
Dear ${ctx.applicant_name},

Your application for the "${ctx.grant_title}" grant is now under review by our assessment team.

Application Details:
- Grant: ${ctx.grant_title}
- Application ID: ${ctx.application_id}
- Review Started: ${ctx.review_date}

We aim to complete the review process within ${ctx.review_timeline} business days. You will be notified of the outcome via email.

Best regards,
GrantThrive Team
    `.trim(),
  },

  grant_announcement: {
    subject: "New Grant Opportunity: ${grant_title}",
    body: (ctx) => `
Dear Community Member,

We are excited to announce a new grant opportunity that may be of interest to you.

Grant Details:
- Title: ${ctx.grant_title}
- Total Budget: $${ctx.budget}
- Category: ${ctx.category}
- Closing Date: ${ctx.closing_date}
- Description: ${ctx.description}

Eligibility Requirements:
${ctx.eligibility}

To apply, visit our website and create an account if you haven't already. The application process is simple and straightforward.

Apply Now: ${ctx.application_url}

Best regards,
GrantThrive Team
    `.trim(),
  },

  grant_closing_soon: {
    subject: "Reminder: Grant Closing Soon - ${grant_title}",
    body: (ctx) => `
Dear Community Member,

This is a reminder that the application deadline for the "${ctx.grant_title}" grant is approaching.

Important Dates:
- Grant: ${ctx.grant_title}
- Closing Date: ${ctx.closing_date}
- Days Remaining: ${ctx.days_remaining}

If you have been considering applying for this grant, now is the time to submit your application. The application process typically takes 30-45 minutes to complete.

Apply Now: ${ctx.application_url}

Best regards,
GrantThrive Team
    `.trim(),
  },

  community_activity_digest: {
    subject: "Weekly Community Activity Digest",
    body: (ctx) => `
Dear ${ctx.user_name},

Here's a summary of community activity and grant updates from the past week.

New Grants:
${ctx.new_grants}

Active Discussions:
${ctx.active_discussions}

Recent Approvals:
${ctx.recent_approvals}

Grants Closing Soon:
${ctx.closing_soon}

Stay updated by visiting our community dashboard: ${ctx.dashboard_url}

Best regards,
GrantThrive Team
    `.trim(),
  },
};

/**
 * Email service for sending notifications
 */
export class EmailService {
  /**
   * Send an email using the configured email provider
   */
  static async sendEmail(
    to: EmailRecipient | EmailRecipient[],
    template: EmailTemplate,
    context: EmailContext
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const recipients = Array.isArray(to) ? to : [to];
      const emailTemplate = emailTemplates[template];

      if (!emailTemplate) {
        return { success: false, error: `Unknown email template: ${template}` };
      }

      // Render subject and body with context
      const subject = this.renderTemplate(emailTemplate.subject, context);
      const body = emailTemplate.body(context);

      // Send email using the configured provider
      const result = await this.sendViaProvider(recipients, subject, body);

      return result;
    } catch (error) {
      console.error("[Email Service] Error sending email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send email to multiple recipients
   */
  static async sendBulkEmail(
    recipients: EmailRecipient[],
    template: EmailTemplate,
    contexts: EmailContext[]
  ): Promise<{ success: boolean; sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < recipients.length; i++) {
      const result = await this.sendEmail(recipients[i], template, contexts[i] || {});
      if (result.success) {
        sent++;
      } else {
        failed++;
      }
    }

    return { success: failed === 0, sent, failed };
  }

  /**
   * Get available email templates
   */
  static getAvailableTemplates(): EmailTemplate[] {
    return Object.keys(emailTemplates) as EmailTemplate[];
  }

  /**
   * Preview an email template with context
   */
  static previewTemplate(template: EmailTemplate, context: EmailContext): { subject: string; body: string } | null {
    const emailTemplate = emailTemplates[template];
    if (!emailTemplate) return null;

    return {
      subject: this.renderTemplate(emailTemplate.subject, context),
      body: emailTemplate.body(context),
    };
  }

  /**
   * Render template string with context variables
   */
  private static renderTemplate(template: string, context: EmailContext): string {
    return template.replace(/\$\{(\w+)\}/g, (match, key) => {
      const value = context[key];
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Send email via configured provider (mock implementation)
   * In production, this would integrate with SendGrid, AWS SES, Mailgun, etc.
   */
  private static async sendViaProvider(
    recipients: EmailRecipient[],
    subject: string,
    body: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Mock implementation - in production, integrate with actual email service
    console.log("[Email Service] Sending email:");
    console.log(`To: ${recipients.map((r) => r.email).join(", ")}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body.substring(0, 100)}...`);

    // Simulate async email sending
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Return success with mock message ID
    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }
}

/**
 * Email notification queue for handling retries and failures
 */
export class EmailQueue {
  private queue: Array<{
    id: string;
    to: EmailRecipient[];
    template: EmailTemplate;
    context: EmailContext;
    retries: number;
    createdAt: Date;
  }> = [];

  private maxRetries = 3;
  private retryDelayMs = 5000;

  /**
   * Add email to queue
   */
  async enqueue(to: EmailRecipient | EmailRecipient[], template: EmailTemplate, context: EmailContext): Promise<string> {
    const id = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const recipients = Array.isArray(to) ? to : [to];

    this.queue.push({
      id,
      to: recipients,
      template,
      context,
      retries: 0,
      createdAt: new Date(),
    });

    // Process queue
    this.processQueue();

    return id;
  }

  /**
   * Process queued emails with retry logic
   */
  private async processQueue(): Promise<void> {
    while (this.queue.length > 0) {
      const email = this.queue[0];

      try {
        const result = await EmailService.sendEmail(email.to, email.template, email.context);

        if (result.success) {
          // Remove from queue on success
          this.queue.shift();
          console.log(`[Email Queue] Email ${email.id} sent successfully`);
        } else {
          // Retry logic
          if (email.retries < this.maxRetries) {
            email.retries++;
            console.log(`[Email Queue] Retrying email ${email.id} (attempt ${email.retries})`);
            await new Promise((resolve) => setTimeout(resolve, this.retryDelayMs));
          } else {
            // Max retries exceeded, remove from queue
            this.queue.shift();
            console.error(`[Email Queue] Email ${email.id} failed after ${this.maxRetries} retries`);
          }
        }
      } catch (error) {
        console.error(`[Email Queue] Error processing email ${email.id}:`, error);
        this.queue.shift();
      }
    }
  }

  /**
   * Get queue status
   */
  getStatus(): { pending: number; totalAttempts: number } {
    return {
      pending: this.queue.length,
      totalAttempts: this.queue.reduce((sum, email) => sum + email.retries, 0),
    };
  }
}
