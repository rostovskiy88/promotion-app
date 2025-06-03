# Authentication Error E2E Tests

This directory contains end-to-end tests specifically designed to verify that authentication error messages are user-friendly and don't expose raw Firebase error codes.

## Test Files

### `auth-errors.cy.ts`
Comprehensive test suite covering all authentication error scenarios:
- Email login errors (wrong password, invalid email, non-existent users)
- Password reset errors
- Registration errors (existing email, weak password)
- Network error handling
- Form validation
- Loading states
- Error message cleanup

### `email-auth-errors.cy.ts`
Focused test suite specifically for email authentication error messages:
- Wrong password scenarios
- Non-existent email scenarios
- Malformed email handling
- Loading state verification
- Error message content validation

## Running the Tests

### Run all authentication error tests:
```bash
npm run test:auth-errors
```

### Open Cypress UI for authentication tests:
```bash
npm run test:auth-errors:open
```

### Run all e2e tests:
```bash
npm run test:e2e
```

## What These Tests Verify

### ✅ User-Friendly Error Messages
- No raw Firebase error codes (e.g., `auth/invalid-credential`)
- No "Firebase: Error" prefixes
- Clear, actionable error messages for users

### ✅ Security Best Practices
- Same error message for wrong password and non-existent email
- No information leakage about existing accounts

### ✅ Error Scenarios Covered
- **Wrong Password**: Shows "Incorrect email or password"
- **Non-existent Email**: Shows "Incorrect email or password" 
- **Invalid Email**: Shows "Please enter a valid email address"
- **Weak Password**: Shows "Password is too weak" (if Firebase considers the password weak)
- **Email Already Exists**: Shows "An account with this email already exists"
- **Network Errors**: Shows generic network error message

### ✅ UI/UX Verification
- Loading states work correctly
- Form validation works as expected
- Error messages appear and disappear appropriately
- Navigation between forms clears errors

## Test Requirements

Before running these tests, ensure:
1. Your development server is running on `http://localhost:5173`
2. Firebase is properly configured
3. The authentication forms use the expected input placeholders and button text

## Expected Error Messages

The tests verify that users see these friendly messages instead of Firebase errors:

| Scenario | User-Friendly Message | Instead of Firebase Error |
|----------|----------------------|---------------------------|
| Wrong Password | "Incorrect email or password. Please check your credentials and try again." | "Firebase: Error (auth/invalid-credential)" |
| Non-existent User | "Incorrect email or password. Please check your credentials and try again." | "Firebase: Error (auth/user-not-found)" |
| Invalid Email | "Please enter a valid email address." | "Firebase: Error (auth/invalid-email)" |
| Weak Password | "Password is too weak. Please choose a stronger password." | "Firebase: Error (auth/weak-password)" |
| Email Exists | "An account with this email already exists." | "Firebase: Error (auth/email-already-in-use)" |

## Troubleshooting

If tests fail:
1. Check that your dev server is running on the correct port
2. Verify that the UI selectors (input placeholders, button text) match your actual implementation
3. Ensure the error utility function (`src/utils/authErrors.ts`) is properly imported and used
4. Check that Redux async thunks are using `getAuthErrorMessage()` function

## Adding New Tests

To add new authentication error scenarios:
1. Add test cases to the appropriate describe block
2. Follow the pattern: trigger error → verify user-friendly message → verify no Firebase errors
3. Use consistent selectors and timeouts
4. Test both positive and negative cases 

## Important Notes

### Password Validation
Your registration form requires **8+ character passwords**, while Firebase's default requirement is only **6 characters**. This means:
- Very short passwords (like "123") are caught by form validation before reaching Firebase
- The weak password test uses an 8-character password that might still be considered weak by Firebase
- If Firebase accepts the password, the test will pass (which is also correct behavior)

### Test Expectations
The tests are designed to be **flexible** where appropriate:
- **Wrong credentials**: Always expects user-friendly error message
- **Weak password**: Accepts either user-friendly error OR successful registration
- **Form validation**: Tests client-side validation for required fields and email format 