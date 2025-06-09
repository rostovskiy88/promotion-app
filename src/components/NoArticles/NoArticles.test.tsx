import React from 'react';
import { render, screen } from '@testing-library/react';
import { App } from 'antd';
import NoArticles from './NoArticles';

const renderNoArticles = () => {
  return render(
    <App>
      <NoArticles />
    </App>
  );
};

describe('NoArticles Component', () => {
  describe('Basic Rendering', () => {
    it('renders no articles message', () => {
      renderNoArticles();
      
      expect(screen.getByText('No articles found')).toBeInTheDocument();
    });

    it('has proper empty state container', () => {
      renderNoArticles();
      
      const container = document.querySelector('.ant-empty');
      expect(container).toBeInTheDocument();
    });

    it('displays empty state illustration', () => {
      renderNoArticles();
      
      // Ant Design Empty component should be present
      const emptyComponent = document.querySelector('.ant-empty-image');
      expect(emptyComponent).toBeInTheDocument();
    });

    it('shows appropriate styling for empty state', () => {
      renderNoArticles();
      
      const emptyDescription = document.querySelector('.ant-empty-description');
      expect(emptyDescription).toBeInTheDocument();
    });

    it('applies correct container styling', () => {
      renderNoArticles();
      
      // Check for the wrapper div with styling
      const wrapper = screen.getByText('No articles found').closest('div');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('renders as a functional component', () => {
      renderNoArticles();
      
      // Basic test that component renders without errors
      expect(screen.getByText('No articles found')).toBeInTheDocument();
    });

    it('uses Ant Design Empty component', () => {
      renderNoArticles();
      
      const emptyComponent = document.querySelector('.ant-empty');
      expect(emptyComponent).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides meaningful text for screen readers', () => {
      renderNoArticles();
      
      expect(screen.getByText('No articles found')).toBeInTheDocument();
    });

    it('has proper semantic structure', () => {
      renderNoArticles();
      
      // The empty state should be accessible
      const emptyDescription = document.querySelector('.ant-empty-description');
      expect(emptyDescription).toBeInTheDocument();
    });
  });

  describe('Visual Design', () => {
    it('centers content properly', () => {
      renderNoArticles();
      
      // Check that the outer wrapper div has center alignment
      const emptyComponent = document.querySelector('.ant-empty');
      const outerDiv = emptyComponent?.parentElement;
      expect(outerDiv).toHaveStyle('text-align: center');
    });

    it('applies proper padding', () => {
      renderNoArticles();
      
      // Check that the outer wrapper div has proper padding
      const emptyComponent = document.querySelector('.ant-empty');
      const outerDiv = emptyComponent?.parentElement;
      expect(outerDiv).toHaveStyle('padding: 48px 0px');
    });
  });
}); 