import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { message } from 'antd';
import AddArticle from '../AddArticle';
import { addArticle } from '../../services/articleService';
import { useFirestoreUser } from '../../hooks/useFirestoreUser';

// Mock dependencies
jest.mock('../../services/articleService');
jest.mock('../../hooks/useFirestoreUser');
jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  message: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock React Router
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Create mock store
const createMockStore = () => configureStore({
  reducer: {
    auth: (state = { user: null, loading: false, error: null, initialized: true }) => state,
  },
});

// Mock user data
const mockUser = {
  uid: 'test-uid',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  avatarUrl: 'https://example.com/avatar.jpg',
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Provider store={createMockStore()}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </Provider>
);

describe('AddArticle Component', () => {
  const mockOnCancel = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useFirestoreUser as jest.Mock).mockReturnValue(mockUser);
    (addArticle as jest.Mock).mockResolvedValue({ id: 'test-article-id' });
  });

  const renderAddArticle = () => {
    return render(
      <TestWrapper>
        <AddArticle onCancel={mockOnCancel} />
      </TestWrapper>
    );
  };

  describe('Rendering', () => {
    test('renders all form elements correctly', () => {
      renderAddArticle();
      
      expect(screen.getByText('Add new article')).toBeInTheDocument();
      expect(screen.getByLabelText('Category')).toBeInTheDocument();
      expect(screen.getByLabelText('Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Text')).toBeInTheDocument();
      expect(screen.getByText('Add cover photo')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /publish/i })).toBeInTheDocument();
    });

    test('renders category options', async () => {
      const user = userEvent.setup();
      renderAddArticle();
      
      const categorySelect = screen.getByLabelText('Category');
      await user.click(categorySelect);
      
      // Use getAllByText since AntD creates multiple elements for each option
      const productivityOptions = screen.getAllByText('Productivity');
      expect(productivityOptions.length).toBeGreaterThan(0);
      
      const mediaOptions = screen.getAllByText('Media');
      expect(mediaOptions.length).toBeGreaterThan(0);
      
      const businessOptions = screen.getAllByText('Business');
      expect(businessOptions.length).toBeGreaterThan(0);
    });
  });

  describe('Form Validation', () => {
    test('shows validation errors for required fields', async () => {
      const user = userEvent.setup();
      renderAddArticle();
      
      const publishButton = screen.getByRole('button', { name: /publish/i });
      await user.click(publishButton);
      
      await waitFor(() => {
        expect(screen.getByText('Please select a category')).toBeInTheDocument();
        expect(screen.getByText('Please enter a title')).toBeInTheDocument();
        expect(screen.getByText('Please enter article content')).toBeInTheDocument();
      });
    });
  });

  describe('Form Interactions', () => {
    test('allows filling out the form correctly', async () => {
      const user = userEvent.setup();
      renderAddArticle();
      
      // Select category
      const categorySelect = screen.getByLabelText('Category');
      await user.click(categorySelect);
      await user.click(screen.getByRole('option', { name: 'Productivity' }));
      
      // Fill title
      const titleInput = screen.getByLabelText('Title');
      await user.type(titleInput, 'Test Article Title');
      
      // Fill content
      const contentInput = screen.getByLabelText('Text');
      await user.type(contentInput, 'This is test article content');
      
      expect(titleInput).toHaveValue('Test Article Title');
      expect(contentInput).toHaveValue('This is test article content');
    });

    test('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderAddArticle();
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('File Upload', () => {
    test('renders file upload component', () => {
      renderAddArticle();
      
      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('accept', '.jpg,.png');
    });
  });

  describe('Form Submission', () => {
    test('submits form successfully with valid data', async () => {
      const user = userEvent.setup();
      renderAddArticle();
      
      // Fill out the form
      const categorySelect = screen.getByLabelText('Category');
      await user.click(categorySelect);
      
      // Wait for dropdown to open and click option
      await waitFor(() => {
        const option = screen.getByRole('option', { name: 'Productivity' });
        return user.click(option);
      });
      
      const titleInput = screen.getByLabelText('Title');
      await user.type(titleInput, 'Test Article');
      
      const contentInput = screen.getByLabelText('Text');
      await user.type(contentInput, 'Test content');
      
      // Submit form
      const publishButton = screen.getByRole('button', { name: /publish/i });
      await user.click(publishButton);
      
      await waitFor(() => {
        expect(addArticle).toHaveBeenCalledWith({
          title: 'Test Article',
          content: 'Test content',
          category: 'Productivity',
          authorId: 'test-uid',
          authorName: 'John Doe',
          authorAvatar: 'https://example.com/avatar.jpg',
          imageUrl: '/default-article-cover.png',
        });
        expect(message.success).toHaveBeenCalledWith('Article created successfully!');
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      }, { timeout: 10000 });
    });

    test('shows error when user is not found', async () => {
      (useFirestoreUser as jest.Mock).mockReturnValue(null);
      const user = userEvent.setup();
      renderAddArticle();
      
      // Fill required fields
      const categorySelect = screen.getByLabelText('Category');
      await user.click(categorySelect);
      
      await waitFor(() => {
        const option = screen.getByRole('option', { name: 'Productivity' });
        return user.click(option);
      });
      
      await user.type(screen.getByLabelText('Title'), 'Test');
      await user.type(screen.getByLabelText('Text'), 'Test content');
      
      const publishButton = screen.getByRole('button', { name: /publish/i });
      await user.click(publishButton);
      
      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith('User information not found');
        expect(addArticle).not.toHaveBeenCalled();
      }, { timeout: 10000 });
    });

    test('handles submission error', async () => {
      (addArticle as jest.Mock).mockRejectedValue(new Error('Network error'));
      const user = userEvent.setup();
      renderAddArticle();
      
      // Fill out form
      const categorySelect = screen.getByLabelText('Category');
      await user.click(categorySelect);
      
      await waitFor(() => {
        const option = screen.getByRole('option', { name: 'Productivity' });
        return user.click(option);
      });
      
      await user.type(screen.getByLabelText('Title'), 'Test');
      await user.type(screen.getByLabelText('Text'), 'Test content');
      
      const publishButton = screen.getByRole('button', { name: /publish/i });
      await user.click(publishButton);
      
      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith('Failed to create article');
      }, { timeout: 10000 });
    });
  });
}); 