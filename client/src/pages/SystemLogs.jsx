import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../library/api';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get('/logs');
        if (response.data.success) {
          setLogs(response.data.data);
        }
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/dashboard'); // Boot non-admins away
        } else {
          setError('Failed to fetch system logs.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="flex justify-between items-center mb-8 pl-2">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">System Activity Logs</h2>
          <p className="text-gray-500 mt-2 text-sm">Monitor user authentication events.</p>
        </div>
        <Link to="/dashboard" className="btn btn-outline text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-900 rounded-md">
          Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="alert bg-red-50 text-red-700 border border-red-200 text-sm rounded-lg py-3 mb-6 shadow-sm">
          <span>{error}</span>
        </div>
      )}

      <div className="card bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="table w-full text-gray-700">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="font-semibold text-xs uppercase tracking-wider py-4">Timestamp</th>
                <th className="font-semibold text-xs uppercase tracking-wider py-4">User</th>
                <th className="font-semibold text-xs uppercase tracking-wider py-4">Email</th>
                <th className="font-semibold text-xs uppercase tracking-wider py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-10"><span className="loading loading-spinner text-blue-600"></span></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-10 text-gray-500">No activity recorded yet.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="font-medium text-gray-900">
                      {new Date(log.timestamp).toLocaleString('en-IN', { 
                        dateStyle: 'medium', timeStyle: 'short' 
                      })}
                    </td>
                    <td className="text-gray-700">{log.userName}</td>
                    <td className="text-gray-500">{log.userEmail}</td>
                    <td>
                      <span className={`badge badge-sm font-medium border-none ${log.action === 'LOGIN' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                        {log.action}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;