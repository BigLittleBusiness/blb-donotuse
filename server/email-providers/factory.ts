/**
 * Email Provider Factory
 * Creates and manages email provider instances based on configuration
 */

import { EmailProvider, EmailProviderConfig, EmailProviderType } from "./types";
import { MockEmailProvider } from "./mock";

let providerInstance: EmailProvider | null = null;

/**
 * Initialize email provider based on environment configuration
 */
export async function initializeEmailProvider(
  config?: EmailProviderConfig
): Promise<EmailProvider> {
  if (providerInstance) {
    return providerInstance;
  }

  const providerType = (config?.type ||
    process.env.EMAIL_PROVIDER ||
    "mock") as EmailProviderType;
  const fromEmail = config?.from || process.env.EMAIL_FROM || "noreply@grantthrive.local";

  console.log(`[Email Provider] Initializing ${providerType} provider`);

  switch (providerType) {
    case "mock":
      providerInstance = new MockEmailProvider({ from: fromEmail });
      break;

    case "sendgrid":
      try {
        const { SendGridEmailProvider } = await import("./sendgrid");
        const apiKey = config?.apiKey || process.env.SENDGRID_API_KEY;
        if (!apiKey) {
          throw new Error("SENDGRID_API_KEY environment variable not set");
        }
        providerInstance = new SendGridEmailProvider({
          from: fromEmail,
          apiKey,
        });
      } catch (error: any) {
        console.warn(
          `[Email Provider] Failed to initialize SendGrid: ${error.message}. Falling back to mock provider.`
        );
        providerInstance = new MockEmailProvider({ from: fromEmail });
      }
      break;

    case "ses":
      try {
        const { AWSSeEmailProvider } = await import("./ses");
        const region = config?.region || process.env.AWS_REGION;
        providerInstance = new AWSSeEmailProvider({
          from: fromEmail,
          region,
        });
      } catch (error: any) {
        console.warn(
          `[Email Provider] Failed to initialize AWS SES: ${error.message}. Falling back to mock provider.`
        );
        providerInstance = new MockEmailProvider({ from: fromEmail });
      }
      break;

    default:
      console.warn(`[Email Provider] Unknown provider type: ${providerType}. Using mock provider.`);
      providerInstance = new MockEmailProvider({ from: fromEmail });
  }

  // Verify provider configuration
  const verified = await providerInstance.verify();
  if (!verified) {
    console.warn(
      `[Email Provider] Provider verification failed. Some features may not work correctly.`
    );
  }

  return providerInstance;
}

/**
 * Get the current email provider instance
 */
export function getEmailProvider(): EmailProvider {
  if (!providerInstance) {
    throw new Error(
      "Email provider not initialized. Call initializeEmailProvider() first."
    );
  }
  return providerInstance;
}

/**
 * Reset provider instance (useful for testing)
 */
export function resetEmailProvider(): void {
  providerInstance = null;
}

/**
 * Get provider status
 */
export async function getProviderStatus() {
  const provider = getEmailProvider();
  return {
    name: provider.getName(),
    status: await provider.getStatus(),
  };
}
