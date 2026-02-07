# Email Provider Integration Guide

This guide explains how to set up and integrate different email providers with GrantThrive.

## Overview

GrantThrive uses a flexible email provider architecture that supports multiple providers:

- **Mock Provider** (Default) - For development/testing, logs to console
- **SendGrid** - Production email service
- **AWS SES** - Amazon Simple Email Service
- **Mailgun** - (Can be added following the same pattern)

## Architecture

The email provider system is built on an abstraction layer:

```
EmailProvider (interface)
├── MockEmailProvider
├── SendGridEmailProvider
├── AWSSeEmailProvider
└── MailgunEmailProvider (future)
```

All providers implement the same interface, making it easy to switch between them.

## Current Setup (Mock Provider)

By default, GrantThrive uses the **Mock Email Provider** for development:

- Emails are logged to the console
- No external service required
- Perfect for testing and development

## Switching to SendGrid

### 1. Install SendGrid SDK

```bash
npm install @sendgrid/mail
```

### 2. Set Environment Variables

```bash
# .env or .env.local
EMAIL_PROVIDER=sendgrid
EMAIL_FROM=noreply@yourdomain.com
SENDGRID_API_KEY=your_sendgrid_api_key_here
```

### 3. Get SendGrid API Key

1. Go to [SendGrid Dashboard](https://app.sendgrid.com)
2. Navigate to Settings → API Keys
3. Create a new API key with "Mail Send" permissions
4. Copy the key to your `SENDGRID_API_KEY` environment variable

### 4. Verify Sender Email

In SendGrid, verify your sender email address:

1. Go to Settings → Sender Authentication
2. Add and verify your domain or single sender email
3. Use this email in `EMAIL_FROM`

### 5. Test the Integration

The provider will automatically verify on startup. Check logs for:

```
[Email Provider] Initializing sendgrid provider
[SendGrid Provider] Configuration verified successfully
```

## Switching to AWS SES

### 1. Install AWS SDK

```bash
npm install @aws-sdk/client-ses
```

### 2. Set Environment Variables

```bash
# .env or .env.local
EMAIL_PROVIDER=ses
EMAIL_FROM=noreply@yourdomain.com
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

### 3. Configure AWS Credentials

Create an IAM user with SES permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail",
        "ses:GetAccountSendingEnabled"
      ],
      "Resource": "*"
    }
  ]
}
```

### 4. Verify Sender Email

In AWS SES Console:

1. Go to Verified Identities
2. Add and verify your sender email or domain
3. Use this email in `EMAIL_FROM`

### 5. Request Production Access (if needed)

By default, SES accounts are in sandbox mode (limited to verified addresses). To send to any address:

1. Go to SES Dashboard
2. Request production access
3. Wait for AWS approval (usually 24 hours)

### 6. Test the Integration

Check logs for:

```
[Email Provider] Initializing ses provider
[AWS SES Provider] Configuration verified successfully
```

## Adding a New Provider (e.g., Mailgun)

### 1. Create Provider Implementation

Create `server/email-providers/mailgun.ts`:

```typescript
import { EmailMessage, EmailProvider, EmailSendResult } from "./types";

export class MailgunEmailProvider implements EmailProvider {
  private from: string;
  private apiKey: string;
  private domain: string;

  constructor(config: { from: string; apiKey: string; domain: string }) {
    this.from = config.from;
    this.apiKey = config.apiKey;
    this.domain = config.domain;
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    // Implementation here
    // Use Mailgun API to send email
  }

  async sendBatch(messages: EmailMessage[]): Promise<EmailSendResult[]> {
    // Implementation here
  }

  async verify(): Promise<boolean> {
    // Verify Mailgun configuration
  }

  getName(): string {
    return "Mailgun Email Provider";
  }

  async getStatus() {
    // Return provider status
  }
}
```

### 2. Update Factory

Add case to `factory.ts`:

```typescript
case "mailgun":
  try {
    const { MailgunEmailProvider } = await import("./mailgun");
    const apiKey = config?.apiKey || process.env.MAILGUN_API_KEY;
    const domain = config?.domain || process.env.MAILGUN_DOMAIN;
    providerInstance = new MailgunEmailProvider({
      from: fromEmail,
      apiKey,
      domain,
    });
  } catch (error: any) {
    console.warn(`Failed to initialize Mailgun: ${error.message}`);
    providerInstance = new MockEmailProvider({ from: fromEmail });
  }
  break;
```

### 3. Update Type Definitions

Add to `types.ts`:

```typescript
export type EmailProviderType = "mock" | "sendgrid" | "ses" | "mailgun";
```

## Environment Variables Reference

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `EMAIL_PROVIDER` | No | `mock` | Provider type: mock, sendgrid, ses, mailgun |
| `EMAIL_FROM` | No | `noreply@grantthrive.local` | Default sender email address |
| `SENDGRID_API_KEY` | For SendGrid | - | SendGrid API key |
| `AWS_REGION` | For AWS SES | `us-east-1` | AWS region for SES |
| `AWS_ACCESS_KEY_ID` | For AWS SES | - | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | For AWS SES | - | AWS secret key |
| `MAILGUN_API_KEY` | For Mailgun | - | Mailgun API key |
| `MAILGUN_DOMAIN` | For Mailgun | - | Mailgun domain |

## Testing Email Delivery

### Mock Provider

Emails are logged to console. Check server logs for output.

### Production Providers

Use the health check endpoint to verify configuration:

```typescript
import { getProviderStatus } from "./email-providers/factory";

const status = await getProviderStatus();
console.log(status);
// Output:
// {
//   name: "SendGrid Email Provider",
//   status: {
//     healthy: true,
//     message: "SendGrid is configured and ready"
//   }
// }
```

## Troubleshooting

### "Provider not initialized"

Make sure `initializeEmailProvider()` is called on server startup (in `server/_core/index.ts`).

### "API Key not provided"

Check that environment variables are set correctly:

```bash
# Check if variable is set
echo $SENDGRID_API_KEY

# Verify .env file exists and is loaded
cat .env
```

### Emails not sending

1. Check server logs for error messages
2. Verify sender email is verified in the provider
3. Check provider credentials are correct
4. Ensure IAM/API permissions are correct

### SendGrid: "Invalid email address"

- Verify recipient email is valid
- Check sender email is verified in SendGrid

### AWS SES: "MessageRejected"

- Verify sender email is verified in SES
- Check if account is still in sandbox mode
- Verify IAM permissions include `ses:SendEmail`

## Performance Considerations

- **Mock Provider**: Instant, no network calls
- **SendGrid**: ~200-500ms per email
- **AWS SES**: ~100-300ms per email
- **Batch Operations**: Use `sendBatch()` for better performance

## Security Best Practices

1. **Never commit credentials** - Use environment variables only
2. **Use API keys with limited scope** - Only grant necessary permissions
3. **Rotate keys regularly** - Change API keys every 90 days
4. **Monitor usage** - Set up alerts for unusual activity
5. **Use HTTPS** - All provider APIs use HTTPS
6. **Validate email addresses** - Prevent sending to invalid addresses

## Support

For issues with specific providers:

- **SendGrid**: https://docs.sendgrid.com
- **AWS SES**: https://docs.aws.amazon.com/ses/
- **Mailgun**: https://documentation.mailgun.com
