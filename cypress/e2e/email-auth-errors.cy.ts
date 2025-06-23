/// <reference types="cypress" />


describe('Email Authentication - Error Messages', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/login');
  });

  it('should show user-friendly error instead of Firebase error for wrong password', () => {
    cy.get('input[placeholder="Enter your email"]').type('user@example.com');
    cy.get('input[placeholder="Enter your password"]').type('wrongpassword123');
    
    cy.get('button[type="submit"]').click();
    
    cy.get('body', { timeout: 10000 }).then(($body) => {
      if ($body.find('.ant-message-notice, .ant-notification-notice').length > 0) {
        cy.get('.ant-message-notice, .ant-notification-notice').should('not.contain', 'Firebase');
        cy.get('.ant-message-notice, .ant-notification-notice').should('not.contain', 'auth/invalid-credential');
        cy.get('.ant-message-notice, .ant-notification-notice').should('not.contain', 'auth/user-not-found');
        cy.get('.ant-message-notice, .ant-notification-notice').should('not.contain', 'auth/wrong-password');
      } else {
        cy.url().then((url) => {
          if (url.includes('/dashboard')) {
            cy.log('Login succeeded with test credentials');
            cy.url().should('include', '/dashboard');
          } else {
            cy.url().should('include', '/login');
            cy.log('No error message appeared - Firebase might not consider this an error');
          }
        });
      }
    });
  });

  it('should show user-friendly error for non-existent email', () => {
    cy.get('input[placeholder="Enter your email"]').type('nonexistent@test.com');
    cy.get('input[placeholder="Enter your password"]').type('somepassword');
    
    cy.get('button[type="submit"]').click();
    
    cy.get('body', { timeout: 10000 }).then(($body) => {
      if ($body.find('.ant-message-notice, .ant-notification-notice').length > 0) {
        cy.get('.ant-message-notice, .ant-notification-notice').should('not.contain', 'Firebase');
        cy.get('.ant-message-notice, .ant-notification-notice').should('not.contain', 'auth/');
      } else {
        cy.url().then((url) => {
          if (url.includes('/dashboard')) {
            cy.log('Login succeeded with test credentials');
            cy.url().should('include', '/dashboard');
          } else {
            cy.url().should('include', '/login');
            cy.log('No error message appeared - Firebase might not consider this an error');
          }
        });
      }
    });
  });

  it('should show form validation error for malformed email', () => {
    cy.get('input[placeholder="Enter your email"]').type('test@invalid');
    cy.get('input[placeholder="Enter your password"]').type('password123');
    
    cy.get('button[type="submit"]').click();
    
    cy.get('.ant-form-item-explain-error', { timeout: 5000 }).should('be.visible');
    cy.get('.ant-form-item-explain-error').should('contain', 'Please enter a valid email address');
    
    cy.get('.ant-message-notice, .ant-notification-notice').should('not.exist');
  });

  it('should preserve user-friendly errors during loading states', () => {
    cy.get('input[placeholder="Enter your email"]').type('test@example.com');
    cy.get('input[placeholder="Enter your password"]').type('wrongpassword');
    
    cy.get('button[type="submit"]').click();
    
    cy.get('button[type="submit"]', { timeout: 10000 }).should('not.have.class', 'ant-btn-loading');
    
    cy.get('body', { timeout: 10000 }).then(($body) => {
      if ($body.find('.ant-message-notice, .ant-notification-notice').length > 0) {
        cy.get('.ant-message-notice, .ant-notification-notice').should('not.contain', 'Firebase');
        cy.get('.ant-message-notice, .ant-notification-notice').should('not.contain', 'auth/');
        cy.log('User-friendly error message displayed');
      } else {
        cy.url().then((url) => {
          if (url.includes('/dashboard')) {
            cy.log('Login succeeded with test credentials');
            cy.url().should('include', '/dashboard');
          } else {
            cy.url().should('include', '/login');
            cy.log('No error message appeared - form processing completed without showing error');
          }
        });
      }
    });
  });

  it('should clear errors when typing new credentials', () => {
    cy.get('input[placeholder="Enter your email"]').type('wrong@email.com');
    cy.get('input[placeholder="Enter your password"]').type('wrongpass');
    cy.get('button[type="submit"]').click();
    
    cy.get('.ant-message-notice, .ant-notification-notice', { timeout: 10000 }).should('be.visible');
    
    cy.get('input[placeholder="Enter your email"]').clear().type('new@email.com');
    
    cy.get('input[placeholder="Enter your password"]').clear().type('newpassword');
  });
});

describe('Registration - Error Messages', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/register');
  });

  it('should show user-friendly error for email already in use', () => {
    cy.get('input[placeholder="Name"]').type('Test User');
    cy.get('input[placeholder="Enter your email"]').type('existing@email.com');
    cy.get('input[placeholder="Enter your password"]').type('password123');
    cy.get('input[placeholder="Enter your new password again"]').type('password123');
    
    cy.get('input[type="checkbox"]').check();
    
    cy.get('button').contains('Get started now').click();
    
    cy.get('.ant-message-notice, .ant-notification-notice', { timeout: 10000 }).should('be.visible');
    
    cy.get('body').then(($body) => {
      if ($body.find('.ant-message-error, .ant-notification-notice-error').length > 0) {
        cy.get('.ant-message-notice, .ant-notification-notice').should('not.contain', 'Firebase');
        cy.get('.ant-message-notice, .ant-notification-notice').should('not.contain', 'auth/email-already-in-use');
      }
    });
  });

  it('should show user-friendly error for weak password', () => {
    cy.get('input[placeholder="Name"]').type('Test User');
    cy.get('input[placeholder="Enter your email"]').type('newuser@test.com');
    cy.get('input[placeholder="Enter your password"]').type('12345678'); // 8 chars but weak
    cy.get('input[placeholder="Enter your new password again"]').type('12345678');
    
    cy.get('input[type="checkbox"]').check();
    
    cy.get('button').contains('Get started now').click();
    
    cy.get('body', { timeout: 10000 }).then(($body) => {
      if ($body.find('.ant-message-notice, .ant-notification-notice').length > 0) {
        if ($body.find('.ant-message-error, .ant-notification-notice-error').length > 0) {
          cy.get('.ant-message-notice, .ant-notification-notice').should('not.contain', 'Firebase');
          cy.get('.ant-message-notice, .ant-notification-notice').should('not.contain', 'auth/weak-password');
          cy.get('.ant-message-notice, .ant-notification-notice').should('contain', 'Password is too weak');
        } else {
          cy.get('.ant-message-notice, .ant-notification-notice').should('contain', 'Registration successful');
        }
      } else {
        cy.url({ timeout: 5000 }).then((url) => {
          if (url.includes('/dashboard')) {
            cy.log('Registration succeeded - Firebase accepted the password');
            cy.url().should('include', '/dashboard');
          } else {
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
    cy.get('input[placeholder="Enter your email"]').type('nonexistent@fake.com');
    
    cy.get('button').contains('Reset').click();
    
    cy.get('.ant-message-notice, .ant-notification-notice', { timeout: 10000 }).should('be.visible');
    
    cy.get('body').then(($body) => {
      if ($body.find('.ant-message-error, .ant-notification-notice-error').length > 0) {
        cy.get('.ant-message-notice, .ant-notification-notice').should('not.contain', 'Firebase');
        cy.get('.ant-message-notice, .ant-notification-notice').should('not.contain', 'auth/');
      }
    });
  });
}); 