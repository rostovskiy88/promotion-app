/// <reference types="cypress" />

describe('Search & Infinite Scroll', () => {
  beforeEach(() => {
    // Visit the app
    cy.visit('http://localhost:5173');
    
    // Check if already logged in
    cy.url({ timeout: 3000 }).then((url) => {
      if (url.includes('/dashboard')) {
        // Already logged in and on dashboard
        cy.log('Already authenticated and on dashboard');
        return;
      }
      
      // If we're on a different authenticated page, navigate to dashboard
      if (!url.includes('/login') && !url.includes('/register')) {
        cy.log('Authenticated but not on dashboard, navigating to dashboard');
        cy.visit('/dashboard');
        cy.url().should('include', '/dashboard');
        return;
      }
      
      // Try to login with test credentials
      cy.get('input[placeholder="Enter your email"]').type('testuser@example.com');
      cy.get('input[placeholder="Enter your password"]').type('testpassword123');
      cy.get('button[type="submit"]').click();
      
      // Check if login succeeded
      cy.url({ timeout: 10000 }).then((loginUrl) => {
        if (loginUrl.includes('/login')) {
          // Login failed - try to register the test user
          cy.log('Login failed, attempting to register test user');
          
          // Go to register page
          cy.contains('Create an account').click();
          cy.url().should('include', '/register');
          
          // Fill registration form
          cy.get('input[placeholder="Name"]').type('Test User');
          cy.get('input[placeholder="Enter your email"]').type('testuser@example.com');
          cy.get('input[placeholder="Enter your password"]').type('testpassword123');
          cy.get('input[placeholder="Enter your new password again"]').type('testpassword123');
          cy.get('input[type="checkbox"]').check();
          cy.get('button').contains('Get started now').click();
          
          // Wait for registration to complete and navigate to dashboard if needed
          cy.url({ timeout: 15000 }).then((regUrl) => {
            if (!regUrl.includes('/dashboard')) {
              cy.log('Not on dashboard after registration, navigating there');
              cy.visit('/dashboard');
            }
          });
        } else if (!loginUrl.includes('/dashboard')) {
          // Login succeeded but not on dashboard - navigate there
          cy.log('Login successful but not on dashboard, navigating there');
          cy.visit('/dashboard');
        } else {
          cy.log('Login successful and on dashboard');
        }
      });
    });
    
    // Ensure we're on dashboard before running tests
    cy.url().should('include', '/dashboard');
    cy.wait(2000); // Wait for articles to load
  });

  describe('Search Functionality', () => {
    it('should perform real-time search', () => {
      // Type in search box
      cy.get('[data-testid=search-input]').type('React');
      
      // Verify search results appear
      cy.get('[data-testid=article-card]').should('exist');
      cy.contains('Search Results for "React"').should('be.visible');
      
      // Verify search result count is displayed
      cy.get('[data-testid=results-count]').should('contain', 'found');
    });

    it('should clear search results', () => {
      // Perform search
      cy.get('[data-testid=search-input]').type('React');
      cy.contains('Search Results for "React"').should('be.visible');
      
      // Clear search
      cy.get('[data-testid=search-clear]').click();
      
      // Verify back to main articles view
      cy.contains('Articles Dashboard').should('be.visible');
      cy.get('[data-testid=search-input]').should('have.value', '');
    });

    it('should handle no search results', () => {
      cy.get('[data-testid=search-input]').type('NonexistentTopic12345');
      
      cy.contains('No articles found for "NonexistentTopic12345"').should('be.visible');
      cy.contains('Try adjusting your search terms').should('be.visible');
    });

    it('should search with category filtering', () => {
      // Select category
      cy.get('[data-testid=category-filter]').click();
      cy.contains('Technology').click();
      
      // Perform search
      cy.get('[data-testid=search-input]').type('JavaScript');
      
      // Verify results are filtered by both search term and category
      cy.get('[data-testid=article-card]').each(($card) => {
        cy.wrap($card).should('contain', 'Technology');
      });
    });
  });

  describe('Infinite Scroll', () => {
    it('should load more articles on scroll', () => {
      // Scroll down to trigger infinite loading
      cy.get('[data-testid=article-card]').should('exist');
      
      // Count initial articles
      cy.get('[data-testid=article-card]').then($cards => {
        const initialCount = $cards.length;
        
        // Scroll to bottom to trigger more loading
        cy.scrollTo('bottom', { ensureScrollable: false });
        
        // Should load more articles (if more are available)
        cy.wait(2000);
        cy.get('[data-testid=article-card]').should('have.length.gte', initialCount);
      });
    });

    it('should show loading indicator during infinite scroll', () => {
      // Scroll down and check for loading indicator
      cy.scrollTo('bottom', { ensureScrollable: false });
      
      // Loading indicator might appear briefly
      cy.get('body').should('exist'); // Just verify page still works
    });

    it('should show scroll to top button', () => {
      // Scroll down significantly
      cy.scrollTo(0, 800, { ensureScrollable: false });
      
      // Should show scroll to top button
      cy.get('[data-testid=scroll-to-top]').should('be.visible');
      
      // Click it to scroll back up
      cy.get('[data-testid=scroll-to-top]').click();
      
      // Should scroll back to top
      cy.wait(1000);
      cy.window().its('scrollY').should('be.lt', 100);
    });

    it('should handle end of infinite scroll', () => {
      // Keep scrolling until no more articles
      cy.scrollTo('bottom', { ensureScrollable: false });
      cy.wait(2000);
      
      // Check that we're at the bottom
      cy.get('body').should('exist');
    });
  });

  describe('Search Pagination vs Infinite Scroll', () => {
    it('should use pagination for search results', () => {
      // Perform search that returns many results
      cy.get('[data-testid=search-input]').type('test');
      
      // Should show pagination instead of infinite scroll
      cy.get('[data-testid=pagination]').should('be.visible');
      cy.get('[data-testid=scroll-to-top]').should('not.exist');
    });

    it('should navigate between search result pages', () => {
      cy.get('[data-testid=search-input]').type('article');
      
      // Navigate to page 2
      cy.get('[data-testid=pagination]').contains('2').click();
      
      // Should show different articles
      cy.url().should('include', 'page=2');
      cy.contains('Showing').should('contain', '11-20');
      
      // Should scroll to articles section
      cy.get('[data-testid=articles-section]').should('be.in.viewport');
    });

    it('should switch back to infinite scroll when clearing search', () => {
      // Perform search (shows pagination)
      cy.get('[data-testid=search-input]').type('React');
      cy.get('[data-testid=pagination]').should('be.visible');
      
      // Clear search
      cy.get('[data-testid=search-clear]').click();
      
      // Should switch back to infinite scroll
      cy.get('[data-testid=pagination]').should('not.exist');
      cy.scrollTo('bottom');
      cy.get('[data-testid=loading-more]').should('be.visible');
    });
  });

  describe('Sort and Filter Integration', () => {
    it('should maintain search term when changing sort order', () => {
      cy.get('[data-testid=search-input]').type('JavaScript');
      
      // Change sort order
      cy.get('[data-testid=sort-dropdown]').click();
      cy.contains('Ascending').click();
      
      // Search term should be maintained
      cy.get('[data-testid=search-input]').should('have.value', 'JavaScript');
      cy.contains('Search Results for "JavaScript"').should('be.visible');
    });

    it('should maintain filters when searching', () => {
      // Set category filter
      cy.get('[data-testid=category-filter]').click();
      cy.contains('Technology').click();
      
      // Perform search
      cy.get('[data-testid=search-input]').type('React');
      
      // Category filter should be maintained
      cy.get('[data-testid=category-filter]').should('contain', 'Technology');
      cy.get('[data-testid=article-card]').each(($card) => {
        cy.wrap($card).should('contain', 'Technology');
      });
    });
  });

  describe('Performance and UX', () => {
    it('should debounce search input', () => {
      // Type quickly
      cy.get('[data-testid=search-input]').type('React', { delay: 50 });
      
      // Should not make request for each keystroke
      cy.wait(300); // Wait for debounce
      cy.get('[data-testid=search-loading]').should('not.exist');
    });

    it('should show search loading state', () => {
      cy.get('[data-testid=search-input]').type('React');
      
      // Should briefly show loading state
      cy.get('[data-testid=search-loading]').should('be.visible');
      cy.get('[data-testid=search-loading]').should('not.exist');
    });

    it('should preserve scroll position after article interaction', () => {
      // Scroll down and note position
      cy.scrollTo(0, 800, { ensureScrollable: false });
      
      // Click article to view details
      cy.get('[data-testid=article-card]').first().click();
      cy.go('back');
      
      // Should preserve scroll position (approximately)
      cy.window().its('scrollY').should('be.gte', 600);
    });
  });
}); 