describe('Profile Component', () => {
  beforeEach(() => {
    // Log in
    cy.visit('/login');
    cy.get('input[placeholder="Enter your email"]').type('rostovskiy88@ukr.net');
    cy.get('input[placeholder="Enter your password"]').type('7250563Asd');
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/login');
    // Visit the profile page before each test
    cy.visit('/dashboard/profile');
  });

  it('should load the profile page', () => {
    // Check if the page title is visible
    cy.get('.header').should('contain', 'Manage your account');
  });

  it('should update user information', () => {
    // Fill in the form
    cy.get('input[placeholder="Enter your first name"]').clear().type('Jane');
    cy.get('input[placeholder="Enter your last name"]').clear().type('Smith');
    cy.get('input[placeholder="Enter your age"]').clear().type('30');

    // Submit the form
    cy.get('button').contains('Save').click();

    // Check for success message
    cy.get('.ant-message-success').should('be.visible');
  });

  it('should handle cancel button', () => {
    // Click cancel button
    cy.get('button').contains('Cancel').click();

    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
  });

  it('should validate age input', () => {
    // Try to enter invalid age
    cy.get('input[placeholder="Enter your age"]').clear().type('-1');

    // Submit the form
    cy.get('button').contains('Save').click();

    // Check for validation error
    cy.get('.ant-form-item-explain-error').should('be.visible');
  });

  it('should handle avatar upload', () => {
    // Click on the User Avatar tab
    cy.contains('User Avatar').click();

    // Upload a file
    cy.get('.ant-upload-drag').attachFile('test-avatar.jpg');

    // Click save
    cy.get('button').contains('Save').click();

    // Check for success message
    cy.get('.ant-message-success').should('be.visible');
  });
}); 