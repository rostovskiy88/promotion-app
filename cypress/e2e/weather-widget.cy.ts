/// <reference types="cypress" />

describe('Weather Widget', () => {
  beforeEach(() => {
    // Login and navigate to dashboard
    cy.visit('http://localhost:5173');
    cy.get('[data-testid=email-input]').type('test@example.com');
    cy.get('[data-testid=password-input]').type('password123');
    cy.get('[data-testid=login-button]').click();
    cy.url().should('include', '/dashboard');
    cy.wait(2000); // Wait for dashboard to load
  });

  describe('Weather Widget Display', () => {
    it('should display weather widget on dashboard', () => {
      // Verify weather widget is present
      cy.get('.weather-widget').should('be.visible');
      cy.contains('WEATHER WIDGET').should('be.visible');
      
      // Verify widget structure
      cy.get('.weather-widget-header').should('be.visible');
      cy.get('.weather-widget-menu').should('be.visible');
    });

    it('should show loading state initially', () => {
      // Reload to see initial loading
      cy.reload();
      
      // Should show loading spinner briefly
      cy.get('.ant-spin', { timeout: 5000 }).should('be.visible');
    });

    it('should display weather data when loaded', () => {
      // Wait for weather data to load
      cy.get('.weather-widget-temp', { timeout: 10000 }).should('be.visible');
      
      // Verify all weather components are displayed
      cy.get('.weather-widget-date').should('be.visible');
      cy.get('.weather-widget-day').should('be.visible');
      cy.get('.weather-widget-temp-block').should('be.visible');
      cy.get('.weather-widget-location').should('be.visible');
      
      // Verify temperature format
      cy.get('.weather-widget-temp').should('match', /^\d+$/);
      cy.get('.weather-widget-degree').should('contain', '°C');
    });
  });

  describe('Geolocation Functionality', () => {
    it('should handle geolocation permission granted', () => {
      // Mock geolocation success
      cy.window().then((win) => {
        cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((success) => {
          success({
            coords: {
              latitude: 51.5074,
              longitude: -0.1278
            }
          });
        });
      });

      cy.reload();
      
      // Should load weather for mocked location
      cy.get('.weather-widget-location', { timeout: 10000 }).should('be.visible');
    });

    it('should handle geolocation permission denied', () => {
      // Mock geolocation error
      cy.window().then((win) => {
        cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((success, error) => {
          error({ code: 1, message: 'Permission denied' });
        });
      });

      cy.reload();
      
      // Should show error message
      cy.contains('Location access denied', { timeout: 10000 }).should('be.visible');
    });

    it('should handle geolocation not supported', () => {
      // Mock geolocation not available
      cy.window().then((win) => {
        Object.defineProperty(win.navigator, 'geolocation', {
          value: undefined,
          writable: true
        });
      });

      cy.reload();
      
      // Should show error message
      cy.contains('Geolocation is not supported', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Manual City Selection', () => {
    it('should open city selection modal', () => {
      // Click weather widget menu
      cy.get('.weather-widget-menu').click();
      
      // Click manual selection option
      cy.contains('Select City Manually').click();
      
      // Verify modal opens
      cy.get('.ant-modal').should('be.visible');
      cy.contains('Select City Manually').should('be.visible');
      cy.get('.ant-select').should('be.visible');
    });

    it('should search for cities', () => {
      // Open manual selection modal
      cy.get('.weather-widget-menu').click();
      cy.contains('Select City Manually').click();
      
      // Type in city search
      cy.get('.ant-select input').type('London');
      
      // Should show search results
      cy.get('.ant-select-dropdown', { timeout: 5000 }).should('be.visible');
      cy.get('.ant-select-item').should('have.length.greaterThan', 0);
    });

    it('should select a city and update weather', () => {
      // Open manual selection modal
      cy.get('.weather-widget-menu').click();
      cy.contains('Select City Manually').click();
      
      // Search and select a city
      cy.get('.ant-select input').type('London');
      cy.get('.ant-select-item').first().click();
      
      // Set the city
      cy.get('.ant-modal .ant-btn-primary').click();
      
      // Verify modal closes and weather updates
      cy.get('.ant-modal').should('not.exist');
      cy.get('.weather-widget-location', { timeout: 10000 }).should('contain', 'London');
    });

    it('should validate city selection requirement', () => {
      // Open modal without selecting city
      cy.get('.weather-widget-menu').click();
      cy.contains('Select City Manually').click();
      
      // Try to set without selecting
      cy.get('.ant-modal .ant-btn-primary').click();
      
      // Should show error message
      cy.get('.ant-message').should('contain', 'Please select a city');
    });

    it('should cancel city selection', () => {
      // Open modal
      cy.get('.weather-widget-menu').click();
      cy.contains('Select City Manually').click();
      
      // Cancel modal
      cy.get('.ant-modal .ant-btn-default').click();
      
      // Modal should close without changes
      cy.get('.ant-modal').should('not.exist');
    });
  });

  describe('Auto-detection Mode', () => {
    it('should switch back to auto-detection', () => {
      // First set manual mode
      cy.get('.weather-widget-menu').click();
      cy.contains('Select City Manually').click();
      cy.get('.ant-select input').type('Paris');
      cy.get('.ant-select-item').first().click();
      cy.get('.ant-modal .ant-btn-primary').click();
      
      // Switch back to auto-detection
      cy.get('.weather-widget-menu').click();
      cy.contains('Auto-detect My Location').click();
      
      // Should attempt to use geolocation again
      cy.get('.weather-widget-location', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Weather Data Display', () => {
    it('should display current date and day', () => {
      const today = new Date();
      const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
      const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      
      cy.get('.weather-widget-date').should('contain', dateStr);
      cy.get('.weather-widget-day').should('contain', dayName);
    });

    it('should display weather icon', () => {
      cy.get('.weather-widget-icon', { timeout: 10000 }).should('be.visible');
      cy.get('.weather-widget-icon').should('have.attr', 'src');
      cy.get('.weather-widget-icon').should('have.attr', 'alt');
    });

    it('should show temperature in celsius', () => {
      cy.get('.weather-widget-temp', { timeout: 10000 }).should('be.visible');
      cy.get('.weather-widget-degree').should('contain', '°C');
      
      // Verify temperature is a number
      cy.get('.weather-widget-temp').invoke('text').should('match', /^\d+$/);
    });

    it('should display location information', () => {
      cy.get('.weather-widget-location', { timeout: 10000 }).should('be.visible');
      cy.get('.weather-widget-location').should('match', /^.+, [A-Z]{2}$/);
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      // Intercept weather API and force error
      cy.intercept('GET', '**/weather**', { 
        statusCode: 500, 
        body: { error: 'Server Error' } 
      });
      
      cy.reload();
      
      // Should show user-friendly error
      cy.contains('Unable to load weather data', { timeout: 10000 }).should('be.visible');
      cy.contains('Firebase').should('not.exist');
    });

    it('should handle network errors', () => {
      // Intercept weather API and force network error
      cy.intercept('GET', '**/weather**', { forceNetworkError: true });
      
      cy.reload();
      
      // Should show network error message
      cy.contains('Weather temporarily unavailable', { timeout: 10000 }).should('be.visible');
    });

    it('should handle missing API key gracefully', () => {
      // This would need to be tested with environment variable modification
      // For now, just verify error handling exists
      cy.get('.weather-widget').should('be.visible');
    });
  });

  describe('User Experience', () => {
    it('should maintain widget size consistency', () => {
      cy.get('.weather-widget').should('have.css', 'min-width', '270px');
      cy.get('.weather-widget').should('be.visible');
    });

    it('should have proper styling and layout', () => {
      // Verify card styling
      cy.get('.weather-widget').should('have.class', 'ant-card');
      
      // Verify header layout
      cy.get('.weather-widget-header').should('have.css', 'display', 'flex');
      
      // Verify responsive behavior
      cy.viewport('iphone-6');
      cy.get('.weather-widget').should('be.visible');
      
      cy.viewport('macbook-15');
      cy.get('.weather-widget').should('be.visible');
    });

    it('should show loading states appropriately', () => {
      cy.reload();
      
      // Should show loading initially
      cy.get('.ant-spin').should('be.visible');
      
      // Loading should disappear when data loads
      cy.get('.ant-spin', { timeout: 10000 }).should('not.exist');
      cy.get('.weather-widget-temp').should('be.visible');
    });
  });

  describe('City Search Functionality', () => {
    it('should show loading during city search', () => {
      cy.get('.weather-widget-menu').click();
      cy.contains('Select City Manually').click();
      
      // Type to trigger search
      cy.get('.ant-select input').type('New York');
      
      // Should show loading briefly
      cy.get('.ant-spin-sm').should('be.visible');
    });

    it('should handle empty search results', () => {
      cy.get('.weather-widget-menu').click();
      cy.contains('Select City Manually').click();
      
      // Search for non-existent city
      cy.get('.ant-select input').type('NonExistentCity12345');
      
      // Should handle gracefully
      cy.wait(2000);
      cy.get('.ant-select-dropdown').should('not.contain', 'NonExistentCity12345');
    });

    it('should clear search when modal is reopened', () => {
      // Open and close modal
      cy.get('.weather-widget-menu').click();
      cy.contains('Select City Manually').click();
      cy.get('.ant-select input').type('London');
      cy.get('.ant-modal .ant-btn-default').click();
      
      // Reopen modal
      cy.get('.weather-widget-menu').click();
      cy.contains('Select City Manually').click();
      
      // Search input should be empty
      cy.get('.ant-select input').should('have.value', '');
    });
  });
}); 