import { Link } from 'react-router-dom';

const Dashboard = () => {
  // Grab the role from local storage
  const role = localStorage.getItem('userRole') || 'viewer';

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      
      <div className="mb-10 pl-2">
        <h2 className="text-3xl font-semibold text-gray-900">IPCL Solar Headquarters</h2>
        <p className="text-gray-500 mt-2 text-sm">Welcome to the central control panel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 1. Analytics Card: VISIBLE TO EVERYONE */}
        <div className="card bg-white border border-gray-200 rounded-xl hover:border-gray-400 transition-colors shadow-sm">
          <div className="card-body p-6 flex flex-col">
            <h5 className="card-title text-gray-800 text-lg mb-1">Analytics</h5>
            <p className="text-xs text-gray-500 flex-grow leading-relaxed">
              View performance charts and key metrics for all solar sites.
            </p>
            <div className="card-actions mt-6">
              <Link to="/analytics" className="btn bg-[#27272a] hover:bg-[#3f3f46] text-white border-none w-full min-h-0 h-10 rounded-md font-medium">
                View charts
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Data Ingestion Card: VISIBLE ONLY TO ADMINS & EDITORS */}
        {(role === 'admin' || role === 'editor') && (
          <div className="card bg-white border border-gray-200 rounded-xl hover:border-blue-500 transition-colors shadow-sm">
            <div className="card-body p-6 flex flex-col">
              <h5 className="card-title text-gray-800 text-lg mb-1">Data Upload</h5>
              <p className="text-xs text-gray-500 flex-grow leading-relaxed">
                Upload monthly Excel hardware logs to the database.
              </p>
              <div className="card-actions mt-6">
                <Link to="/upload" className="btn bg-[#2563eb] hover:bg-[#1d4ed8] text-white border-none w-full min-h-0 h-10 rounded-md font-medium">
                  Upload data
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 3. Site Directory Card: VISIBLE ONLY TO ADMINS & EDITORS */}
        {(role === 'admin' || role === 'editor') && (
          <div className="card bg-white border border-gray-200 rounded-xl hover:border-slate-500 transition-colors shadow-sm">
            <div className="card-body p-6 flex flex-col">
              <h5 className="card-title text-gray-800 text-lg mb-1">Site directory</h5>
              <p className="text-xs text-gray-500 flex-grow leading-relaxed">
                View, edit, or remove raw data for active solar sites.
              </p>
              <div className="card-actions mt-6">
                <Link to="/sites" className="btn bg-[#475569] hover:bg-[#334155] text-white border-none w-full min-h-0 h-10 rounded-md font-medium">
                  Manage sites
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 4. Admin Tools Card: VISIBLE ONLY TO ADMINS */}
        {role === 'admin' && (
          <div className="card bg-white border border-[#fbbf24] rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.15)]">
            <div className="card-body p-6 flex flex-col">
              <h5 className="card-title text-gray-800 text-lg mb-1">Admin tools</h5>
              <p className="text-xs text-gray-500 flex-grow leading-relaxed">
                Manage employee directory, edit roles, and assign system access.
              </p>
              <div className="card-actions mt-6">
                <Link to="/manage-users" className="btn bg-[#fbbf24] hover:bg-[#f59e0b] text-gray-900 border-none w-full min-h-0 h-10 rounded-md font-medium">
                  Employee Directory
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 5. System Logs Card: VISIBLE ONLY TO ADMINS */}
        {role === 'admin' && (
          <div className="card bg-white border border-[#fbbf24] rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.15)]">
            <div className="card-body p-6 flex flex-col">
              <h5 className="card-title text-gray-800 text-lg mb-1">System Logs</h5>
              <p className="text-xs text-gray-500 flex-grow leading-relaxed">
                Monitor user authentication, logins, and logouts in real-time.
              </p>
              <div className="card-actions mt-6">
                <Link to="/logs" className="btn bg-[#fbbf24] hover:bg-[#f59e0b] text-gray-900 border-none w-full min-h-0 h-10 rounded-md font-medium">
                  View Audit Trail
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;