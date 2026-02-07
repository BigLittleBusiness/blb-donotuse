/**
 * Scheduled Jobs Handler
 * 
 * This module manages scheduled tasks for the GrantThrive platform.
 * It uses a cron-like scheduling system to execute jobs at specific times.
 * 
 * Jobs:
 * - Monthly report generation (1st of each month at 2:00 AM UTC)
 * - Report delivery to LGA admins
 * - Notification cleanup
 */

import { generateMonthlyReports } from "./jobs/report-generation";

/**
 * Job configuration
 */
export interface ScheduledJob {
  name: string;
  cronExpression: string;
  handler: () => Promise<any>;
  enabled: boolean;
}

/**
 * List of scheduled jobs
 */
export const scheduledJobs: ScheduledJob[] = [
  {
    name: "monthly-report-generation",
    cronExpression: "0 2 1 * * *", // 2:00 AM UTC on the 1st of each month
    handler: generateMonthlyReports,
    enabled: true,
  },
];

/**
 * Initialize scheduled jobs
 * This should be called when the server starts
 */
export function initializeScheduledJobs() {
  console.log("[Scheduled Jobs] Initializing scheduled jobs...");

  for (const job of scheduledJobs) {
    if (!job.enabled) {
      console.log(`[Scheduled Jobs] Job '${job.name}' is disabled`);
      continue;
    }

    console.log(`[Scheduled Jobs] Registering job '${job.name}' with cron: ${job.cronExpression}`);
    // TODO: Integrate with actual cron scheduling library (e.g., node-cron)
    // For now, this is a placeholder
  }

  console.log("[Scheduled Jobs] Scheduled jobs initialized");
}

/**
 * Execute a scheduled job immediately (for testing)
 */
export async function executeJobNow(jobName: string) {
  const job = scheduledJobs.find((j) => j.name === jobName);

  if (!job) {
    console.error(`[Scheduled Jobs] Job '${jobName}' not found`);
    return { success: false, error: "Job not found" };
  }

  console.log(`[Scheduled Jobs] Executing job '${jobName}' immediately...`);

  try {
    const result = await job.handler();
    console.log(`[Scheduled Jobs] Job '${jobName}' completed:`, result);
    return { success: true, result };
  } catch (error) {
    console.error(`[Scheduled Jobs] Job '${jobName}' failed:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get job status
 */
export function getJobStatus(jobName: string) {
  const job = scheduledJobs.find((j) => j.name === jobName);

  if (!job) {
    return { success: false, error: "Job not found" };
  }

  return {
    success: true,
    job: {
      name: job.name,
      cronExpression: job.cronExpression,
      enabled: job.enabled,
    },
  };
}

/**
 * Get all jobs status
 */
export function getAllJobsStatus() {
  return {
    success: true,
    jobs: scheduledJobs.map((job) => ({
      name: job.name,
      cronExpression: job.cronExpression,
      enabled: job.enabled,
    })),
  };
}
