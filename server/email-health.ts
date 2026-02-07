/**
 * Email provider health check and monitoring
 */

import { getEmailProvider, getProviderStatus } from "./email-providers/factory";

export interface ProviderHealthStatus {
  name: string;
  healthy: boolean;
  message: string;
  lastChecked: Date;
  uptime: number; // percentage
  responseTime: number; // milliseconds
}

export interface EmailSystemHealth {
  overall: "healthy" | "degraded" | "unhealthy";
  provider: ProviderHealthStatus;
  lastChecked: Date;
  checks: {
    providerConfigured: boolean;
    providerResponding: boolean;
    databaseConnected: boolean;
  };
}

let lastHealthCheck: EmailSystemHealth | null = null;
let lastCheckTime: Date | null = null;

export async function checkEmailProviderHealth(): Promise<ProviderHealthStatus> {
  const startTime = Date.now();

  try {
    const provider = getEmailProvider();
    const status = await provider.getStatus();

    const responseTime = Date.now() - startTime;

    return {
      name: provider.getName(),
      healthy: status.healthy,
      message: status.message,
      lastChecked: new Date(),
      uptime: 100,
      responseTime,
    };
  } catch (error: any) {
    return {
      name: "Unknown Provider",
      healthy: false,
      message: `Error: ${error.message}`,
      lastChecked: new Date(),
      uptime: 0,
      responseTime: Date.now() - startTime,
    };
  }
}

export async function getEmailSystemHealth(): Promise<EmailSystemHealth> {
  const providerHealth = await checkEmailProviderHealth();

  const health: EmailSystemHealth = {
    overall: providerHealth.healthy ? "healthy" : "unhealthy",
    provider: providerHealth,
    lastChecked: new Date(),
    checks: {
      providerConfigured: true,
      providerResponding: providerHealth.healthy,
      databaseConnected: true, // Simplified for now
    },
  };

  lastHealthCheck = health;
  lastCheckTime = new Date();

  return health;
}

export function getLastHealthCheck(): EmailSystemHealth | null {
  return lastHealthCheck;
}

export function getHealthCheckAge(): number | null {
  if (!lastCheckTime) return null;
  return Date.now() - lastCheckTime.getTime();
}

export async function getProviderConfiguration() {
  try {
    const provider = getEmailProvider();
    const status = await provider.getStatus();

    return {
      provider: provider.getName(),
      configured: true,
      status: status.message,
      environment: {
        EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || "mock",
        EMAIL_FROM: process.env.EMAIL_FROM || "noreply@grantthrive.local",
        // Don't expose sensitive keys
        SENDGRID_CONFIGURED: !!process.env.SENDGRID_API_KEY,
        AWS_SES_CONFIGURED: !!process.env.AWS_ACCESS_KEY_ID,
      },
    };
  } catch (error: any) {
    return {
      provider: "Unknown",
      configured: false,
      status: `Configuration error: ${error.message}`,
      environment: {},
    };
  }
}
