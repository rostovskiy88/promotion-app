import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

// Mock window.location
const mockReload = jest.fn();
const mockAssign = jest.fn();

Object.defineProperty(window, 'location', {
  value: {
    reload: mockReload,
    href: '',
  },
  writable: true,
});

// Component that throws an error for testing
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

const renderErrorBoundary = (shouldThrow = false) => {
  return render(
    <ErrorBoundary>
      <ThrowError shouldThrow={shouldThrow} />
    </ErrorBoundary>
  );
};

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for error boundary tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  describe('Normal Operation', () => {
    it('renders children when there is no error', () => {
      renderErrorBoundary(false);
      
      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('renders error UI when child component throws', () => {
      renderErrorBoundary(true);
      
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
      expect(screen.queryByText('No error')).not.toBeInTheDocument();
    });

    it('displays error message and description', () => {
      renderErrorBoundary(true);
      
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/We encountered an unexpected error/)).toBeInTheDocument();
      expect(screen.getByText(/This has been logged and our team will look into it/)).toBeInTheDocument();
      expect(screen.getByText(/Please try refreshing the page or go back to the dashboard/)).toBeInTheDocument();
    });

    it('shows reload page button', () => {
      renderErrorBoundary(true);
      
      const reloadButton = screen.getByRole('button', { name: /reload page/i });
      expect(reloadButton).toBeInTheDocument();
    });

    it('shows go to dashboard button', () => {
      renderErrorBoundary(true);
      
      const dashboardButton = screen.getByRole('button', { name: /go to dashboard/i });
      expect(dashboardButton).toBeInTheDocument();
    });

    it('displays error illustration with bug icon', () => {
      renderErrorBoundary(true);
      
      const errorIcon = document.querySelector('.error-icon-large');
      expect(errorIcon).toBeInTheDocument();
    });

    it('displays animated wave elements', () => {
      renderErrorBoundary(true);
      
      const waves = document.querySelectorAll('.wave');
      expect(waves).toHaveLength(3);
      expect(document.querySelector('.wave1')).toBeInTheDocument();
      expect(document.querySelector('.wave2')).toBeInTheDocument();
      expect(document.querySelector('.wave3')).toBeInTheDocument();
    });
  });

  describe('User Actions', () => {
    it('reloads page when reload button is clicked', () => {
      renderErrorBoundary(true);
      
      const reloadButton = screen.getByRole('button', { name: /reload page/i });
      fireEvent.click(reloadButton);
      
      expect(mockReload).toHaveBeenCalledTimes(1);
    });

    it('navigates to dashboard when dashboard button is clicked', () => {
      // Mock window.location.href setter
      Object.defineProperty(window, 'location', {
        value: {
          reload: mockReload,
          href: '',
        },
        writable: true,
      });

      renderErrorBoundary(true);
      
      const dashboardButton = screen.getByRole('button', { name: /go to dashboard/i });
      fireEvent.click(dashboardButton);
      
      expect(window.location.href).toBe('/dashboard');
    });
  });

  describe('Error Information Logging', () => {
    it('logs error information to console', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      renderErrorBoundary(true);
      
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('CSS Classes and Styling', () => {
    it('applies correct container classes', () => {
      renderErrorBoundary(true);
      
      const container = document.querySelector('.error-boundary-container');
      expect(container).toBeInTheDocument();
      
      const content = document.querySelector('.error-boundary-content');
      expect(content).toBeInTheDocument();
    });

    it('applies correct button classes', () => {
      renderErrorBoundary(true);
      
      const reloadButton = document.querySelector('.reload-button');
      const homeButton = document.querySelector('.home-button');
      
      expect(reloadButton).toBeInTheDocument();
      expect(homeButton).toBeInTheDocument();
    });

    it('applies error illustration classes', () => {
      renderErrorBoundary(true);
      
      const illustration = document.querySelector('.error-illustration');
      const errorWaves = document.querySelector('.error-waves');
      
      expect(illustration).toBeInTheDocument();
      expect(errorWaves).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles and labels', () => {
      renderErrorBoundary(true);
      
      const reloadButton = screen.getByRole('button', { name: /reload page/i });
      const dashboardButton = screen.getByRole('button', { name: /go to dashboard/i });
      
      expect(reloadButton).toBeInTheDocument();
      expect(dashboardButton).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      renderErrorBoundary(true);
      
      // The title should be properly structured for screen readers
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('catches errors in componentDidCatch', () => {
      const spy = jest.spyOn(ErrorBoundary.prototype, 'componentDidCatch');
      
      renderErrorBoundary(true);
      
      expect(spy).toHaveBeenCalled();
      
      spy.mockRestore();
    });
  });
}); 