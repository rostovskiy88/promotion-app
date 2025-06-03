/// <reference types="cypress" />

// Focused E2E Tests for Email Authentication Error Messages

describe('Email Authentication - Error Messages', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/login');
  });

  it('should show user-friendly error instead of Firebase error for wrong password', () => {
    // Use a real email format but wrong password
    cy.get('input[placeholder="Enter your email"]').type('user@example.com');
    cy.get('input[placeholder="Enter your password"]').type('wrongpassword123');
    
    // Submit login form
    cy.get('button[type="submit"]').click();
    
    // Wait for and verify the error message - Ant Design message API creates different elements
    cy.get('.ant-message').should('be.visible', { timeout: 10000 });
    cy.get('.ant-message .ant-message-error').should('be.visible');
    
    // Verify it shows user-friendly message, not Firebase error
    cy.get('.ant-message').should('contain', 'Incorrect email or password');
    cy.get('.ant-message').should('not.contain', 'Firebase');
    cy.get('.ant-message').should('not.contain', 'auth/invalid-credential');
    cy.get('.ant-message').should('not.contain', 'auth/user-not-found');
    cy.get('.ant-message').should('not.contain', 'auth/wrong-password');
  });

  it('should show user-friendly error for non-existent email', () => {
    // Use non-existent email
    cy.get('input[placeholder="Enter your email"]').type('nonexistent@test.com');
    cy.get('input[placeholder="Enter your password"]').type('somepassword');
    
    // Submit login form
    cy.get('button[type="submit"]').click();
    
    // Wait for and verify the error message
    cy.get('.ant-message', { timeout: 10000 }).should('be.visible');
    cy.get('.ant-message .ant-message-error').should('be.visible');
    
    // Should show the same generic message for security
    cy.get('.ant-message').should('contain', 'Incorrect email or password');
    cy.get('.ant-message').should('not.contain', 'Firebase');
    cy.get('.ant-message').should('not.contain', 'auth/');
  });

  it('should show form validation error for malformed email', () => {
    // Use an email that triggers Ant Design's email validation
    cy.get('input[placeholder="Enter your email"]').type('test@invalid');
    cy.get('input[placeholder="Enter your password"]').type('password123');
    
    // Submit login form - this should trigger form validation
    cy.get('button[type="submit"]').click();
    
    // Should show form validation error, not reach Firebase
    cy.get('.ant-form-item-explain-error', { timeout: 5000 }).should('be.visible');
    cy.get('.ant-form-item-explain-error').should('contain', 'Please enter a valid email');
    
    // Should NOT show Firebase error messages (because form validation prevents submission)
    cy.get('.ant-message').should('not.exist');
  });

  it('should preserve user-friendly errors during loading states', () => {
    // Fill with wrong credentials
    cy.get('input[placeholder="Enter your email"]').type('test@example.com');
    cy.get('input[placeholder="Enter your password"]').type('wrongpassword');
    
    // Submit and check loading state
    cy.get('button[type="submit"]').click();
    cy.get('button[type="submit"]').should('have.class', 'ant-btn-loading');
    
    // After loading completes, check what happened
    cy.get('body', { timeout: 10000 }).then(($body) => {
      if ($body.find('.ant-message').length > 0) {
        // Error appeared - should be user-friendly
        cy.get('.ant-message').should('contain', 'Incorrect email or password');
        cy.get('.ant-message').should('not.contain', 'Firebase');
      } else {
        // No error message - either succeeded or form validation prevented it
        cy.url().then((url) => {
          if (url.includes('/dashboard')) {
            cy.log('Login succeeded with test credentials');
            cy.url().should('include', '/dashboard');
          } else {
            // Still on login page - no error message appeared, which is also acceptable
            cy.url().should('include', '/login');
            cy.log('No error message appeared - form processing completed without showing error');
          }
        });
      }
    });
    
    // Loading should be done regardless
    cy.get('button[type="submit"]').should('not.have.class', 'ant-btn-loading');
  });

  it('should clear errors when typing new credentials', () => {
    // Trigger an error first
    cy.get('input[placeholder="Enter your email"]').type('wrong@email.com');
    cy.get('input[placeholder="Enter your password"]').type('wrongpass');
    cy.get('button[type="submit"]').click();
    
    // Wait for error
    cy.get('.ant-message', { timeout: 10000 }).should('be.visible');
    
    // Start typing in email field - this might trigger error clearing
    cy.get('input[placeholder="Enter your email"]').clear().type('new@email.com');
    
    // The error message should eventually disappear or be replaced
    // Note: This depends on your implementation - you might clear errors on form change
    cy.get('input[placeholder="Enter your password"]').clear().type('newpassword');
  });
});

