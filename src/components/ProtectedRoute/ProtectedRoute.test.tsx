import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { App } from 'antd';
import ProtectedRoute from './ProtectedRoute';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate">{to}</div>,
  useLocation: () => ({ pathname: '/dashboard' }),
}));

// Create a simple mock store
const createMockStore = (authState: any) => {
  return configureStore({
    reducer: {
      auth: () => authState,
    },
  });
};

const TestChild = () => <div data-testid="protected-content">Protected Content</div>;

const renderProtectedRoute = (authState: any) => {
  const store = createMockStore(authState);
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <App>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </App>
      </BrowserRouter>
    </Provider>
  );
};

describe('ProtectedRoute Component', () => {
  describe('Loading State', () => {
    it('shows loading spinner when auth is not initialized', () => {
      const authState = {
        user: null,
        initialized: false,
        loading: true,
      };

      renderProtectedRoute(authState);

      const spinner = document.querySelector('.ant-spin');
      expect(spinner).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('shows loading spinner when user is null but still loading', () => {
      const authState = {
        user: null,
        initialized: false,
        loading: true,
      };

      renderProtectedRoute(authState);

      const spinner = document.querySelector('.ant-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Authenticated User', () => {
    it('renders children when user is authenticated', () => {
      const authState = {
        user: {
          uid: 'test-uid',
          email: 'test@example.com',
          displayName: 'Test User',
        },
        initialized: true,
        loading: false,
      };

      renderProtectedRoute(authState);

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });

    it('renders children when auth is initialized with valid user', () => {
      const authState = {
        user: {
          uid: 'user-123',
          email: 'user@test.com',
        },
        initialized: true,
        loading: false,
      };

      renderProtectedRoute(authState);

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Unauthenticated User', () => {
    it('redirects to login when user is null and auth is initialized', () => {
      const authState = {
        user: null,
        initialized: true,
        loading: false,
      };

      renderProtectedRoute(authState);

      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByText('/login')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('redirects when user is undefined and loading is complete', () => {
      const authState = {
        user: undefined,
        initialized: true,
        loading: false,
      };

      renderProtectedRoute(authState);

      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByText('/login')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing auth state gracefully', () => {
      const authState = {};

      renderProtectedRoute(authState);

      // Should show loading or redirect - either is acceptable for undefined state
      const hasLoading = document.querySelector('.ant-spin');
      const hasRedirect = screen.queryByTestId('navigate');
      
      expect(hasLoading || hasRedirect).toBeTruthy();
    });

    it('handles partially loaded auth state', () => {
      const authState = {
        user: null,
        initialized: false,
        // loading property missing
      };

      renderProtectedRoute(authState);

      // Should show loading when not initialized OR redirect
      const spinner = document.querySelector('.ant-spin');
      const redirect = screen.queryByTestId('navigate');
      
      // Either loading spinner or redirect should be present
      expect(spinner || redirect).toBeTruthy();
    });

    it('handles auth state with only user property', () => {
      const authState = {
        user: {
          uid: 'test-user',
          email: 'test@example.com',
        },
        // Other properties missing
      };

      renderProtectedRoute(authState);

      // Should render children when user exists
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  describe('Component Behavior', () => {
    it('properly wraps children when authenticated', () => {
      const authState = {
        user: { uid: 'test', email: 'test@example.com' },
        initialized: true,
        loading: false,
      };

      renderProtectedRoute(authState);

      const content = screen.getByTestId('protected-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveTextContent('Protected Content');
    });

    it('does not render children during loading', () => {
      const authState = {
        user: null,
        initialized: false,
        loading: true,
      };

      renderProtectedRoute(authState);

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('preserves children props and structure', () => {
      const authState = {
        user: { uid: 'test' },
        initialized: true,
        loading: false,
      };

      renderProtectedRoute(authState);

      const content = screen.getByTestId('protected-content');
      expect(content).toBeInTheDocument();
    });
  });

  describe('Loading UI', () => {
    it('shows centered loading spinner', () => {
      const authState = {
        user: null,
        initialized: false,
        loading: true,
      };

      renderProtectedRoute(authState);

      const spinner = document.querySelector('.ant-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('loading state blocks access to protected content', () => {
      const authState = {
        user: { uid: 'test-user' }, // Even with user
        initialized: false, // But not initialized
        loading: true,
      };

      renderProtectedRoute(authState);

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      const spinner = document.querySelector('.ant-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Security', () => {
    it('never shows protected content without proper authentication', () => {
      const authState = {
        user: null,
        initialized: true,
        loading: false,
      };

      renderProtectedRoute(authState);

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('ensures authentication check before rendering', () => {
      const authState = {
        user: undefined,
        initialized: true,
        loading: false,
      };

      renderProtectedRoute(authState);

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toBeInTheDocument();
    });
  });
}); 