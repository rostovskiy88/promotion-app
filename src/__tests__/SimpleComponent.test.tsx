import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple component to test
const TestButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button onClick={onClick}>{children}</button>
);

describe('Simple Jest Tests', () => {
  it('should render a button and handle clicks', () => {
    const mockClick = jest.fn();
    
    render(<TestButton onClick={mockClick}>Click me</TestButton>);
    
    const button = screen.getByText('Click me');
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('should demonstrate TypeScript interfaces (no any types)', () => {
    interface TestUser {
      id: number;
      name: string;
      email: string;
    }

    const user: TestUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com'
    };

    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@example.com');
  });

  it('should test prevent render without data pattern', () => {
    const ComponentWithConditionalRender: React.FC<{ data?: string }> = ({ data }) => {
      if (!data) {
        return <div>Loading...</div>;
      }
      return <div>Data: {data}</div>;
    };

    // Test loading state (prevent render without data)
    const { rerender } = render(<ComponentWithConditionalRender />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Test with data
    rerender(<ComponentWithConditionalRender data="Test Data" />);
    expect(screen.getByText('Data: Test Data')).toBeInTheDocument();
  });

  it('should demonstrate middleware pattern testing', () => {
    // Mock middleware function
    const middleware = (req: any, res: any, next: any) => {
      req.processed = true;
      next();
    };

    const mockReq = {};
    const mockRes = {};
    const mockNext = jest.fn();

    middleware(mockReq, mockRes, mockNext);

    expect((mockReq as any).processed).toBe(true);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });
}); 