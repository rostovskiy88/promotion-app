import { createBrowserRouter } from 'react-router-dom';
import Login from '../pages/Login/Login';
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/',
    element: <div>Home Page</div>,
  },
  // Add more routes here
]); 