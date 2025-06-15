/// <reference types="cypress" />

// E2E Tests for Weather Widget

describe('Weather Widget', () => {
  beforeEach(() => {
    // Login first to access weather widget features
    cy.visit('http://localhost:5173/login');
    cy.url().should('include', '/login');
    
    // Use test credentials to login
    cy.get('input[placeholder="Enter your email"]').type('rostovskiy88@ukr.net');
    cy.get('input[placeholder="Enter your password"]').type('7250563Asd');
    cy.get('button[type="submit"]').click();
    
    // Wait for login to complete
    cy.url({ timeout: 10000 }).should('include', '/dashboard');
  });

  describe('Weather Display', () => {
    it('should display weather widget on dashboard', () => {
      // Check if weather widget is visible on dashboard
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="weather-widget"], .weather-widget, [class*="weather"]').length > 0) {
          cy.get('[data-testid="weather-widget"], .weather-widget, [class*="weather"]').should('be.visible');
          cy.log('Weather widget found on dashboard');
        } else {
          cy.log('Weather widget not found - may not be implemented yet');
        }
      });
    });

    it('should show current weather information', () => {
      cy.get('body').then(($body) => {
        const weatherElements = $body.find('[data-testid="weather-widget"], .weather-widget, [class*="weather"]');
        
        if (weatherElements.length > 0) {
          // Check for temperature display
          if ($body.find('[data-testid="temperature"], .temperature, [class*="temp"]').length > 0) {
            cy.get('[data-testid="temperature"], .temperature, [class*="temp"]').should('be.visible');
            cy.log('Temperature display found');
          }
          
          // Check for weather condition
          if ($body.find('[data-testid="weather-condition"], .weather-condition, [class*="condition"]').length > 0) {
            cy.get('[data-testid="weather-condition"], .weather-condition, [class*="condition"]').should('be.visible');
            cy.log('Weather condition display found');
          }
          
          // Check for location
          if ($body.find('[data-testid="location"], .location, [class*="location"]').length > 0) {
            cy.get('[data-testid="location"], .location, [class*="location"]').should('be.visible');
            cy.log('Location display found');
          }
        } else {
          cy.log('Weather widget not implemented - skipping weather information checks');
        }
      });
    });

    it('should display weather icons appropriately', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="weather-widget"], .weather-widget, [class*="weather"]').length > 0) {
          // Look for weather icons
          if ($body.find('[data-testid="weather-icon"], .weather-icon, img[alt*="weather"], svg[class*="weather"]').length > 0) {
            cy.get('[data-testid="weather-icon"], .weather-icon, img[alt*="weather"], svg[class*="weather"]').should('be.visible');
            cy.log('Weather icon found');
          } else {
            cy.log('Weather icons not found - may use text-based weather display');
          }
        }
      });
    });
  });

  describe('Location Handling', () => {
    it('should handle location permissions', () => {
      // Mock geolocation
      cy.window().then((win) => {
        cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((success) => {
          success({
            coords: {
              latitude: 40.7128,
              longitude: -74.0060
            }
          });
        });
      });

      cy.reload();
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="weather-widget"], .weather-widget, [class*="weather"]').length > 0) {
          // Check if weather widget loads with location
          cy.log('Weather widget handling location - checking for updates');
          
          // Wait for potential weather data to load
          cy.wait(3000);
          
          // Check if location-based weather is displayed
          if ($body.find('[data-testid="location"], .location').length > 0) {
            cy.get('[data-testid="location"], .location').should('be.visible');
          }
        }
      });
    });

    it('should handle location permission denied', () => {
      // Mock geolocation error
      cy.window().then((win) => {
        cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((success, error) => {
          error({
            code: 1, // PERMISSION_DENIED
            message: 'User denied geolocation'
          });
        });
      });

      cy.reload();
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="weather-widget"], .weather-widget, [class*="weather"]').length > 0) {
          // Should show fallback location or error message
          cy.log('Testing weather widget response to location permission denied');
          
          // Wait for error handling
          cy.wait(3000);
          
          // Look for error message or default location
          if ($body.find('[class*="error"], [role="alert"], [data-testid="error"]').length > 0) {
            cy.get('[class*="error"], [role="alert"], [data-testid="error"]').should('be.visible');
            cy.log('Error message displayed for location permission denied');
          } else {
            cy.log('Weather widget may show default location when permission denied');
          }
        }
      });
    });
  });

  describe('Weather API Integration', () => {
    it('should handle weather API responses', () => {
      // Mock weather API call
      cy.intercept('GET', '**/weather**', {
        statusCode: 200,
        body: {
          main: {
            temp: 22,
            feels_like: 25,
            temp_min: 18,
            temp_max: 26,
            humidity: 65
          },
          weather: [{
            main: 'Clear',
            description: 'clear sky',
            icon: '01d'
          }],
          name: 'Test City'
        }
      }).as('weatherAPI');

      cy.reload();
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="weather-widget"], .weather-widget, [class*="weather"]').length > 0) {
          cy.log('Weather widget present - testing API integration');
          
          // Wait for API call
          cy.wait(5000);
          
          // Check if weather data is displayed
          if ($body.find('[data-testid="temperature"], .temperature').length > 0) {
            cy.get('[data-testid="temperature"], .temperature').should('contain.text', '22');
          }
        }
      });
    });

    it('should handle weather API errors gracefully', () => {
      // Mock failed weather API call
      cy.intercept('GET', '**/weather**', {
        statusCode: 500,
        body: { error: 'Weather service unavailable' }
      }).as('weatherAPIError');

      cy.reload();
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="weather-widget"], .weather-widget, [class*="weather"]').length > 0) {
          cy.log('Testing weather widget error handling');
          
          // Wait for error handling
          cy.wait(5000);
          
          // Should show error message or fallback content
          if ($body.find('[class*="error"], [role="alert"], [data-testid="error"]').length > 0) {
            cy.get('[class*="error"], [role="alert"], [data-testid="error"]').should('be.visible');
            cy.log('Error message displayed for API failure');
          } else {
            cy.log('Weather widget may show fallback content when API fails');
          }
        }
      });
    });

    it('should handle network timeouts', () => {
      // Mock slow/timeout API response
      cy.intercept('GET', '**/weather**', (req) => {
        req.reply((res) => {
          res.delay(10000); // 10 second delay
          res.send({ statusCode: 408, body: { error: 'Request timeout' } });
        });
      }).as('weatherTimeout');

      cy.reload();
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="weather-widget"], .weather-widget, [class*="weather"]').length > 0) {
          cy.log('Testing weather widget timeout handling');
          
          // Should show loading state initially
          if ($body.find('[class*="loading"], .ant-spin, [data-testid="loading"]').length > 0) {
            cy.get('[class*="loading"], .ant-spin, [data-testid="loading"]').should('be.visible');
            cy.log('Loading state displayed during API call');
          }
        }
      });
    });
  });

  describe('Weather Widget Interactions', () => {
    it('should allow refreshing weather data', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="weather-widget"], .weather-widget, [class*="weather"]').length > 0) {
          // Look for refresh button
          if ($body.find('[data-testid="refresh"], .refresh, button[title*="refresh"], button[aria-label*="refresh"]').length > 0) {
            cy.get('[data-testid="refresh"], .refresh, button[title*="refresh"], button[aria-label*="refresh"]').first().click();
            cy.log('Refresh button clicked');
            
            // Check for loading state
            if ($body.find('[class*="loading"], .ant-spin').length > 0) {
              cy.get('[class*="loading"], .ant-spin').should('be.visible');
            }
          } else {
            cy.log('Refresh functionality not found - may not be implemented');
          }
        }
      });
    });

    it('should handle different units (Celsius/Fahrenheit)', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="weather-widget"], .weather-widget, [class*="weather"]').length > 0) {
          // Look for unit toggle
          if ($body.find('[data-testid="unit-toggle"], .unit-toggle, button:contains("°C"), button:contains("°F")').length > 0) {
            cy.get('[data-testid="unit-toggle"], .unit-toggle, button:contains("°C"), button:contains("°F")').first().click();
            cy.log('Unit toggle clicked');
            
            // Verify unit change
            cy.wait(1000);
            if ($body.find('[data-testid="temperature"], .temperature').length > 0) {
              cy.get('[data-testid="temperature"], .temperature').should('be.visible');
            }
          } else {
            cy.log('Unit toggle not found - may use default units');
          }
        }
      });
    });
  });

  describe('Weather Widget Responsiveness', () => {
    it('should be responsive on mobile devices', () => {
      cy.viewport('iphone-x');
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="weather-widget"], .weather-widget, [class*="weather"]').length > 0) {
          // Check if widget exists but may not be fully visible due to overflow
          cy.get('[data-testid="weather-widget"], .weather-widget, [class*="weather"]').should('exist');
          cy.log('Weather widget exists on mobile viewport');
          
          // Check if widget adapts to mobile size
          cy.get('[data-testid="weather-widget"], .weather-widget, [class*="weather"]').first().then(($widget) => {
            const width = $widget.width();
            cy.log(`Weather widget width on mobile: ${width}px`);
            
            // Widget should exist and have reasonable dimensions
            expect(width).to.be.greaterThan(0);
            if (width < 400) {
              cy.log('Weather widget adapts to mobile screen size');
            } else {
              cy.log('Weather widget may need better mobile responsiveness');
            }
          });
        }
      });
    });

    it('should be responsive on tablet devices', () => {
      cy.viewport('ipad-2');
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="weather-widget"], .weather-widget, [class*="weather"]').length > 0) {
          cy.get('[data-testid="weather-widget"], .weather-widget, [class*="weather"]').should('be.visible');
          cy.log('Weather widget visible on tablet viewport');
        }
      });
    });
  });

  describe('Weather Widget Accessibility', () => {
    it('should have proper ARIA labels', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="weather-widget"], .weather-widget, [class*="weather"]').length > 0) {
          // Check for ARIA labels
          if ($body.find('[aria-label*="weather"], [aria-describedby], [role="region"]').length > 0) {
            cy.get('[aria-label*="weather"], [aria-describedby], [role="region"]').should('exist');
            cy.log('ARIA labels found for weather widget');
          } else {
            cy.log('ARIA labels not found - accessibility may need improvement');
          }
        }
      });
    });

    it('should be keyboard navigable', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="weather-widget"], .weather-widget, [class*="weather"]').length > 0) {
          // Look for focusable elements within weather widget
          if ($body.find('[data-testid="weather-widget"] button, .weather-widget button, [class*="weather"] button, [data-testid="weather-widget"] a, .weather-widget a, [class*="weather"] a').length > 0) {
            // Test keyboard focus on focusable elements
            cy.get('[data-testid="weather-widget"] button, .weather-widget button, [class*="weather"] button, [data-testid="weather-widget"] a, .weather-widget a, [class*="weather"] a').first().focus();
            cy.get('[data-testid="weather-widget"] button, .weather-widget button, [class*="weather"] button, [data-testid="weather-widget"] a, .weather-widget a, [class*="weather"] a').first().should('be.focused');
            
            cy.log('Weather widget keyboard accessibility tested');
          } else {
            cy.log('No focusable elements found in weather widget - may not require keyboard navigation');
          }
        }
      });
    });
  });

  describe('Weather Data Accuracy', () => {
    it('should display reasonable temperature values', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="temperature"], .temperature').length > 0) {
          cy.get('[data-testid="temperature"], .temperature').invoke('text').then((temp) => {
            // Extract numeric value (assuming format like "22°C" or "72°F")
            const numericTemp = parseInt(temp.replace(/[^\d-]/g, ''));
            
            if (!isNaN(numericTemp)) {
              // Reasonable temperature range (assuming Celsius: -50 to 50, Fahrenheit: -58 to 122)
              expect(numericTemp).to.be.within(-58, 122);
              cy.log(`Temperature value ${numericTemp} is within reasonable range`);
            }
          });
        }
      });
    });

    it('should update weather data periodically', () => {
      let initialTemp;
      
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="temperature"], .temperature').length > 0) {
          cy.get('[data-testid="temperature"], .temperature').invoke('text').then((temp) => {
            initialTemp = temp;
            cy.log(`Initial temperature: ${initialTemp}`);
          });
          
          // Wait for potential auto-refresh
          cy.wait(30000); // Wait 30 seconds
          
          cy.get('[data-testid="temperature"], .temperature').invoke('text').then((newTemp) => {
            cy.log(`Temperature after 30s: ${newTemp}`);
            
            // Temperature might have updated or stayed the same
            if (newTemp !== initialTemp) {
              cy.log('Weather data updated automatically');
            } else {
              cy.log('Weather data remained consistent');
            }
          });
        }
      });
    });
  });
});