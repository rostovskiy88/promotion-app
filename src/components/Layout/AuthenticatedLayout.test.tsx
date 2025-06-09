import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { App } from 'antd';
import AuthenticatedLayout from './AuthenticatedLayout';

// Mock the logout service
jest.mock('../../services/authService', () => ({
  logout: jest.fn(),
}));

// Mock the useUserDisplayInfo hook
jest.mock('../../hooks/useUserDisplayInfo', () => ({
  useUserDisplayInfo: () => ({
    displayName: 'John Doe',
    avatarUrl: 'https://example.com/avatar.jpg',
    email: 'john@example.com',
    isAuthenticated: true,
  }),
}));

// Mock the Redux hooks
jest.mock('../../hooks/useRedux', () => ({
  useUI: () => ({
    theme: 'light',
    globalLoading: false,
    sidebarCollapsed: false,
    toggleTheme: jest.fn(),
    setSidebarCollapsed: jest.fn(),
  }),
  useArticles: () => ({
    setSearchTerm: jest.fn(),
    clearSearch: jest.fn(),
  }),
}));

// Mock useLocation
const mockLocation = { pathname: '/dashboard' };
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockLocation,
}));

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <App>
        <AuthenticatedLayout>
          <div>Test Content</div>
        </AuthenticatedLayout>
      </App>
    </BrowserRouter>
  );
};

describe('AuthenticatedLayout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders layout with navigation menu', () => {
      renderComponent();

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Add Article')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('displays user information in header', () => {
      renderComponent();

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('shows logo in sidebar', () => {
      renderComponent();

      expect(screen.getByText('olegpromo')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('shows search input on dashboard page', () => {
      // Mock location to be dashboard
      Object.defineProperty(window, 'location', {
        value: { pathname: '/dashboard' },
        writable: true,
      });

      renderComponent();

      expect(screen.getByPlaceholderText('Find articles...')).toBeInTheDocument();
    });

    it('allows typing in search input', async () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/dashboard' },
        writable: true,
      });

      renderComponent();

      const searchInput = screen.getByPlaceholderText('Find articles...');
      fireEvent.change(searchInput, { target: { value: 'test search' } });

      expect(searchInput).toHaveValue('test search');
    });

    it('shows clear button when search has value', async () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/dashboard' },
        writable: true,
      });

      renderComponent();

      const searchInput = screen.getByPlaceholderText('Find articles...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(() => {
        expect(document.querySelector('.anticon-close')).toBeInTheDocument();
      });
    });
  });

  describe('User Menu', () => {
    it('opens user menu when user section is clicked', async () => {
      renderComponent();

      const userSection = screen.getByText('John Doe').closest('div');
      fireEvent.click(userSection!);

      await waitFor(() => {
        expect(screen.getByText('Profile')).toBeInTheDocument();
        expect(screen.getByText('Logout')).toBeInTheDocument();
        expect(screen.getByText('Dark Mode')).toBeInTheDocument();
      });
    });

    it('shows theme toggle switch in user menu', async () => {
      renderComponent();

      const userSection = screen.getByText('John Doe').closest('div');
      fireEvent.click(userSection!);

      await waitFor(() => {
        expect(screen.getByRole('switch')).toBeInTheDocument();
      });
    });
  });

  describe('Theme Switching', () => {
    it('shows theme toggle switch in user menu', async () => {
      renderComponent();

      const userSection = screen.getByText('John Doe').closest('div');
      fireEvent.click(userSection!);

      await waitFor(() => {
        expect(screen.getByRole('switch')).toBeInTheDocument();
      });
    });
  });

  describe('Sidebar Collapse', () => {
    it('renders sidebar collapse trigger', () => {
      renderComponent();

      // Find the collapse trigger button
      const collapseButton = document.querySelector('.ant-layout-sider-trigger');
      expect(collapseButton).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('has correct navigation links', () => {
      renderComponent();

      const dashboardLink = screen.getByText('Dashboard').closest('a');
      const addArticleLink = screen.getByText('Add Article').closest('a');

      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
      expect(addArticleLink).toHaveAttribute('href', '/dashboard/add-article');
    });
  });

  describe('Responsive Behavior', () => {
    it('handles different screen sizes appropriately', () => {
      renderComponent();

      // Test that the layout renders without errors on different viewport sizes
      // This is a basic test - more detailed responsive testing would require viewport mocking
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });
}); 