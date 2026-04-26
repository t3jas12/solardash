import { Navigate, Outlet } from 'react-router-dom';

const SecuredRoute = ({ allowedRoles }) => {
  // Grab the role from local storage
  const role = localStorage.getItem('userRole');

  // 1. If there is no role at all, boot them to the login page
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  // 2. If this route requires specific roles (e.g., ['admin']), and the user's role isn't in that list, boot them to the dashboard
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. If they pass the checks, render the requested page
  return <Outlet />;
};

export default SecuredRoute;