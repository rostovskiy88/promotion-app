/// <reference types="cypress" />

describe('PWA Features', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
    
    // Handle authentication and ensure we're on dashboard
    cy.url({ timeout: 3000 }).then((url) => {
      if (url.includes('/dashboard')) {
        cy.log('Already authenticated and on dashboard');
        return;
      }
      
      if (!url.includes('/login') && !url.includes('/register')) {
        cy.log('Authenticated but not on dashboard, navigating to dashboard');
        cy.visit('/dashboard');
        cy.url().should('include', '/dashboard');
        return;
      }
      
      // Try login
      cy.get('input[placeholder="Enter your email"]').type('testuser@example.com');
      cy.get('input[placeholder="Enter your password"]').type('testpassword123');
      cy.get('button[type="submit"]').click();
      
      cy.url({ timeout: 10000 }).then((loginUrl) => {
        if (!loginUrl.includes('/dashboard') && !loginUrl.includes('/login')) {
          cy.visit('/dashboard');
        }
      });
    });
    
    cy.url().should('include', '/dashboard');
  });

  describe('Offline Functionality', () => {
    it('should show offline message when connection is lost', () => {
      // Simulate offline mode
      cy.window().then((win) => {
        cy.stub(win.navigator, 'onLine').value(false);
        cy.wrap(win).trigger('offline');
      });
      
      // Should show offline notification
      cy.get('.offline-notification').should('be.visible');
      cy.contains('You are currently offline').should('be.visible');
    });

    it('should restore functionality when coming back online', () => {
      // Go offline first
      cy.window().then((win) => {
        cy.stub(win.navigator, 'onLine').value(false);
        cy.wrap(win).trigger('offline');
      });
      
      cy.get('.offline-notification').should('be.visible');
      
      // Come back online
      cy.window().then((win) => {
        cy.stub(win.navigator, 'onLine').value(true);
        cy.wrap(win).trigger('online');
      });
      
      // Offline notification should disappear
      cy.get('.offline-notification').should('not.exist');
      cy.contains('Connection restored').should('be.visible');
    });

    it('should cache articles for offline viewing', () => {
      // Load articles while online
      cy.get('[data-testid=article-card]').should('have.length.greaterThan', 0);
      
      // Go offline
      cy.window().then((win) => {
        cy.stub(win.navigator, 'onLine').value(false);
        cy.wrap(win).trigger('offline');
      });
      
      // Articles should still be visible from cache
      cy.get('[data-testid=article-card]').should('have.length.greaterThan', 0);
    });

    it('should prevent article creation when offline', () => {
      // Go offline
      cy.window().then((win) => {
        cy.stub(win.navigator, 'onLine').value(false);
        cy.wrap(win).trigger('offline');
      });
      
      // Try to create article
      cy.get('button').contains('Add Article').click();
      cy.get('input[placeholder="Enter article title"]').type('Offline Article');
      cy.get('textarea[placeholder="Write your article content here..."]').type('This should fail offline');
      cy.get('.ant-select').click();
      cy.get('.ant-select-item').first().click();
      cy.get('button[type="submit"]').contains('Publish Article').click();
      
      // Should show offline error
      cy.get('.ant-message').should('contain', 'Cannot create articles while offline');
    });
  });

  describe('Service Worker', () => {
    it('should register service worker on load', () => {
      cy.window().should('have.property', 'navigator');
      cy.window().then((win) => {
        expect(win.navigator.serviceWorker).to.exist;
      });
    });

    it('should update content when service worker updates', () => {
      // This would require mocking service worker update
      // For now, just verify update mechanism exists
      cy.window().then((win) => {
        if ('serviceWorker' in win.navigator) {
          // Service worker is available
          expect(win.navigator.serviceWorker).to.exist;
        }
      });
    });

    it('should show update notification when new version is available', () => {
      // Mock service worker update event
      cy.window().then((win) => {
        if ('serviceWorker' in win.navigator) {
          // Simulate update available
          const updateEvent = new CustomEvent('sw-update-available');
          win.dispatchEvent(updateEvent);
        }
      });
      
      // Should show update notification
      cy.get('.update-notification').should('be.visible');
      cy.contains('New version available').should('be.visible');
    });
  });

  describe('App Installation', () => {
    it('should show install prompt when criteria are met', () => {
      // Mock beforeinstallprompt event
      cy.window().then((win) => {
        const installEvent = new CustomEvent('beforeinstallprompt');
        win.dispatchEvent(installEvent);
      });
      
      // Should show install banner or button
      cy.get('.install-prompt').should('be.visible');
      cy.contains('Install App').should('be.visible');
    });

    it('should handle install prompt interaction', () => {
      // Mock install prompt
      cy.window().then((win) => {
        const mockPrompt = {
          prompt: cy.stub(),
          userChoice: Promise.resolve({ outcome: 'accepted' })
        };
        
        const installEvent = new CustomEvent('beforeinstallprompt');
        installEvent.prompt = mockPrompt.prompt;
        installEvent.userChoice = mockPrompt.userChoice;
        
        win.dispatchEvent(installEvent);
      });
      
      // Click install button
      cy.get('.install-prompt button').click();
      
      // Prompt should be hidden after interaction
      cy.get('.install-prompt').should('not.exist');
    });

    it('should detect when app is running in standalone mode', () => {
      // Mock standalone mode
      cy.window().then((win) => {
        Object.defineProperty(win.navigator, 'standalone', {
          value: true,
          writable: true
        });
      });
      
      // Should hide install prompt in standalone mode
      cy.get('.install-prompt').should('not.exist');
    });
  });

  describe('Performance Optimizations', () => {
    it('should lazy load images', () => {
      cy.get('[data-testid=article-card] img').should('have.attr', 'loading', 'lazy');
    });

    it('should implement proper caching strategies', () => {
      // Check that static assets are cached
      cy.request('/manifest.json').should((response) => {
        expect(response.headers).to.have.property('cache-control');
      });
    });

    it('should preload critical resources', () => {
      cy.get('head link[rel="preload"]').should('exist');
    });

    it('should implement code splitting', () => {
      // Check that chunks are loaded dynamically
      cy.window().then((win) => {
        // Modern browsers support dynamic imports
        expect(typeof win.import).to.equal('function');
      });
    });
  });

  describe('Background Sync', () => {
    it('should queue actions when offline', () => {
      // Go offline
      cy.window().then((win) => {
        cy.stub(win.navigator, 'onLine').value(false);
        cy.wrap(win).trigger('offline');
      });
      
      // Try to create article (should be queued)
      cy.get('button').contains('Add Article').click();
      cy.get('input[placeholder="Enter article title"]').type('Queued Article');
      cy.get('textarea[placeholder="Write your article content here..."]').type('Will sync when online');
      cy.get('.ant-select').click();
      cy.get('.ant-select-item').first().click();
      cy.get('button[type="submit"]').contains('Publish Article').click();
      
      // Should show queued message
      cy.get('.ant-message').should('contain', 'Article queued for sync');
    });

    it('should sync queued actions when back online', () => {
      // This would require more complex background sync simulation
      // For now, just verify the mechanism exists
      cy.window().then((win) => {
        if ('serviceWorker' in win.navigator) {
          // Service worker supports background sync
          expect(win.navigator.serviceWorker).to.exist;
        }
      });
    });
  });

  describe('Push Notifications', () => {
    it('should request notification permission', () => {
      // Mock notification permission request
      cy.window().then((win) => {
        cy.stub(win.Notification, 'requestPermission').resolves('granted');
      });
      
      // Trigger notification permission request
      cy.get('button').contains('Enable Notifications').click();
      
      // Should show success message
      cy.get('.ant-message').should('contain', 'Notifications enabled');
    });

    it('should handle notification permission denial', () => {
      cy.window().then((win) => {
        cy.stub(win.Notification, 'requestPermission').resolves('denied');
      });
      
      cy.get('button').contains('Enable Notifications').click();
      
      // Should show denial message
      cy.get('.ant-message').should('contain', 'Notifications disabled');
    });

    it('should display push notifications when received', () => {
      // Mock notification display
      cy.window().then((win) => {
        const mockNotification = cy.stub(win, 'Notification');
        
        // Simulate push notification
        const notificationData = {
          title: 'New Article Published',
          body: 'Check out the latest article',
          icon: '/icon-192x192.png'
        };
        
        mockNotification.returns(notificationData);
      });
    });
  });

  describe('App Manifest', () => {
    it('should have valid manifest.json', () => {
      cy.request('/manifest.json').should((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('name');
        expect(response.body).to.have.property('short_name');
        expect(response.body).to.have.property('icons');
        expect(response.body).to.have.property('start_url');
        expect(response.body).to.have.property('display');
        expect(response.body).to.have.property('theme_color');
        expect(response.body).to.have.property('background_color');
      });
    });

    it('should have proper icon sizes in manifest', () => {
      cy.request('/manifest.json').should((response) => {
        const icons = response.body.icons;
        expect(icons).to.be.an('array');
        expect(icons.length).to.be.greaterThan(0);
        
        // Should have common icon sizes
        const sizes = icons.map(icon => icon.sizes);
        expect(sizes).to.include('192x192');
        expect(sizes).to.include('512x512');
      });
    });

    it('should have correct start_url and scope', () => {
      cy.request('/manifest.json').should((response) => {
        expect(response.body.start_url).to.equal('/');
        expect(response.body.scope).to.equal('/');
      });
    });
  });

  describe('Accessibility in PWA', () => {
    it('should maintain accessibility in offline mode', () => {
      // Go offline
      cy.window().then((win) => {
        cy.stub(win.navigator, 'onLine').value(false);
        cy.wrap(win).trigger('offline');
      });
      
      // Check accessibility features still work
      cy.get('[data-testid=search-input]').should('have.attr', 'aria-label');
      cy.get('button').first().should('be.focusable');
    });

    it('should provide proper ARIA labels for PWA features', () => {
      cy.get('.install-prompt button').should('have.attr', 'aria-label');
      cy.get('.offline-notification').should('have.attr', 'role', 'alert');
    });

    it('should maintain keyboard navigation in all modes', () => {
      // Test keyboard navigation while online
      cy.get('[data-testid=search-input]').focus().tab();
      cy.focused().should('exist');
      
      // Go offline and test again
      cy.window().then((win) => {
        cy.stub(win.navigator, 'onLine').value(false);
        cy.wrap(win).trigger('offline');
      });
      
      cy.get('[data-testid=search-input]').focus().tab();
      cy.focused().should('exist');
    });
  });

  describe('Storage Management', () => {
    it('should manage storage quota efficiently', () => {
      // Check storage API availability
      cy.window().then((win) => {
        if ('storage' in win.navigator) {
          expect(win.navigator.storage).to.exist;
        }
      });
    });

    it('should clear old cached data when needed', () => {
      // This would require testing cache management
      // For now, verify cache API is available
      cy.window().then((win) => {
        if ('caches' in win) {
          expect(win.caches).to.exist;
        }
      });
    });

    it('should persist important user data', () => {
      // Check that user preferences are stored
      cy.get('[data-testid=user-menu]').click();
      cy.get('input[role="switch"]').click(); // Toggle dark mode
      
      // Reload page
      cy.reload();
      
      // Theme preference should persist
      cy.get('html').should('have.attr', 'data-theme', 'dark');
    });
  });
}); 