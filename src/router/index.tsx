import { createBrowserRouter } from 'react-router-dom';
import Login from '../pages/Login/Login';
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword';
import Dashboard from '../pages/Dashboard/Dashboard';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import Register from '../pages/Register/Register';
import Terms from '../pages/Terms/Terms';

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
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'articles',
        element: <div>Articles List</div>, // TODO: Replace with Articles component
      },
      {
        path: 'articles/create',
        element: <div>Create Article</div>, // TODO: Replace with CreateArticle component
      },
    ],
  },
  {
    path: '/terms',
    element: <Terms />,
  },
  // Add more routes here
]); 