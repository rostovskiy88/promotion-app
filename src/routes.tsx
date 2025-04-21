import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      {/* Add more routes as needed */}
    </Routes>
  );
};

export default AppRoutes; 