import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Spin } from 'antd';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spin size='large' />
      </div>
    );
  }

  if (!user) {
    // Redirect to login page but save the attempted location
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
