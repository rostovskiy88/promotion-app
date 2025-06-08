import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { App } from 'antd';
import EditProfile from './Profile';
import { updateUser } from '../../services/userService';
import { useUserDisplayInfo } from '../../hooks/useUserDisplayInfo';

// Mock the userService
jest.mock('../../services/userService', () => ({
  updateUser: jest.fn(),
}));

// Mock the useUserDisplayInfo hook
jest.mock('../../hooks/useUserDisplayInfo');

// Mock the Redux store
const mockStore = configureStore({
  reducer: {
    auth: () => ({
      user: {
        uid: 'test-uid',
        providerData: [],
      },
    }),
  },
});

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockUserDisplayInfo = {
  displayName: 'John Doe',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  avatarUrl: 'test-avatar-url',
  age: 25,
  firestoreUser: {
    uid: 'test-uid',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    avatarUrl: 'test-avatar-url',
    age: 25,
  },
  authUser: {
    uid: 'test-uid',
    email: 'john.doe@example.com',
  },
  isAuthenticated: true,
  refresh: jest.fn(),
};

describe('EditProfile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useUserDisplayInfo as jest.Mock).mockReturnValue(mockUserDisplayInfo);
    (updateUser as jest.Mock).mockResolvedValue({});
  });

  const renderComponent = () => {
    return render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <App>
            <EditProfile />
          </App>
        </BrowserRouter>
      </Provider>
    );
  };

  it('renders the component with initial user data', async () => {
    renderComponent();

    // Wait for the component to render with user data
    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('25')).toBeInTheDocument();
    });
  });

  it('handles form submission correctly', async () => {
    renderComponent();

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    // Update form fields
    fireEvent.change(screen.getByPlaceholderText('Enter your first name'), {
      target: { value: 'Jane' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your last name'), {
      target: { value: 'Smith' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your age'), {
      target: { value: '30' },
    });

    // Submit the form
    fireEvent.click(screen.getByText('Save'));

    // Check if updateUser was called with correct data
    await waitFor(() => {
      expect(updateUser).toHaveBeenCalledWith('test-uid', {
        firstName: 'Jane',
        lastName: 'Smith',
        age: 30,
      });
    });
  });

  it('handles cancel button click', async () => {
    renderComponent();

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    // Click cancel button
    fireEvent.click(screen.getByText('Cancel'));

    // Check if navigate was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('validates age input', async () => {
    renderComponent();

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    // Try to enter invalid age
    const ageInput = screen.getByPlaceholderText('Enter your age');
    fireEvent.change(ageInput, { target: { value: '-1' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Save'));

    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Age must be a natural number')).toBeInTheDocument();
    });
  });
}); 