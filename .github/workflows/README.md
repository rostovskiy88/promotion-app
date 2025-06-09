# CI/CD Pipeline with E2E Testing

This repository implements a comprehensive CI/CD pipeline that includes unit tests, end-to-end tests, and automated deployment to Firebase Hosting.

## 🚀 Workflows Overview

### 1. **Main Deployment Pipeline** (`deploy.yml`)
**Triggers:** Push to `main`/`master`, Pull Requests

**Pipeline Steps:**
```
Unit Tests → E2E Tests → Deploy to Firebase
```

**Jobs:**
- **`test`**: Runs unit tests and builds the application
- **`e2e-tests`**: Runs comprehensive E2E test suite
- **`deploy`**: Deploys to Firebase Hosting (main branch only)

### 2. **Pull Request Validation** (`firebase-hosting-pull-request.yml`)
**Triggers:** Pull Requests

**Pipeline Steps:**
```
Unit Tests → Build → Critical E2E Tests → Preview Deploy
```

**Features:**
- Runs unit tests and critical E2E tests
- Creates preview deployments for review
- Uploads test artifacts on failure

### 3. **Comprehensive E2E Testing** (`e2e-tests.yml`)
**Triggers:** Manual, Scheduled (daily), Workflow call

**Features:**
- **Matrix Strategy**: Parallel execution of test suites
- **Selective Testing**: Choose specific test categories
- **Scheduled Runs**: Daily comprehensive testing
- **Detailed Reporting**: Test results and artifacts

## 🧪 E2E Test Suites

### **Authentication Tests**
- Login/Register error handling
- Social authentication flows
- User-friendly error messages
- Security validation

### **Article Management**
- CRUD operations (Create, Read, Update, Delete)
- Image upload and handling
- Search and filtering
- Infinite scroll pagination

### **User Management**
- Profile updates and validation
- Avatar management
- Password changes
- Social user restrictions

### **Feature Tests**
- Weather widget functionality
- Theme switching (dark/light mode)
- Search and infinite scroll
- Responsive design

### **PWA Features**
- Offline functionality
- Service worker behavior
- App installation
- Push notifications

## 📊 Test Execution Strategy

### **Pull Request Testing**
```bash
# Critical path tests only (faster feedback)
- Authentication errors
- Basic article workflow
```

### **Main Branch Testing**
```bash
# Full comprehensive suite
- All authentication tests
- Complete article management
- User profile management
- Weather widget features
- Theme management
- Search functionality
- PWA features
```

### **Scheduled Testing**
```bash
# Daily comprehensive testing at 2 AM UTC
- Full test suite execution
- Performance regression detection
- Cross-browser compatibility
```

## 🔧 Local Development

### **Run All E2E Tests**
```bash
npm run test:e2e
```

### **Run Specific Test Suites**
```bash
npm run test:auth-errors      # Authentication tests
npm run test:e2e:articles     # Article management
npm run test:e2e:profile      # User profile tests
npm run test:e2e:weather      # Weather widget
npm run test:e2e:theme        # Theme management
npm run test:e2e:search       # Search & infinite scroll
npm run test:e2e:pwa          # PWA features
```

### **Critical Tests Only**
```bash
npm run test:e2e:critical     # Auth + basic workflow
```

### **Complete CI Pipeline Locally**
```bash
npm run test:ci               # Unit tests + critical E2E
```

### **Interactive Testing**
```bash
npm run test:e2e:open         # Open Cypress UI
```

## 🚦 Pipeline Status & Results

### **Deployment Conditions**
- ✅ Unit tests pass
- ✅ E2E tests pass
- ✅ Build succeeds
- 🔄 Only deploys from `main`/`master` branch

### **Failure Handling**
- **Test Videos**: Recorded for failed E2E tests
- **Screenshots**: Captured on test failures
- **Artifacts**: Available for 7 days
- **Parallel Jobs**: Other tests continue if one fails

### **Performance Optimizations**
- **Artifact Sharing**: Build once, test multiple times
- **Matrix Strategy**: Parallel E2E test execution
- **Selective Testing**: Run only relevant tests for PRs
- **Caching**: Node.js dependencies cached

## 🔐 Required Secrets

Ensure these secrets are configured in your GitHub repository:

```yaml
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
VITE_OPENWEATHER_API_KEY
FIREBASE_SERVICE_ACCOUNT_REACT_PROMOTION_APP
```

## 📈 Monitoring & Maintenance

### **Daily Scheduled Tests**
- **Purpose**: Catch regressions and external API changes
- **Schedule**: 2 AM UTC daily
- **Coverage**: Full comprehensive test suite

### **Test Maintenance**
- **Update Selectors**: When UI changes occur
- **Add New Tests**: For new features
- **Review Failures**: Investigate scheduled test failures
- **Performance**: Monitor test execution times

### **Artifact Management**
- **Videos/Screenshots**: Auto-cleanup after 7 days
- **Build Artifacts**: Auto-cleanup after 1 day
- **Test Reports**: Available in GitHub Actions summary

## 🚀 Getting Started

1. **Ensure Dependencies**
   ```bash
   npm install wait-on  # Required for server startup
   ```

2. **Test Locally First**
   ```bash
   npm run test:e2e:critical
   ```

3. **Commit and Push**
   - Pipeline automatically triggers
   - Check GitHub Actions tab for results

4. **Review Results**
   - Unit test coverage reports
   - E2E test execution videos
   - Deployment status

## 🛠️ Troubleshooting

### **Common Issues**

**Server Startup Timeout**
```bash
# Increase timeout in workflow
npx wait-on http://localhost:4173 --timeout 120000
```

**Environment Variables**
```bash
# Verify all required secrets are set
# Check Firebase configuration
```

**Test Flakiness**
```bash
# Review test artifacts
# Update selectors if UI changed
# Check network-dependent tests
```

### **Manual Workflow Trigger**

You can manually trigger comprehensive E2E tests:

1. Go to **Actions** tab in GitHub
2. Select **Comprehensive E2E Tests**
3. Click **Run workflow**
4. Choose test suite or run all

## 📋 Pipeline Benefits

✅ **Quality Assurance**: Comprehensive testing before deployment  
✅ **Fast Feedback**: Quick PR validation with critical tests  
✅ **Regression Prevention**: Daily scheduled comprehensive testing  
✅ **Debugging Support**: Videos and screenshots on failures  
✅ **Parallel Execution**: Faster overall pipeline execution  
✅ **Selective Testing**: Run only relevant tests when needed  
✅ **Artifact Management**: Automatic cleanup and retention  
✅ **Enterprise-Grade**: Production-ready CI/CD pipeline 