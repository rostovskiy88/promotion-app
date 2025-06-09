# 🔔 Slack Notifications Setup for GitHub Actions

This guide will help you set up Slack notifications for your GitHub Actions workflows.

## 📋 Prerequisites

- A Slack workspace where you have permission to create apps
- Admin access to your GitHub repository
- A channel where you want to receive notifications

## 🚀 Setup Instructions

### Step 1: Create a Slack App

1. Go to [Slack API](https://api.slack.com/apps)
2. Click **"Create New App"** → **"From scratch"**
3. App Name: `GitHub Actions Notifications`
4. Pick your workspace and click **"Create App"**

### Step 2: Enable Incoming Webhooks

1. In your new app, go to **"Features"** → **"Incoming Webhooks"**
2. Toggle **"Activate Incoming Webhooks"** to **On**
3. Click **"Add New Webhook to Workspace"**
4. Choose the channel for notifications (e.g., `#deployments`)
5. Click **"Allow"**
6. **Copy the Webhook URL** - you'll need this for GitHub

### Step 3: Add Webhook to GitHub Secrets

1. Go to your GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. **Name:** `SLACK_WEBHOOK_URL`
5. **Secret:** Paste your webhook URL from Step 2
6. Click **"Add secret"**

## 🎯 Current Notification Setup

Your workflows now include Slack notifications for:

### Main Branch Deployments (`deploy.yml`)
- ✅ **Success:** Full deployment success with job results
- ❌ **Failure:** Detailed failure information with links to logs
- 📊 **Status for:** Unit Tests, E2E Tests, Deployment
- 🌐 **Live URL:** Direct link to deployed app

### Pull Request Tests (`firebase-hosting-pull-request.yml`)
- ❌ **Test Failures:** Notification when PR tests fail
- 🔗 **Links:** Direct links to PR and workflow logs

## 📱 Notification Examples

### Successful Deployment
```
🚀 Deployment Successful!

Repository: username/react-promotion
Branch: main
Commit: abc123d
Author: username
Message: Add new feature

📊 Results:
✅ Unit Tests: success
✅ E2E Tests: success  
✅ Deploy: success

🌐 Live URL: https://react-promotion-app.web.app
```

### Failed Deployment
```
❌ Deployment Failed!

Repository: username/react-promotion
Branch: main
Commit: abc123d
Author: username
Message: Fix bug

📊 Job Results:
Unit Tests: success
E2E Tests: failure
Deploy: skipped

🔗 View Workflow Run
```

### PR Test Failure
```
🔴 PR Tests Failed

PR: #42 - Add user authentication
Author: username
Branch: feature/auth

❌ Tests failed - please check the workflow

🔗 View PR
🔗 View Workflow
```

## 🔧 Customization Options

### Change Notification Channels

Edit the `channel` field in the workflow files:
```yaml
channel: '#your-channel-name'
```

### Add More Notifications

You can add notifications for:
- **PR Success:** When PR tests pass
- **Specific Test Failures:** Different channels for different test types
- **Security Alerts:** Failed security scans
- **Performance Alerts:** Build time thresholds

### Custom Message Format

Modify the `text` field to customize notification content:
```yaml
text: |
  Your custom message here
  *Repository:* ${{ github.repository }}
  *Status:* ${{ job.status }}
```

## 🛠️ Troubleshooting

### Notifications Not Appearing

1. **Check Webhook URL:** Verify it's correctly added to GitHub secrets
2. **Channel Permissions:** Ensure the app has permission to post to the channel
3. **Workflow Syntax:** Validate YAML syntax in workflow files

### Wrong Channel

1. Create a new webhook for the correct channel
2. Update the `SLACK_WEBHOOK_URL` secret in GitHub

### Missing Information

The notification fields depend on GitHub context. Some fields may be empty for certain triggers (e.g., manual runs).

## 🔒 Security Notes

- ✅ Webhook URL is stored as a GitHub secret (encrypted)
- ✅ No sensitive information is exposed in notifications
- ✅ Only commit messages and public repository info are shared

## 📚 Advanced Features

### Thread Notifications
For follow-up messages in the same thread, use the Slack API to capture and reference thread timestamps.

### Rich Formatting
Slack supports rich formatting including:
- **Bold text**
- `Code blocks`
- [Links](https://example.com)
- Lists and bullets

### Multiple Webhooks
You can create different webhooks for different channels and use different secrets:
- `SLACK_WEBHOOK_DEPLOYMENTS`
- `SLACK_WEBHOOK_ALERTS`
- `SLACK_WEBHOOK_TEAM`

## 🎉 You're All Set!

Your GitHub Actions will now send Slack notifications for:
- ✅ Successful deployments
- ❌ Failed builds/tests/deployments
- 🔴 PR test failures

The notifications include all relevant information and direct links to help you quickly respond to issues. 