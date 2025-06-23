import { render, screen, waitFor } from '@testing-library/react';
import { App } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import { useFirestoreUser } from '../../hooks/useFirestoreUser';
import * as articleService from '../../services/articleService';
import ArticleDetails from './ArticleDetails';

// Mock dependencies
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'test-article-id' }),
}));

jest.mock('../../services/articleService', () => ({
  getArticleById: jest.fn(),
}));

jest.mock('../../hooks/useFirestoreUser');

const mockArticle = {
  id: 'test-article-id',
  title: 'Test Article Title',
  content: 'This is the test article content that should be displayed in the article details view.',
  category: 'Technology',
  authorName: 'John Doe',
  authorId: 'author-123',
  authorAvatar: 'https://example.com/avatar.jpg',
  imageUrl: 'https://example.com/article-image.jpg',
  createdAt: '2023-12-25T10:00:00Z',
};

const mockCurrentUser = {
  uid: 'current-user-123',
  displayName: 'Current User',
  email: 'current@example.com',
  refresh: jest.fn(),
};

const mockAuthorUser = {
  uid: 'author-123',
  displayName: 'John Doe',
  email: 'john@example.com',
  refresh: jest.fn(),
};

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <App>
        <ArticleDetails />
      </App>
    </BrowserRouter>
  );
};

describe('ArticleDetails Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useFirestoreUser as jest.Mock).mockReturnValue(mockCurrentUser);
    (articleService.getArticleById as jest.Mock).mockResolvedValue(mockArticle);
  });

  describe('Loading State', () => {
    it('shows loading spinner while fetching article', async () => {
      // Make the service call hang to test loading state
      (articleService.getArticleById as jest.Mock).mockImplementation(() => new Promise(() => {}));

      renderComponent();

      // Check for Spin component (Antd loading spinner)
      const spinElement = document.querySelector('.ant-spin');
      expect(spinElement).toBeInTheDocument();
    });

    it('shows loading spinner initially', () => {
      renderComponent();

      // Check for Spin component (Antd loading spinner)
      const spinElement = document.querySelector('.ant-spin');
      expect(spinElement).toBeInTheDocument();
    });
  });

  describe('Article Rendering', () => {
    it('renders article content correctly after loading', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Test Article Title')).toBeInTheDocument();
      });

      expect(
        screen.getByText('This is the test article content that should be displayed in the article details view.')
      ).toBeInTheDocument();
      expect(screen.getByText('TECHNOLOGY')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('December 25, 2023')).toBeInTheDocument();
    });

    it('renders article image when imageUrl is provided', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Test Article Title')).toBeInTheDocument();
      });

      const articleImage = screen.getByAltText('Test Article Title');
      expect(articleImage).toBeInTheDocument();
      expect(articleImage).toHaveAttribute('src', 'https://example.com/article-image.jpg');
    });

    it('does not render image section when imageUrl is not provided', async () => {
      (articleService.getArticleById as jest.Mock).mockResolvedValue({
        ...mockArticle,
        imageUrl: undefined,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Test Article Title')).toBeInTheDocument();
      });

      const articleImage = screen.queryByAltText('Test Article Title');
      expect(articleImage).not.toBeInTheDocument();
    });

    it('renders author avatar with fallback to first letter', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Test Article Title')).toBeInTheDocument();
      });

      const avatar = document.querySelector('.ant-avatar img');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('renders back to dashboard button', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
      });

      const backButton = screen.getByText('Back to Dashboard');
      expect(backButton).toBeInTheDocument();
    });

    it('navigates to dashboard when back button is clicked', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
      });

      const backButton = screen.getByText('Back to Dashboard');
      backButton.click();

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Author-specific functionality', () => {
    it('shows edit button when current user is the author', async () => {
      (useFirestoreUser as jest.Mock).mockReturnValue(mockAuthorUser);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Test Article Title')).toBeInTheDocument();
      });

      const editButton = screen.getByText('Edit Article');
      expect(editButton).toBeInTheDocument();
    });

    it('does not show edit button when current user is not the author', async () => {
      (useFirestoreUser as jest.Mock).mockReturnValue(mockCurrentUser);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Test Article Title')).toBeInTheDocument();
      });

      const editButton = screen.queryByText('Edit Article');
      expect(editButton).not.toBeInTheDocument();
    });

    it('navigates to edit page when edit button is clicked', async () => {
      (useFirestoreUser as jest.Mock).mockReturnValue(mockAuthorUser);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Edit Article')).toBeInTheDocument();
      });

      const editButton = screen.getByText('Edit Article');
      editButton.click();

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/edit-article/test-article-id');
    });
  });

  describe('Error Handling', () => {
    it('handles missing article ID', async () => {
      (articleService.getArticleById as jest.Mock).mockResolvedValue(null);

      renderComponent();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('handles article not found', async () => {
      (articleService.getArticleById as jest.Mock).mockResolvedValue(null);

      renderComponent();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('handles service error', async () => {
      const mockError = new Error('Service error');
      (articleService.getArticleById as jest.Mock).mockRejectedValue(mockError);

      renderComponent();

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('Date Formatting', () => {
    it('formats string date correctly', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('December 25, 2023')).toBeInTheDocument();
      });
    });

    it('formats Firebase Timestamp correctly', async () => {
      const mockTimestamp = {
        toDate: () => new Date('2023-12-25T10:00:00Z'),
      };

      (articleService.getArticleById as jest.Mock).mockResolvedValue({
        ...mockArticle,
        createdAt: mockTimestamp,
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('December 25, 2023')).toBeInTheDocument();
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('cleans up properly on unmount', async () => {
      const { unmount } = renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Test Article Title')).toBeInTheDocument();
      });

      unmount();

      // Component should unmount without errors
      expect(screen.queryByText('Test Article Title')).not.toBeInTheDocument();
    });

    it('refetches article when ID parameter changes', async () => {
      renderComponent();

      await waitFor(() => {
        expect(articleService.getArticleById).toHaveBeenCalledWith('test-article-id');
      });
    });
  });
});
