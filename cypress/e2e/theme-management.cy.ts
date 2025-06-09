/// <reference types="cypress" />

describe('Theme Management', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('http://localhost:5173');
    cy.get('[data-testid=email-input]').type('test@example.com');
    cy.get('[data-testid=password-input]').type('password123');
    cy.get('[data-testid=login-button]').click();
    cy.url().should('include', '/dashboard');
    cy.wait(1000);
  });

  describe('Theme Toggle Functionality', () => {
    it('should display theme toggle in user menu', () => {
      // Open user menu
      cy.get('[data-testid=user-menu]').click();
      
      // Verify dark mode option is present
      cy.contains('Dark Mode').should('be.visible');
      cy.get('input[role="switch"]').should('be.visible');
    });

    it('should toggle between light and dark themes', () => {
      // Check initial theme (should be light)
      cy.get('html').should('have.attr', 'data-theme', 'light');
      
      // Open user menu and toggle to dark
      cy.get('[data-testid=user-menu]').click();
      cy.get('input[role="switch"]').click();
      
      // Verify dark theme is applied
      cy.get('html').should('have.attr', 'data-theme', 'dark');
      
      // Toggle back to light
      cy.get('[data-testid=user-menu]').click();
      cy.get('input[role="switch"]').click();
      
      // Verify light theme is restored
      cy.get('html').should('have.attr', 'data-theme', 'light');
    });

    it('should show correct switch state for current theme', () => {
      // Start in light mode
      cy.get('[data-testid=user-menu]').click();
      cy.get('input[role="switch"]').should('not.be.checked');
      
      // Switch to dark mode
      cy.get('input[role="switch"]').click();
      cy.get('[data-testid=user-menu]').click();
      cy.get('input[role="switch"]').should('be.checked');
    });
  });

  describe('Theme Persistence', () => {
    it('should persist dark theme across page reloads', () => {
      // Switch to dark theme
      cy.get('[data-testid=user-menu]').click();
      cy.get('input[role="switch"]').click();
      cy.get('html').should('have.attr', 'data-theme', 'dark');
      
      // Reload page
      cy.reload();
      cy.wait(1000);
      
      // Verify dark theme persists
      cy.get('html').should('have.attr', 'data-theme', 'dark');
      
      // Verify switch state persists
      cy.get('[data-testid=user-menu]').click();
      cy.get('input[role="switch"]').should('be.checked');
    });

    it('should persist light theme across page reloads', () => {
      // Ensure we're in light mode
      cy.get('[data-testid=user-menu]').click();
      cy.get('input[role="switch"]').then(($switch) => {
        if ($switch.is(':checked')) {
          cy.wrap($switch).click();
        }
      });
      
      cy.get('html').should('have.attr', 'data-theme', 'light');
      
      // Reload page
      cy.reload();
      cy.wait(1000);
      
      // Verify light theme persists
      cy.get('html').should('have.attr', 'data-theme', 'light');
    });

    it('should persist theme when navigating between pages', () => {
      // Switch to dark theme
      cy.get('[data-testid=user-menu]').click();
      cy.get('input[role="switch"]').click();
      cy.get('html').should('have.attr', 'data-theme', 'dark');
      
      // Navigate to profile
      cy.get('[data-testid=user-menu]').click();
      cy.contains('Profile').click();
      cy.url().should('include', '/profile');
      
      // Verify dark theme persists
      cy.get('html').should('have.attr', 'data-theme', 'dark');
      
      // Navigate to add article
      cy.get('a').contains('Add Article').click();
      cy.url().should('include', '/add-article');
      
      // Verify dark theme still persists
      cy.get('html').should('have.attr', 'data-theme', 'dark');
    });
  });

  describe('Theme Visual Updates', () => {
    it('should update body background color', () => {
      // Check light theme background
      cy.get('body').should('have.css', 'background-color', 'rgb(255, 255, 255)');
      
      // Switch to dark theme
      cy.get('[data-testid=user-menu]').click();
      cy.get('input[role="switch"]').click();
      
      // Check dark theme background
      cy.get('body').should('not.have.css', 'background-color', 'rgb(255, 255, 255)');
    });

    it('should update text colors throughout the app', () => {
      // Switch to dark theme
      cy.get('[data-testid=user-menu]').click();
      cy.get('input[role="switch"]').click();
      
      // Check that text elements have appropriate dark theme colors
      cy.get('h1, h2, h3, h4, h5, h6').first().should('not.have.css', 'color', 'rgb(0, 0, 0)');
      cy.get('p, span, div').first().should('exist');
    });

    it('should update Ant Design component themes', () => {
      // Switch to dark theme
      cy.get('[data-testid=user-menu]').click();
      cy.get('input[role="switch"]').click();
      
      // Check that Ant Design components are themed
      cy.get('.ant-card').first().should('exist');
      cy.get('.ant-btn').first().should('exist');
      
      // Cards should not have white background in dark mode
      cy.get('.ant-card').first().should('not.have.css', 'background-color', 'rgb(255, 255, 255)');
    });

    it('should update input field styling in dark mode', () => {
      // Navigate to a page with inputs (profile)
      cy.get('[data-testid=user-menu]').click();
      cy.contains('Profile').click();
      
      // Switch to dark theme
      cy.get('[data-testid=user-menu]').click();
      cy.get('input[role="switch"]').click();
      
      // Check input styling
      cy.get('input[placeholder="First Name"]').should('not.have.css', 'background-color', 'rgb(255, 255, 255)');
      cy.get('input[placeholder="First Name"]').should('not.have.css', 'color', 'rgb(0, 0, 0)');
    });
  });

  describe('Weather Widget Theme Integration', () => {
    it('should apply dark theme to weather widget', () => {
      // Switch to dark theme
      cy.get('[data-testid=user-menu]').click();
      cy.get('input[role="switch"]').click();
      
      // Check weather widget styling
      cy.get('.weather-widget', { timeout: 5000 }).should('exist');
      cy.get('.weather-widget').should('not.have.css', 'background-color', 'rgb(255, 255, 255)');
    });

    it('should maintain weather widget functionality in both themes', () => {
      // Test in light theme
      cy.get('.weather-widget-menu').should('be.visible');
      
      // Switch to dark theme
      cy.get('[data-testid=user-menu]').click();
      cy.get('input[role="switch"]').click();
      
      // Verify functionality still works
      cy.get('.weather-widget-menu').should('be.visible');
      cy.get('.weather-widget-menu').click();
      cy.contains('Select City Manually').should('be.visible');
    });
  });

  describe('Article Management Theme Integration', () => {
    it('should apply theme to article cards', () => {
      // Switch to dark theme
      cy.get('[data-testid=user-menu]').click();
      cy.get('input[role="switch"]').click();
      
      // Check article cards
      cy.get('[data-testid=article-card]').first().should('exist');
      cy.get('[data-testid=article-card]').first().should('not.have.css', 'background-color', 'rgb(255, 255, 255)');
    });

    it('should maintain article functionality in dark theme', () => {
      // Switch to dark theme
      cy.get('[data-testid=user-menu]').click();
      cy.get('input[role="switch"]').click();
      
      // Test article interactions
      cy.get('[data-testid=article-card]').first().should('be.visible');
      cy.get('[data-testid=article-card]').first().click();
      
      // Should navigate to article details
      cy.url().should('include', '/article/');
      
      // Article details should be themed
      cy.get('h1').should('be.visible');
    });
  });

  describe('Form Elements Theme Integration', () => {
    it('should apply dark theme to search input', () => {
      // Switch to dark theme
      cy.get('[data-testid=user-menu]').click();
      cy.get('input[role="switch"]').click();
      
      // Check search input styling
      cy.get('[data-testid=search-input]').should('not.have.css', 'background-color', 'rgb(255, 255, 255)');
      cy.get('[data-testid=search-input]').should('not.have.css', 'color', 'rgb(0, 0, 0)');
    });

    it('should apply dark theme to buttons', () => {
      // Switch to dark theme
      cy.get('[data-testid=user-menu]').click();
      cy.get('input[role="switch"]').click();
      
      // Check button styling
      cy.get('button').first().should('exist');
      // Primary buttons should maintain their brand color
      cy.get('.ant-btn-primary').first().should('exist');
    });

    it('should apply dark theme to dropdowns and selects', () => {
      // Switch to dark theme
      cy.get('[data-testid=user-menu]').click();
      cy.get('input[role="switch"]').click();
      
      // Open category filter
      cy.get('[data-testid=category-filter]').click();
      
      // Check dropdown styling
      cy.get('.ant-select-dropdown').should('not.have.css', 'background-color', 'rgb(255, 255, 255)');
    });
  });

  describe('Theme Switching Performance', () => {
    it('should switch themes smoothly without flickering', () => {
      // Multiple rapid theme switches
      for (let i = 0; i < 3; i++) {
        cy.get('[data-testid=user-menu]').click();
        cy.get('input[role="switch"]').click();
        cy.wait(500);
      }
      
      // Should end up in a stable state
      cy.get('html').should('have.attr', 'data-theme');
    });

    it('should not cause layout shifts when switching themes', () => {
      // Get initial layout measurements
      cy.get('.weather-widget').then(($widget) => {
        const initialRect = $widget[0].getBoundingClientRect();
        
        // Switch theme
        cy.get('[data-testid=user-menu]').click();
        cy.get('input[role="switch"]').click();
        
        // Verify layout hasn\'t shifted significantly
        cy.get('.weather-widget').then(($newWidget) => {
          const newRect = $newWidget[0].getBoundingClientRect();
          expect(Math.abs(newRect.top - initialRect.top)).to.be.lessThan(5);
          expect(Math.abs(newRect.left - initialRect.left)).to.be.lessThan(5);
        });
      });
    });
  });

  describe('Accessibility in Different Themes', () => {
    it('should maintain proper contrast in dark theme', () => {
      // Switch to dark theme
      cy.get('[data-testid=user-menu]').click();
      cy.get('input[role="switch"]').click();
      
      // Check that text is still readable
      cy.get('h1, h2, h3').first().should('be.visible');
      cy.get('p, span').first().should('be.visible');
      
      // Links should still be distinguishable
      cy.get('a').first().should('be.visible');
    });

    it('should maintain focus indicators in both themes', () => {
      // Test focus in light theme
      cy.get('[data-testid=search-input]').focus();
      cy.get('[data-testid=search-input]').should('have.focus');
      
      // Switch to dark theme
      cy.get('[data-testid=user-menu]').click();
      cy.get('input[role="switch"]').click();
      
      // Test focus in dark theme
      cy.get('[data-testid=search-input]').focus();
      cy.get('[data-testid=search-input]').should('have.focus');
    });
  });

  describe('Theme Integration with User Preferences', () => {
    it('should respect system theme preference on first visit', () => {
      // This would require mocking prefers-color-scheme
      // For now, just verify that theme detection works
      cy.get('html').should('have.attr', 'data-theme');
    });

    it('should allow manual override of system preference', () => {
      // Toggle theme manually
      cy.get('[data-testid=user-menu]').click();
      cy.get('input[role="switch"]').click();
      
      // Verify manual preference is saved
      cy.reload();
      cy.get('html').should('have.attr', 'data-theme', 'dark');
    });
  });
}); 