// E2E Test for Article Management Workflow

describe('Article Management', () => {
  beforeEach(() => {
    // Visit the app
    cy.visit('http://localhost:5173');
  });

  it('should complete full article workflow', () => {
    // Login
    cy.get('[data-testid=email-input]').type('test@example.com');
    cy.get('[data-testid=password-input]').type('password123');
    cy.get('[data-testid=login-button]').click();

    // Wait for dashboard
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid=dashboard-title]').should('be.visible');

    // Add new article
    cy.get('[data-testid=add-article-button]').click();
    cy.url().should('include', '/add-article');

    // Fill article form
    cy.get('[data-testid=article-title-input]').type('Test Article Title');
    cy.get('[data-testid=article-content-textarea]').type('This is test article content');
    cy.get('[data-testid=article-category-select]').click();
    cy.get('.ant-select-item').contains('Technology').click();

    // Submit article
    cy.get('[data-testid=submit-article-button]').click();

    // Verify redirect to dashboard
    cy.url().should('include', '/dashboard');

    // Search for the article
    cy.get('[data-testid=search-input]').type('Test Article');
    cy.get('[data-testid=article-card]').should('contain', 'Test Article Title');

    // Click on article to view details (using route params)
    cy.get('[data-testid=article-card]').first().click();
    cy.url().should('match', /\/article\/[a-zA-Z0-9]+/);
    cy.get('h1').should('contain', 'Test Article Title');

    // Go back to dashboard
    cy.get('[data-testid=back-button]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should work offline', () => {
    // Login first
    cy.get('[data-testid=email-input]').type('test@example.com');
    cy.get('[data-testid=password-input]').type('password123');
    cy.get('[data-testid=login-button]').click();

    // Wait for data to load
    cy.wait(2000);

    // Simulate offline
    cy.window().then((win) => {
      // Trigger offline event
      win.dispatchEvent(new Event('offline'));
    });

    // App should show offline indicator
    cy.get('[data-testid=offline-indicator]').should('be.visible');

    // Articles should still be visible from cache
    cy.get('[data-testid=article-card]').should('exist');
  });
}); 