# Security Policy

## Overview

The GrantThrive Platform takes security seriously and is committed to maintaining a secure codebase. This document outlines our security practices, vulnerability reporting procedures, and automated security measures.

## Automated Security Measures

### Weekly Vulnerability Scans

The repository runs automated security scans every Monday at 2 AM UTC to identify vulnerabilities in dependencies:

- **Workflow:** `.github/workflows/security-scan.yml`
- **Frequency:** Weekly (Mondays at 2 AM UTC)
- **Tools:** pnpm audit, npm audit
- **Reporting:** Automatic GitHub issues created for vulnerabilities

**Scan Results:**
- High severity vulnerabilities trigger immediate issue creation
- Moderate and low severity vulnerabilities are tracked and reported
- Audit reports are uploaded as artifacts for review
- Issues are automatically closed when vulnerabilities are resolved

### Continuous Dependency Updates

Automated dependency updates run every Sunday at 3 AM UTC:

- **Workflow:** `.github/workflows/dependency-updates.yml`
- **Frequency:** Weekly (Sundays at 3 AM UTC)
- **Process:**
  1. Check for outdated packages
  2. Update all dependencies to latest versions
  3. Run full test suite
  4. Run type checking
  5. Create pull request for review

**PR Requirements:**
- All tests must pass
- Type checking must pass
- Manual review recommended before merging
- Breaking changes should be noted in PR description

### Code Quality & Security Checks

Continuous checks on every push and pull request:

- **Workflow:** `.github/workflows/code-quality.yml`
- **Triggers:** Push to main/develop, Pull requests
- **Checks:**
  - TypeScript type checking
  - Full test suite
  - Security audit (moderate level)
  - Code formatting validation
  - Trivy filesystem vulnerability scanning

## Vulnerability Reporting

### Reporting Security Issues

If you discover a security vulnerability, please **do not** create a public GitHub issue. Instead:

1. **Email:** Contact the security team with details of the vulnerability
2. **Include:**
   - Description of the vulnerability
   - Steps to reproduce (if applicable)
   - Potential impact
   - Suggested fix (if available)

3. **Timeline:**
   - We will acknowledge receipt within 24 hours
   - We will provide a timeline for fixes
   - We will credit you in security advisories (if desired)

### Responsible Disclosure

We follow responsible disclosure practices:

- Vulnerabilities are fixed before public disclosure
- Security patches are released as soon as possible
- Credit is given to reporters (with permission)
- A security advisory is published after fixes are deployed

## Dependency Management

### Current Security Status

- **Last Scan:** See GitHub Actions workflow runs
- **Known Vulnerabilities:** 0 (as of latest scan)
- **Outdated Packages:** Tracked in weekly dependency updates

### Updating Dependencies

To manually check for vulnerabilities:

```bash
# Check for vulnerabilities
pnpm audit

# Update all dependencies
pnpm update --latest

# Run tests after updates
pnpm test
```

### Pinned Versions

Critical dependencies are pinned to specific versions for stability:

- `jose`: 6.1.0 (JWT handling)
- `json2csv`: 6.0.0-alpha.2 (Export functionality)

## Security Best Practices

### Code Review

- All code changes require review before merging
- Security implications are considered during review
- Automated checks must pass before merge

### Testing

- Comprehensive test suite (138+ tests)
- Tests cover security-critical functionality
- All tests must pass in CI/CD pipeline

### Secrets Management

- No secrets are committed to the repository
- Environment variables are managed through GitHub Secrets
- API keys and credentials are never logged

### Dependencies

- Only trusted, well-maintained packages are used
- Dependencies are regularly updated
- Deprecated packages are replaced promptly

## Security Headers & Configuration

### CORS & CSP

- CORS is configured for allowed origins only
- Content Security Policy headers are enforced
- X-Frame-Options prevents clickjacking

### Authentication & Authorization

- OAuth 2.0 for user authentication
- JWT tokens for session management
- Role-based access control (RBAC) for admin features

### Data Protection

- All sensitive data is encrypted in transit (HTTPS)
- Database connections use TLS
- Passwords are hashed using industry-standard algorithms

## Incident Response

### Security Incident Procedure

1. **Detection:** Automated scans or manual reporting
2. **Assessment:** Evaluate severity and impact
3. **Containment:** Isolate affected systems if necessary
4. **Remediation:** Develop and test fixes
5. **Deployment:** Release security patches
6. **Communication:** Notify affected users (if applicable)
7. **Post-Incident:** Review and improve processes

## Compliance

The GrantThrive Platform follows security best practices aligned with:

- OWASP Top 10 prevention measures
- CWE (Common Weakness Enumeration) guidelines
- Industry-standard security practices

## Monitoring & Logging

- All security events are logged
- Logs are reviewed regularly for anomalies
- Critical events trigger alerts

## Questions?

For security-related questions or concerns, please contact the development team through appropriate channels.

---

**Last Updated:** February 8, 2026
**Maintained By:** GrantThrive Security Team
**Status:** Active
