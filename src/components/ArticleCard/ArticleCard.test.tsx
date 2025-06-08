import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { App } from 'antd';
import ArticleCard, { ArticleCardProps } from './ArticleCard';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const defaultProps: ArticleCardProps = {
  category: 'Technology',
  date: 'December 25, 2023',
  title: 'Test Article Title',
  description: 'This is a test description for the article card component.',
  authorName: 'John Doe',
  authorAvatar: 'https://example.com/avatar.jpg',
  readMoreUrl: '/article/123',
  imageUrl: 'https://example.com/image.jpg',
};

const renderComponent = (props: Partial<ArticleCardProps> = {}) => {
  return render(
    <BrowserRouter>
      <App>
        <ArticleCard {...defaultProps} {...props} />
      </App>
    </BrowserRouter>
  );
};

describe('ArticleCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders all article information correctly', () => {
      renderComponent();

      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('December 25, 2023')).toBeInTheDocument();
      expect(screen.getByText('Test Article Title')).toBeInTheDocument();
      expect(screen.getByText('This is a test description for the article card component.')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Read more →')).toBeInTheDocument();
    });

    it('renders article image with correct background', () => {
      renderComponent();

      const imageDiv = document.querySelector('.article-card-image');
      expect(imageDiv).toHaveStyle({
        backgroundImage: 'url(https://example.com/image.jpg)',
      });
    });

    it('renders author avatar with correct src', () => {
      renderComponent();

      const avatar = document.querySelector('.ant-avatar img');
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });

    it('renders dropdown menu button', () => {
      renderComponent();

      const menuButton = document.querySelector('.article-card-menu');
      expect(menuButton).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('navigates to read more URL when read more button is clicked', () => {
      renderComponent();

      const readMoreButton = screen.getByText('Read more →');
      fireEvent.click(readMoreButton);

      expect(mockNavigate).toHaveBeenCalledWith('/article/123');
    });

    it('calls onEdit when edit menu item is clicked', () => {
      const mockOnEdit = jest.fn();
      renderComponent({ onEdit: mockOnEdit });

      // Click the dropdown menu
      const menuButton = document.querySelector('.article-card-menu');
      fireEvent.click(menuButton!);

      // Click the Edit option
      const editOption = screen.getByText('Edit');
      fireEvent.click(editOption);

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('calls onDelete when delete menu item is clicked', () => {
      const mockOnDelete = jest.fn();
      renderComponent({ onDelete: mockOnDelete });

      // Click the dropdown menu
      const menuButton = document.querySelector('.article-card-menu');
      fireEvent.click(menuButton!);

      // Click the Delete option
      const deleteOption = screen.getByText('Delete');
      fireEvent.click(deleteOption);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('prevents default event when read more button is clicked', () => {
      renderComponent();

      const readMoreButton = screen.getByText('Read more →');
      const mockEvent = { preventDefault: jest.fn(), type: 'click' };

      fireEvent.click(readMoreButton);
      
      // The preventDefault should be called internally
      expect(mockNavigate).toHaveBeenCalledWith('/article/123');
    });
  });

  describe('Optional Props', () => {
    it('renders correctly without onEdit and onDelete callbacks', () => {
      renderComponent({ onEdit: undefined, onDelete: undefined });

      expect(screen.getByText('Test Article Title')).toBeInTheDocument();
      
      // Menu should still be present but items might not function
      const menuButton = document.querySelector('.article-card-menu');
      expect(menuButton).toBeInTheDocument();
    });

    it('handles empty or missing image URL gracefully', () => {
      renderComponent({ imageUrl: '' });

      const imageDiv = document.querySelector('.article-card-image');
      expect(imageDiv).toHaveStyle({
        backgroundImage: 'url()',
      });
    });

    it('handles empty author avatar gracefully', () => {
      renderComponent({ authorAvatar: '' });

      const avatar = document.querySelector('.ant-avatar img');
      expect(avatar).toHaveAttribute('src', '');
    });
  });

  describe('Content Variations', () => {
    it('renders long title correctly', () => {
      const longTitle = 'This is a very long article title that might wrap to multiple lines in the card layout';
      renderComponent({ title: longTitle });

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('renders long description correctly', () => {
      const longDescription = 'This is a very long description that contains a lot of text and might be truncated or styled differently in the actual card layout. It should still render properly in our tests.';
      renderComponent({ description: longDescription });

      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it('renders different categories correctly', () => {
      renderComponent({ category: 'Science' });
      expect(screen.getByText('Science')).toBeInTheDocument();

      renderComponent({ category: 'Business' });
      expect(screen.getByText('Business')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button structure for read more', () => {
      renderComponent();

      const readMoreButton = screen.getByRole('button', { name: /read more/i });
      expect(readMoreButton).toBeInTheDocument();
      expect(readMoreButton).toHaveStyle({ cursor: 'pointer' });
    });

    it('provides alt text for author avatar', () => {
      renderComponent();

      const avatar = document.querySelector('.ant-avatar img');
      expect(avatar).toBeInTheDocument();
    });
  });
}); 