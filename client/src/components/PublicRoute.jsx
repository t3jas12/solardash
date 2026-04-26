import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
  const role = localStorage.getItem('userRole');

  // If they are already logged in, push them straight to the dashboard
  if (role) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;