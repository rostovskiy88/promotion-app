/// <reference types="cypress" />

describe('Advanced Article Management', () => {
  beforeEach(() => {
    // Login first to access article management features
    cy.visit('http://localhost:5173/login');
    cy.url().should('include', '/login');
    
    // Use test credentials to login
    cy.get('input[placeholder="Enter your email"]').type('rostovskiy88@ukr.net');
    cy.get('input[placeholder="Enter your password"]').type('7250563Asd');
    cy.get('button[type="submit"]').click();
    
    // Wait for login to complete
    cy.url({ timeout: 10000 }).should('include', '/dashboard');
    cy.wait(1000);
  });

  it('should create a new article with all fields', () => {
    cy.contains('+ Add Article').click();
    cy.url().should('include', '/add-article');
    cy.get('.ant-select').click();
    cy.get('.ant-select-item-option').contains('Media').click();
    cy.get('input[placeholder="Enter your title"]').type('Cypress Test Article');
    cy.get('textarea[placeholder="Enter your text copy"]').type('This is a test article created by Cypress.');
    cy.contains('Publish').click();
    cy.url().should('include', '/dashboard');
    cy.contains('Cypress Test Article').should('be.visible');
  });

  it('should edit an existing article', () => {
    cy.get('[data-testid="article-card"]').first().within(() => {
      cy.get('.article-card-menu').click();
    });
    cy.get('.ant-dropdown-menu').contains('Edit').click();
    cy.url().should('include', '/edit-article');
    cy.get('input[placeholder="Enter your title"]').clear().type('Cypress Edited Article');
    cy.contains('Update Article').click();
    cy.url().should('include', '/dashboard');
    cy.contains('Cypress Edited Article').should('be.visible');
  });

  it('should delete an article with confirmation', () => {
    // Get the title of the first article card
    cy.get('[data-testid="article-card"]').first().find('.article-card-title').invoke('text').then((title) => {
      cy.get('[data-testid="article-card"]').first().within(() => {
        cy.get('.article-card-menu').click();
      });
      cy.get('.ant-dropdown-menu').contains('Delete').click();
      cy.get('.ant-modal', { timeout: 5000 }).should('exist');
      cy.get('.ant-modal', { timeout: 5000 }).should('be.visible');
      // Use a global selector for the Yes button
      cy.get('body').then(() => {
        cy.contains('button', 'Yes', { timeout: 5000 }).should('be.visible').click();
      });
      // Assert the article with that title is no longer present, with a longer timeout
      cy.contains('.article-card-title', title, { timeout: 10000 }).should('not.exist');
    });
  });

  it('should display full article details', () => {
    cy.get('[data-testid="article-card"]').first().within(() => {
      cy.get('.article-card-readmore').click();
    });
    cy.url().should('include', '/article/');
    cy.get('h1').should('be.visible');
    cy.contains('Back to Dashboard').should('be.visible');
  });
});
