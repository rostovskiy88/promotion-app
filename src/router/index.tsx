import { createBrowserRouter } from 'react-router-dom';
import Login from '../pages/Login/Login';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <div>Home Page</div>,
  },
  // Add more routes here
]); 