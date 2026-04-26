import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../library/api';

const Login = () => {
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/login', { emailId, password });

      if (response.data.success) {
        // CRUCIAL STEP: Save the user's role to the browser's memory
        // This is what unlocks the Dashboard UI!
        localStorage.setItem('userRole', response.data.user.role);
        
        // Redirect to the dashboard hub
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-140px)] bg-gray-50 px-4">
      <div className="card w-full max-w-md bg-white border border-gray-200 shadow-xl rounded-xl">
        <div className="card-body p-8">
          
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-sm text-gray-500 mt-2">Sign in to the IPCL Solar Control Panel</p>
          </div>

          {error && (
            <div className="alert bg-red-50 text-red-700 border border-red-200 text-sm rounded-lg py-3 mb-6 shadow-sm">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text text-gray-700 font-medium">Email Address</span>
              </label>
              <input 
                type="email" 
                placeholder="admin@ipcl.com" 
                className="input input-bordered w-full bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                required
              />
            </div>

            <div className="form-control w-full mb-6">
              <label className="label">
                <span className="label-text text-gray-700 font-medium">Password</span>
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="input input-bordered w-full bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn bg-[#2563eb] hover:bg-[#1d4ed8] text-white border-none w-full h-12 rounded-lg font-medium tracking-wide disabled:bg-gray-200 disabled:text-gray-400"
              disabled={loading}
            >
              {loading ? <span className="loading loading-spinner"></span> : 'Secure Login'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;