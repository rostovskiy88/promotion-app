import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import EditProfile from './Profile';
import { getUserById, updateUser } from '../../services/userService';

// Mock the userService
jest.mock('../../services/userService', () => ({
  getUserById: jest.fn(),
  updateUser: jest.fn(),
}));

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

describe('EditProfile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getUserById as jest.Mock).mockResolvedValue({
      firstName: 'John',
      lastName: 'Doe',
      age: 25,
      avatarUrl: 'test-avatar-url',
    });
  });

  const renderComponent = () => {
    return render(
      <Provider store={mockStore}>
        <BrowserRouter>
          <EditProfile />
        </BrowserRouter>
      </Provider>
    );
  };

  it('renders the component with initial user data', async () => {
    renderComponent();

    // Wait for the user data to be loaded
    await waitFor(() => {
      expect(getUserById).toHaveBeenCalledWith('test-uid');
    });

    // Check if the form fields are populated with user data
    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('25')).toBeInTheDocument();
  });

  it('handles form submission correctly', async () => {
    renderComponent();

    // Wait for the user data to be loaded
    await waitFor(() => {
      expect(getUserById).toHaveBeenCalledWith('test-uid');
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

    // Wait for the user data to be loaded
    await waitFor(() => {
      expect(getUserById).toHaveBeenCalledWith('test-uid');
    });

    // Click cancel button
    fireEvent.click(screen.getByText('Cancel'));

    // Check if navigate was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('validates age input', async () => {
    renderComponent();

    // Wait for the user data to be loaded
    await waitFor(() => {
      expect(getUserById).toHaveBeenCalledWith('test-uid');
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