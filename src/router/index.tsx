import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../pages/Login/Login';
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword';
import Dashboard from '../pages/Dashboard/Dashboard';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import Register from '../pages/Register/Register';
import Terms from '../pages/Terms/Terms';
import AuthenticatedLayout from '../components/Layout/AuthenticatedLayout';
import EditProfile from '../pages/Profile/Profile';
import AddArticle from '../pages/AddArticle/AddArticle';
import EditArticle from '../pages/EditArticle/EditArticle';
import ArticleDetails from '../components/ArticleDetails/ArticleDetails';
import NotFound from '../pages/NotFound/NotFound';

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
    element: <Navigate to='/login' replace />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <Dashboard />
        </AuthenticatedLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/terms',
    element: <Terms />,
  },
  {
    path: '/dashboard/profile',
    element: (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <EditProfile />
        </AuthenticatedLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/add-article',
    element: (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <AddArticle onCancel={() => window.history.back()} />
        </AuthenticatedLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/edit-article/:id',
    element: (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <EditArticle onCancel={() => window.history.back()} />
        </AuthenticatedLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard/article/:id',
    element: (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <ArticleDetails />
        </AuthenticatedLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/article/:id',
    element: (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <ArticleDetails />
        </AuthenticatedLayout>
      </ProtectedRoute>
    ),
  },
  // Catch-all route for 404 errors
  {
    path: '*',
    element: <NotFound />,
  },
  // Add more routes here
]);
