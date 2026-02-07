import { realtimeService, NotificationEvent } from "./realtime";
import * as db from "./db";

/**
 * Handle new application submission
 */
export async function onApplicationSubmitted(applicationId: number, userId: number, grantId: number) {
  try {
    const application = await db.getApplicationById(applicationId);
    const grant = await db.getGrantById(grantId);

    if (!application || !grant) return;

    // Notify the applicant
    realtimeService.notifyUser(userId, {
      type: "application_submitted",
      userId,
      grantId,
      applicationId,
      title: "Application Submitted",
      message: `Your application for "${grant.title}" has been submitted successfully.`,
      data: {
        grantTitle: grant.title,
        applicationId,
        status: application.status,
      },
      timestamp: new Date(),
    });

    // Notify all staff members
    realtimeService.notifyStaff({
      type: "application_submitted",
      userId,
      grantId,
      applicationId,
      title: "New Application Submitted",
      message: `A new application has been submitted for "${grant.title}".`,
      data: {
        grantTitle: grant.title,
        applicationId,
        applicantId: userId,
      },
      timestamp: new Date(),
    });

    // Notify grant watchers
    realtimeService.notifyGrantWatchers(grantId, {
      type: "application_submitted",
      userId,
      grantId,
      applicationId,
      title: "New Application",
      message: `A new application has been submitted for "${grant.title}".`,
      data: {
        grantTitle: grant.title,
        applicationId,
      },
      timestamp: new Date(),
    });

    console.log(`[Notifications] Application ${applicationId} submission notified`);
  } catch (error) {
    console.error("[Notifications] Error handling application submission:", error);
  }
}

/**
 * Handle application status change
 */
export async function onApplicationStatusChanged(
  applicationId: number,
  oldStatus: string,
  newStatus: string,
  grantId: number
) {
  try {
    const application = await db.getApplicationById(applicationId);
    const grant = await db.getGrantById(grantId);

    if (!application || !grant) return;

    const statusMessages: Record<string, string> = {
      submitted: "Your application has been received",
      under_review: "Your application is being reviewed",
      approved: "Congratulations! Your application has been approved",
      rejected: "Your application has been reviewed",
      awarded: "Your application has been selected for funding",
      completed: "The grant has been completed",
    };

    const message = statusMessages[newStatus] || `Your application status has changed to ${newStatus}`;

    // Notify the applicant
    realtimeService.notifyUser(application.applicant_id, {
      type: "status_changed",
      userId: application.applicant_id,
      grantId,
      applicationId,
      title: `Application Status Updated`,
      message: `${message} for "${grant.title}".`,
      data: {
        grantTitle: grant.title,
        applicationId,
        oldStatus,
        newStatus,
      },
      timestamp: new Date(),
    });

    // Notify staff
    realtimeService.notifyStaff({
      type: "status_changed",
      userId: application.applicant_id,
      grantId,
      applicationId,
      title: `Application Status Changed`,
      message: `Application for "${grant.title}" status changed to ${newStatus}.`,
      data: {
        grantTitle: grant.title,
        applicationId,
        oldStatus,
        newStatus,
      },
      timestamp: new Date(),
    });

    console.log(`[Notifications] Application ${applicationId} status change notified`);
  } catch (error) {
    console.error("[Notifications] Error handling status change:", error);
  }
}

/**
 * Handle review completion
 */
export async function onReviewCompleted(
  applicationId: number,
  reviewId: number,
  grantId: number,
  score: number
) {
  try {
    const application = await db.getApplicationById(applicationId);
    const grant = await db.getGrantById(grantId);

    if (!application || !grant) return;

    // Notify the applicant
    realtimeService.notifyUser(application.applicant_id, {
      type: "review_completed",
      userId: application.applicant_id,
      grantId,
      applicationId,
      title: "Application Review Completed",
      message: `Your application for "${grant.title}" has been reviewed.`,
      data: {
        grantTitle: grant.title,
        applicationId,
        reviewId,
        score,
      },
      timestamp: new Date(),
    });

    // Notify staff
    realtimeService.notifyStaff({
      type: "review_completed",
      userId: application.applicant_id,
      grantId,
      applicationId,
      title: "Review Completed",
      message: `Review completed for application to "${grant.title}" with score ${score}.`,
      data: {
        grantTitle: grant.title,
        applicationId,
        reviewId,
        score,
      },
      timestamp: new Date(),
    });

    console.log(`[Notifications] Review ${reviewId} completion notified`);
  } catch (error) {
    console.error("[Notifications] Error handling review completion:", error);
  }
}

/**
 * Handle new comment on application
 */
export async function onCommentAdded(
  applicationId: number,
  commentId: number,
  grantId: number,
  commenterName: string
) {
  try {
    const application = await db.getApplicationById(applicationId);
    const grant = await db.getGrantById(grantId);

    if (!application || !grant) return;

    // Notify the applicant if comment is from staff
    realtimeService.notifyUser(application.applicant_id, {
      type: "comment_added",
      userId: application.applicant_id,
      grantId,
      applicationId,
      title: "New Comment on Your Application",
      message: `${commenterName} commented on your application for "${grant.title}".`,
      data: {
        grantTitle: grant.title,
        applicationId,
        commentId,
        commenterName,
      },
      timestamp: new Date(),
    });

    // Notify staff
    realtimeService.notifyStaff({
      type: "comment_added",
      userId: application.applicant_id,
      grantId,
      applicationId,
      title: "New Comment",
      message: `${commenterName} commented on application for "${grant.title}".`,
      data: {
        grantTitle: grant.title,
        applicationId,
        commentId,
        commenterName,
      },
      timestamp: new Date(),
    });

    console.log(`[Notifications] Comment ${commentId} addition notified`);
  } catch (error) {
    console.error("[Notifications] Error handling comment addition:", error);
  }
}

/**
 * Handle new grant announcement
 */
export async function onGrantAnnounced(grantId: number) {
  try {
    const grant = await db.getGrantById(grantId);

    if (!grant) return;

    // Broadcast to all users
    realtimeService.broadcast({
      type: "grant_announced",
      userId: 0,
      grantId,
      title: "New Grant Available",
      message: `A new grant "${grant.title}" is now open for applications.`,
      data: {
        grantTitle: grant.title,
        grantId,
        budget: grant.budget,
        category: grant.category,
      },
      timestamp: new Date(),
    });

    console.log(`[Notifications] Grant ${grantId} announcement broadcasted`);
  } catch (error) {
    console.error("[Notifications] Error handling grant announcement:", error);
  }
}
