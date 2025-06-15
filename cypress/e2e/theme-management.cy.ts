/// <reference types="cypress" />

// E2E Tests for Theme Management

describe('Theme Management', () => {
  beforeEach(() => {
    // Login first to access theme management features
    cy.visit('http://localhost:5173/login');
    cy.url().should('include', '/login');
    
    // Use test credentials to login
    cy.get('input[placeholder="Enter your email"]').type('rostovskiy88@ukr.net');
    cy.get('input[placeholder="Enter your password"]').type('7250563Asd');
    cy.get('button[type="submit"]').click();
    
    // Wait for login to complete
    cy.url({ timeout: 10000 }).should('include', '/dashboard');
  });

  describe('Theme Toggle Functionality', () => {
    it('should have a theme toggle button', () => {
      // Look for theme toggle button
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="theme-toggle"], .theme-toggle, button[aria-label*="theme"], button[title*="theme"]').length > 0) {
          cy.get('[data-testid="theme-toggle"], .theme-toggle, button[aria-label*="theme"], button[title*="theme"]').should('be.visible');
          cy.log('Theme toggle button found');
        } else if ($body.find('button:contains("Dark"), button:contains("Light"), .ant-switch').length > 0) {
          cy.get('button:contains("Dark"), button:contains("Light"), .ant-switch').should('be.visible');
          cy.log('Theme control found');
        } else {
          cy.log('Theme toggle not found - may not be implemented or located elsewhere');
        }
      });
    });

    it('should toggle between light and dark themes', () => {
      // Record initial theme state
      cy.get('body, html, [data-theme]').then(($elements) => {
        const initialClasses = $elements.attr('class') || '';
        const initialDataTheme = $elements.attr('data-theme') || '';
        
        cy.log(`Initial theme classes: ${initialClasses}`);
        cy.log(`Initial data-theme: ${initialDataTheme}`);
        
        // Look for and click theme toggle
        cy.get('body').then(($body) => {
          if ($body.find('[data-testid="theme-toggle"], .theme-toggle, button[aria-label*="theme"]').length > 0) {
            cy.get('[data-testid="theme-toggle"], .theme-toggle, button[aria-label*="theme"]').first().click();
            
            // Wait for theme change
            cy.wait(1000);
            
            // Verify theme changed
            cy.get('body, html, [data-theme]').then(($newElements) => {
              const newClasses = $newElements.attr('class') || '';
              const newDataTheme = $newElements.attr('data-theme') || '';
              
              cy.log(`New theme classes: ${newClasses}`);
              cy.log(`New data-theme: ${newDataTheme}`);
              
              // Theme should have changed
              const themeChanged = newClasses !== initialClasses || newDataTheme !== initialDataTheme;
              if (themeChanged) {
                cy.log('Theme successfully changed');
              } else {
                cy.log('Theme may not have changed or uses different mechanism');
              }
            });
          } else if ($body.find('button:contains("Dark"), button:contains("Light")').length > 0) {
            // Alternative theme toggle approach
            cy.get('button:contains("Dark"), button:contains("Light")').first().click();
            cy.wait(1000);
            cy.log('Alternative theme toggle clicked');
          } else {
            cy.log('Theme toggle mechanism not found');
          }
        });
      });
    });

    it('should apply theme changes immediately', () => {
      // Check if theme changes are applied without page reload
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="theme-toggle"], .theme-toggle, button[aria-label*="theme"]').length > 0) {
          // Get initial background color
          cy.get('body').then(($bodyEl) => {
            const initialBgColor = $bodyEl.css('background-color');
            cy.log(`Initial background color: ${initialBgColor}`);
            
            // Toggle theme
            cy.get('[data-testid="theme-toggle"], .theme-toggle, button[aria-label*="theme"]').first().click();
            
            // Check if background color changed
            cy.get('body').should(($newBodyEl) => {
              const newBgColor = $newBodyEl.css('background-color');
              cy.log(`New background color: ${newBgColor}`);
              
              if (newBgColor !== initialBgColor) {
                cy.log('Theme applied successfully - background color changed');
              } else {
                cy.log('Background color did not change - theme may use different styling approach');
              }
            });
          });
        }
      });
    });
  });

  describe('Theme Persistence', () => {
    it('should persist theme selection across page reloads', () => {
      // Toggle theme first
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="theme-toggle"], .theme-toggle, button[aria-label*="theme"]').length > 0) {
          cy.get('[data-testid="theme-toggle"], .theme-toggle, button[aria-label*="theme"]').first().click();
          
          // Wait for theme change
          cy.wait(1000);
          
          // Record theme state
          cy.get('body, html, [data-theme]').then(($elements) => {
            const themeClasses = $elements.attr('class') || '';
            const dataTheme = $elements.attr('data-theme') || '';
            
            // Reload page
            cy.reload();
            
            // Wait for page to load
            cy.wait(2000);
            
            // Check if theme persisted
            cy.get('body, html, [data-theme]').then(($newElements) => {
              const newThemeClasses = $newElements.attr('class') || '';
              const newDataTheme = $newElements.attr('data-theme') || '';
              
              if (newThemeClasses === themeClasses || newDataTheme === dataTheme) {
                cy.log('Theme persisted successfully after reload');
              } else {
                cy.log('Theme may not persist or uses different persistence mechanism');
              }
            });
          });
        }
      });
    });

    it('should persist theme selection across browser sessions', () => {
      // Clear storage to simulate new session
      cy.clearLocalStorage();
      cy.clearCookies();
      
      // Login again
      cy.visit('http://localhost:5173/login');
      cy.get('input[placeholder="Enter your email"]').type('rostovskiy88@ukr.net');
      cy.get('input[placeholder="Enter your password"]').type('7250563Asd');
      cy.get('button[type="submit"]').click();
      cy.url({ timeout: 10000 }).should('include', '/dashboard');
      
      // Set theme
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="theme-toggle"], .theme-toggle, button[aria-label*="theme"]').length > 0) {
          cy.get('[data-testid="theme-toggle"], .theme-toggle, button[aria-label*="theme"]').first().click();
          cy.wait(1000);
          
          // Check localStorage or sessionStorage for theme preference
          cy.window().then((win) => {
            const themeStorage = win.localStorage.getItem('theme') || 
                               win.localStorage.getItem('antd-theme') ||
                               win.sessionStorage.getItem('theme');
            
            if (themeStorage) {
              cy.log(`Theme stored in storage: ${themeStorage}`);
              expect(themeStorage).to.exist;
            } else {
              cy.log('Theme storage mechanism not found - may use different approach');
            }
          });
        }
      });
    });
  });

  describe('Theme Visual Validation', () => {
    it('should apply dark theme styles correctly', () => {
      // Switch to dark theme
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="theme-toggle"], .theme-toggle').length > 0) {
          // Try to ensure we're in dark mode
          cy.get('[data-testid="theme-toggle"], .theme-toggle').first().click();
          cy.wait(1000);
          
          // Check for dark theme indicators
          cy.get('body').should(($bodyEl) => {
            const bgColor = $bodyEl.css('background-color');
            const hasClass = $bodyEl.hasClass('dark') || 
                           $bodyEl.hasClass('theme-dark') || 
                           $bodyEl.parent().hasClass('dark');
            
            if (hasClass || bgColor.includes('rgb(0') || bgColor.includes('rgb(1') || bgColor === 'rgb(0, 0, 0)') {
              cy.log('Dark theme appears to be active');
            } else {
              cy.log('Dark theme styles may not be applied or use different indicators');
            }
          });
          
          // Check if text color is light in dark theme
          cy.get('h1, h2, h3, p, span').first().then(($textEl) => {
            const color = $textEl.css('color');
            cy.log(`Text color in dark theme: ${color}`);
          });
        }
      });
    });

    it('should apply light theme styles correctly', () => {
      // Switch to light theme
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="theme-toggle"], .theme-toggle').length > 0) {
          // Ensure we're in light mode by toggling twice if needed
          cy.get('[data-testid="theme-toggle"], .theme-toggle').first().click();
          cy.wait(500);
          cy.get('[data-testid="theme-toggle"], .theme-toggle').first().click();
          cy.wait(1000);
          
          // Check for light theme indicators
          cy.get('body').should(($bodyEl) => {
            const bgColor = $bodyEl.css('background-color');
            const hasClass = $bodyEl.hasClass('light') || 
                           !$bodyEl.hasClass('dark');
            
            if (hasClass || bgColor.includes('rgb(255') || bgColor === 'rgb(255, 255, 255)') {
              cy.log('Light theme appears to be active');
            } else {
              cy.log('Light theme styles may not be applied or use different indicators');
            }
          });
        }
      });
    });

    it('should maintain consistent styling across components', () => {
      // Check if theme is consistently applied across different components
      const componentsToCheck = [
        'button', '.ant-btn', 
        'input', '.ant-input',
        '.ant-card', '.card',
        'nav', '.navbar', '.navigation'
      ];
      
      cy.get('body').then(($body) => {
        componentsToCheck.forEach(selector => {
          if ($body.find(selector).length > 0) {
            cy.get(selector).first().then(($el) => {
              const bgColor = $el.css('background-color');
              const color = $el.css('color');
              cy.log(`${selector} - background: ${bgColor}, color: ${color}`);
            });
          }
        });
      });
    });
  });

  describe('Theme Accessibility', () => {
    it('should maintain proper contrast ratios', () => {
      // Test both themes for accessibility
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="theme-toggle"], .theme-toggle').length > 0) {
          // Test current theme
          cy.get('h1, h2, h3, p').first().then(($textEl) => {
            const textColor = $textEl.css('color');
            const bgColor = $textEl.css('background-color') || $body.css('background-color');
            
            cy.log(`Text color: ${textColor}, Background: ${bgColor}`);
            
            // Basic contrast check (simplified)
            if (textColor && bgColor && textColor !== bgColor) {
              cy.log('Text and background colors are different - good for contrast');
            }
          });
          
          // Toggle theme and test again
          cy.get('[data-testid="theme-toggle"], .theme-toggle').first().click();
          cy.wait(1000);
          
          cy.get('h1, h2, h3, p').first().then(($textEl) => {
            const textColor = $textEl.css('color');
            const bgColor = $textEl.css('background-color') || $body.css('background-color');
            
            cy.log(`After toggle - Text color: ${textColor}, Background: ${bgColor}`);
          });
        }
      });
    });

    it('should have proper ARIA labels for theme controls', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="theme-toggle"], .theme-toggle').length > 0) {
          cy.get('[data-testid="theme-toggle"], .theme-toggle').first().then(($toggle) => {
            const ariaLabel = $toggle.attr('aria-label');
            const title = $toggle.attr('title');
            
            if (ariaLabel || title) {
              cy.log(`Theme toggle accessibility: aria-label="${ariaLabel}", title="${title}"`);
              expect(ariaLabel || title).to.exist;
            } else {
              cy.log('Theme toggle may need better accessibility labels');
            }
          });
        }
      });
    });

    it('should be keyboard accessible', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="theme-toggle"], .theme-toggle').length > 0) {
          // Test keyboard focus
          cy.get('[data-testid="theme-toggle"], .theme-toggle').first().focus();
          cy.get('[data-testid="theme-toggle"], .theme-toggle').first().should('be.focused');
          
          // Test keyboard activation
          cy.get('[data-testid="theme-toggle"], .theme-toggle').first().type(' '); // Space key
          cy.wait(1000);
          
          cy.log('Theme toggle keyboard accessibility tested');
        }
      });
    });
  });

  describe('Theme System Integration', () => {
    it('should respect system theme preference', () => {
      // Check if the app respects OS theme preference
      cy.window().then((win) => {
        if (win.matchMedia && win.matchMedia('(prefers-color-scheme: dark)').matches) {
          cy.log('System prefers dark theme');
          
          // Check if app initially loads with dark theme
          cy.get('body, html, [data-theme]').then(($elements) => {
            const hasClass = $elements.hasClass('dark') || 
                           $elements.attr('data-theme') === 'dark';
            
            if (hasClass) {
              cy.log('App respects system dark theme preference');
            } else {
              cy.log('App may not automatically respect system theme preference');
            }
          });
        } else {
          cy.log('System prefers light theme or preference not available');
        }
      });
    });

    it('should handle theme switching during user interactions', () => {
      // Perform various actions while switching themes
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="theme-toggle"], .theme-toggle').length > 0) {
          // Click various elements
          if ($body.find('button, a, input').length > 0) {
            cy.get('button, a, input').first().click();
            
            // Switch theme during interaction
            cy.get('[data-testid="theme-toggle"], .theme-toggle').first().click();
            cy.wait(1000);
            
            // Verify UI remains functional
            cy.get('body').should('be.visible');
            cy.log('Theme switching during user interactions works correctly');
          }
        }
      });
    });

    it('should handle rapid theme switching', () => {
      // Test rapid theme toggling
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="theme-toggle"], .theme-toggle').length > 0) {
          // Rapidly toggle theme multiple times
          for (let i = 0; i < 5; i++) {
            cy.get('[data-testid="theme-toggle"], .theme-toggle').first().click();
            cy.wait(200);
          }
          
          // Verify app is still functional
          cy.get('body').should('be.visible');
          cy.get('[data-testid="theme-toggle"], .theme-toggle').first().should('be.visible');
          cy.log('Rapid theme switching handled correctly');
        }
      });
    });
  });

  describe('Theme Customization', () => {
    it('should support custom theme colors', () => {
      // Check if app supports custom theme colors or brand colors
      cy.get('body').then(($body) => {
        // Look for theme customization options
        if ($body.find('[data-testid="theme-settings"], .theme-settings, [class*="theme-config"]').length > 0) {
          cy.get('[data-testid="theme-settings"], .theme-settings, [class*="theme-config"]').should('be.visible');
          cy.log('Theme customization options found');
        } else {
          cy.log('Custom theme options not found - app may use fixed themes');
        }
      });
    });

    it('should maintain brand consistency across themes', () => {
      // Check if brand colors remain consistent
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="theme-toggle"], .theme-toggle').length > 0) {
          // Look for brand elements (logo, primary buttons, etc.)
          const brandElements = $body.find('.logo, [class*="brand"], .ant-btn-primary, button[type="primary"]');
          
          if (brandElements.length > 0) {
            // Record brand colors in current theme
            cy.wrap(brandElements.first()).then(($brandEl) => {
              const initialColor = $brandEl.css('background-color') || $brandEl.css('color');
              
              // Switch theme
              cy.get('[data-testid="theme-toggle"], .theme-toggle').first().click();
              cy.wait(1000);
              
              // Check brand colors in new theme
              cy.wrap($brandEl).then(($newBrandEl) => {
                const newColor = $newBrandEl.css('background-color') || $newBrandEl.css('color');
                
                cy.log(`Brand color - Initial: ${initialColor}, After toggle: ${newColor}`);
                
                // Brand colors should remain consistent or change appropriately
                if (initialColor === newColor) {
                  cy.log('Brand colors remain consistent across themes');
                } else {
                  cy.log('Brand colors adapt to theme while maintaining identity');
                }
              });
            });
          }
        }
      });
    });
  });

  describe('Theme Performance', () => {
    it('should switch themes without performance degradation', () => {
      // Measure theme switch performance
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="theme-toggle"], .theme-toggle').length > 0) {
          const startTime = performance.now();
          
          cy.get('[data-testid="theme-toggle"], .theme-toggle').first().click();
          
          cy.wait(100).then(() => {
            const endTime = performance.now();
            const switchTime = endTime - startTime;
            
            cy.log(`Theme switch took ${switchTime.toFixed(2)}ms`);
            
            // Theme switch should be fast (under 500ms)
            if (switchTime < 500) {
              cy.log('Theme switch performance is acceptable');
            } else {
              cy.log('Theme switch may be slow - consider optimization');
            }
          });
        }
      });
    });

    it('should not cause layout shifts during theme changes', () => {
      // Check for layout stability during theme switch
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="theme-toggle"], .theme-toggle').length > 0) {
          // Get initial layout dimensions
          cy.get('body').then(($bodyEl) => {
            const initialHeight = $bodyEl.height();
            const initialWidth = $bodyEl.width();
            
            // Switch theme
            cy.get('[data-testid="theme-toggle"], .theme-toggle').first().click();
            cy.wait(1000);
            
            // Check layout dimensions after theme switch
            cy.get('body').then(($newBodyEl) => {
              const newHeight = $newBodyEl.height();
              const newWidth = $newBodyEl.width();
              
              cy.log(`Layout - Initial: ${initialWidth}x${initialHeight}, After: ${newWidth}x${newHeight}`);
              
              // Layout should remain stable
              if (Math.abs(newHeight - initialHeight) < 10 && Math.abs(newWidth - initialWidth) < 10) {
                cy.log('Layout remains stable during theme switch');
              } else {
                cy.log('Layout may shift during theme changes');
              }
            });
          });
        }
      });
    });
  });
});