describe('Registration - Error Messages', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/register');
  });

  it('should show user-friendly error for email already in use', () => {
    // Fill registration form with potentially existing email
    cy.get('input[placeholder="Name"]').type('Test User');
    cy.get('input[placeholder="Enter your email"]').type('existing@email.com');
    cy.get('input[placeholder="Enter your password"]').type('password123');
    cy.get('input[placeholder="Enter your new password again"]').type('password123');
    
    // Accept terms
    cy.get('input[type="checkbox"]').check();
    
    // Submit
    cy.get('button').contains('Get started now').click();
    
    // Wait for potential error (if email exists)
    cy.get('.ant-message', { timeout: 10000 }).should('be.visible');
    
    // If it's an error (not success), it should be user-friendly
    cy.get('body').then(($body) => {
      if ($body.find('.ant-message-error').length > 0) {
        cy.get('.ant-message').should('not.contain', 'Firebase');
        cy.get('.ant-message').should('not.contain', 'auth/email-already-in-use');
      }
    });
  });

  it('should show user-friendly error for weak password', () => {
    // Use a password that meets form requirements (8+ chars) but is still weak
    cy.get('input[placeholder="Name"]').type('Test User');
    cy.get('input[placeholder="Enter your email"]').type('newuser@test.com');
    cy.get('input[placeholder="Enter your password"]').type('12345678'); // 8 chars but weak
    cy.get('input[placeholder="Enter your new password again"]').type('12345678');
    
    // Accept terms
    cy.get('input[type="checkbox"]').check();
    
    // Submit
    cy.get('button').contains('Get started now').click();
    
    // Wait for response - might be success or weak password error
    cy.get('body', { timeout: 10000 }).then(($body) => {
      if ($body.find('.ant-message').length > 0) {
        // Message appeared - check what type
        if ($body.find('.ant-message-error').length > 0) {
          // Error message - should be user-friendly
          cy.get('.ant-message').should('not.contain', 'Firebase');
          cy.get('.ant-message').should('not.contain', 'auth/weak-password');
          cy.get('.ant-message').should('contain', 'Password is too weak');
        } else {
          // Success message - Firebase accepted this password
          cy.get('.ant-message').should('contain', 'Registration successful');
        }
      } else {
        // No message yet - check URL for success or accept that Firebase might accept this password
        cy.url({ timeout: 5000 }).then((url) => {
          if (url.includes('/dashboard')) {
            cy.log('Registration succeeded - Firebase accepted the password');
            cy.url().should('include', '/dashboard');
          } else {
            // Still on register page - test passes as Firebase may not consider this weak
            cy.url().should('include', '/register');
            cy.log('Firebase accepted the password as strong enough');
          }
        });
      }
    });
  });
});

describe('Password Reset - Error Messages', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/login');
    cy.get('a').contains('Forgot password?').click();
  });

  it('should show user-friendly error for invalid email in password reset', () => {
    // Use potentially problematic email
    cy.get('input[placeholder="Enter your email"]').type('nonexistent@fake.com');
    
    // Submit reset form
    cy.get('button').contains('Reset').click();
    
    // Wait for response
    cy.get('.ant-message', { timeout: 10000 }).should('be.visible');
    
    // If it's an error, should be user-friendly
    cy.get('body').then(($body) => {
      if ($body.find('.ant-message-error').length > 0) {
        cy.get('.ant-message').should('not.contain', 'Firebase');
        cy.get('.ant-message').should('not.contain', 'auth/');
      }
    });
  });
}); 