import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../library/api';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isPublicView = ['/', '/login'].includes(location.pathname);

  // Read the role from memory (default to 'viewer' if not found for safety)
  const role = localStorage.getItem('userRole') || 'viewer';

  const handleLogout = async () => {
    try {
      const res = await api.post('/logout');
      if (res.data.success) {
        // NEW: Wipe the role from memory on logout
        localStorage.removeItem('userRole'); 
        navigate('/login');
      }
    } catch (err) { console.error("Logout failed:", err); }
  };

  return (
    <div className="navbar bg-[#1c1c1c] text-white shadow-sm px-4 md:px-8 border-b border-[#2a2a2a]">
      <div className="flex-1">
        <Link to={isPublicView ? "/" : "/dashboard"} className="text-xl font-bold tracking-wide">
          SolarDash
        </Link>
      </div>
      <div className="flex-none">
        {isPublicView ? (
          <ul className="menu menu-horizontal px-1">
            <li><Link to="/login" className="btn btn-primary btn-sm rounded-md">Sign In</Link></li>
          </ul>
        ) : (
          <ul className="menu menu-horizontal px-1 items-center gap-4 text-gray-300 text-sm font-medium">
            <li><Link to="/dashboard" className="hover:text-white">Control Panel</Link></li>
            <li><Link to="/analytics" className="hover:text-white">Analytics</Link></li>
            
            {/* ONLY Admins and Editors can see the Directory link */}
            {(role === 'admin' || role === 'editor') && (
              <li><Link to="/sites" className="hover:text-white">Directory</Link></li>
            )}
            
            <li>
              <button onClick={handleLogout} className="bg-[#ef4444] hover:bg-[#dc2626] text-white px-4 py-1.5 rounded-md transition-colors ml-2">
                Sign out
              </button>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};
export default Navbar;