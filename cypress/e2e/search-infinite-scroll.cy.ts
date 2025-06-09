/// <reference types="cypress" />

describe('Search & Infinite Scroll', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('http://localhost:5173');
    cy.get('[data-testid=email-input]').type('test@example.com');
    cy.get('[data-testid=password-input]').type('password123');
    cy.get('[data-testid=login-button]').click();
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
      // Count initial articles
      cy.get('[data-testid=article-card]').then(($articles) => {
        const initialCount = $articles.length;
        
        // Scroll to bottom
        cy.scrollTo('bottom');
        
        // Wait for more articles to load
        cy.wait(2000);
        
        // Verify more articles loaded
        cy.get('[data-testid=article-card]').should('have.length.greaterThan', initialCount);
      });
    });

    it('should show loading indicator during infinite scroll', () => {
      cy.scrollTo('bottom');
      
      // Should show loading indicator
      cy.get('[data-testid=loading-more]').should('be.visible');
      cy.contains('Loading more articles...').should('be.visible');
    });

    it('should show scroll to top button', () => {
      // Scroll down significantly
      cy.scrollTo(0, 1000);
      
      // Scroll to top button should appear
      cy.get('[data-testid=scroll-to-top]').should('be.visible');
      
      // Click scroll to top
      cy.get('[data-testid=scroll-to-top]').click();
      
      // Should scroll back to top
      cy.window().its('scrollY').should('eq', 0);
    });

    it('should handle end of infinite scroll', () => {
      // Scroll multiple times to reach end
      for (let i = 0; i < 5; i++) {
        cy.scrollTo('bottom');
        cy.wait(1000);
      }
      
      // Should show "no more articles" message or stop loading
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid=no-more-articles]').length > 0) {
          cy.get('[data-testid=no-more-articles]').should('be.visible');
        } else {
          cy.get('[data-testid=loading-more]').should('not.exist');
        }
      });
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
      cy.scrollTo(0, 800);
      
      // Click article to view details
      cy.get('[data-testid=article-card]').first().click();
      cy.go('back');
      
      // Should preserve scroll position (approximately)
      cy.window().its('scrollY').should('be.gte', 600);
    });
  });
}); 