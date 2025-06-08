import React from 'react';
import { render, screen } from '@testing-library/react';
import Logo from './Logo';

describe('Logo Component', () => {
  describe('Rendering', () => {
    it('renders logo with icon and text by default', () => {
      render(<Logo />);

      // Check for rocket icon
      const icon = document.querySelector('.anticon-rocket');
      expect(icon).toBeInTheDocument();

      // Check for text
      expect(screen.getByText('olegpromo')).toBeInTheDocument();
    });

    it('renders only icon when collapsed', () => {
      render(<Logo collapsed={true} />);

      // Check for rocket icon
      const icon = document.querySelector('.anticon-rocket');
      expect(icon).toBeInTheDocument();

      // Text should not be visible when collapsed
      expect(screen.queryByText('olegpromo')).not.toBeInTheDocument();
    });

    it('renders both icon and text when not collapsed', () => {
      render(<Logo collapsed={false} />);

      // Check for rocket icon
      const icon = document.querySelector('.anticon-rocket');
      expect(icon).toBeInTheDocument();

      // Check for text
      expect(screen.getByText('olegpromo')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders with default styling by default', () => {
      render(<Logo />);

      // Check that logo container exists (it will have CSS module classes)
      const logoContainer = screen.getByText('olegpromo').parentElement;
      expect(logoContainer).toBeInTheDocument();
    });

    it('renders with default styling when explicitly set', () => {
      render(<Logo variant="default" />);

      const logoContainer = screen.getByText('olegpromo').parentElement;
      expect(logoContainer).toBeInTheDocument();
    });

    it('renders with light variant when specified', () => {
      render(<Logo variant="light" />);

      const logoContainer = screen.getByText('olegpromo').parentElement;
      expect(logoContainer).toBeInTheDocument();
    });
  });

  describe('Props Combinations', () => {
    it('handles collapsed with default variant', () => {
      render(<Logo collapsed={true} variant="default" />);

      const icon = document.querySelector('.anticon-rocket');
      expect(icon).toBeInTheDocument();
      expect(screen.queryByText('olegpromo')).not.toBeInTheDocument();
    });

    it('handles collapsed with light variant', () => {
      render(<Logo collapsed={true} variant="light" />);

      const icon = document.querySelector('.anticon-rocket');
      expect(icon).toBeInTheDocument();
      expect(screen.queryByText('olegpromo')).not.toBeInTheDocument();
    });

    it('handles not collapsed with light variant', () => {
      render(<Logo collapsed={false} variant="light" />);

      const icon = document.querySelector('.anticon-rocket');
      expect(icon).toBeInTheDocument();
      expect(screen.getByText('olegpromo')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('renders rocket icon correctly', () => {
      render(<Logo />);

      const icon = document.querySelector('.anticon-rocket');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('role', 'img');
    });

    it('renders text content correctly', () => {
      render(<Logo />);

      const textElement = screen.getByText('olegpromo');
      expect(textElement).toBeInTheDocument();
      expect(textElement.tagName).toBe('SPAN');
    });

    it('has proper container structure', () => {
      render(<Logo />);

      const textElement = screen.getByText('olegpromo');
      const container = textElement.parentElement as HTMLElement;
      
      expect(container).toBeInTheDocument();
      expect(container).toContainElement(textElement);
      
      const icon = document.querySelector('.anticon-rocket') as HTMLElement;
      expect(container).toContainElement(icon);
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined collapsed prop (defaults to false)', () => {
      render(<Logo collapsed={undefined} />);

      // Should show text when collapsed is undefined (falsy)
      expect(screen.getByText('olegpromo')).toBeInTheDocument();
    });

    it('handles invalid variant gracefully', () => {
      // TypeScript would prevent this, but testing runtime behavior
      render(<Logo variant={'invalid' as any} />);

      // Should still render the component
      expect(screen.getByText('olegpromo')).toBeInTheDocument();
      const icon = document.querySelector('.anticon-rocket');
      expect(icon).toBeInTheDocument();
    });

    it('handles null variant gracefully', () => {
      render(<Logo variant={null as any} />);

      // Should still render the component
      expect(screen.getByText('olegpromo')).toBeInTheDocument();
      const icon = document.querySelector('.anticon-rocket');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('contains accessible icon', () => {
      render(<Logo />);

      const icon = document.querySelector('.anticon-rocket');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('role', 'img');
    });

    it('provides readable text content', () => {
      render(<Logo />);

      const textElement = screen.getByText('olegpromo');
      expect(textElement).toBeInTheDocument();
      expect(textElement.textContent).toBe('olegpromo');
    });

    it('maintains proper semantic structure', () => {
      render(<Logo />);

      const textElement = screen.getByText('olegpromo');
      expect(textElement.tagName).toBe('SPAN');
      
      const container = textElement.parentElement;
      expect(container?.tagName).toBe('DIV');
    });
  });

  describe('Conditional Rendering', () => {
    it('shows text in all non-collapsed states', () => {
      // Test various falsy values for collapsed
      const falsyValues = [false, undefined, null, '', 0];
      
      falsyValues.forEach((value) => {
        const { unmount } = render(<Logo collapsed={value as any} />);
        expect(screen.getByText('olegpromo')).toBeInTheDocument();
        unmount();
      });
    });

    it('hides text in collapsed state', () => {
      render(<Logo collapsed={true} />);
      expect(screen.queryByText('olegpromo')).not.toBeInTheDocument();
    });

    it('always shows icon regardless of collapsed state', () => {
      // Test both collapsed and not collapsed
      const { rerender } = render(<Logo collapsed={false} />);
      expect(document.querySelector('.anticon-rocket')).toBeInTheDocument();

      rerender(<Logo collapsed={true} />);
      expect(document.querySelector('.anticon-rocket')).toBeInTheDocument();
    });
  });
}); 