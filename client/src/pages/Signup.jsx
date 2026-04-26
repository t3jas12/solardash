import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../library/api'; // Using your API instance

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', emailId: '', password: '', role: 'viewer'
  });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });

    try {
      const response = await api.post('/signup', formData);

      if (response.data.success) {
        setStatus({ type: 'success', msg: 'Employee account created successfully.' });
        setFormData({ firstName: '', lastName: '', emailId: '', password: '', role: 'viewer' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || 'Failed to create account.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-base-content">Register Employee</h2>
          <p className="text-base-content/70 mt-1">Add a new user to the SolarDash system.</p>
        </div>
        <Link to="/dashboard" className="btn btn-ghost btn-sm border border-base-300">Back to Dashboard</Link>
      </div>

      <div className="card bg-base-100 shadow-xl border border-base-300">
        <form className="card-body" onSubmit={handleSignup}>
          
          {status.msg && (
            <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-error'} text-sm rounded-md py-3 mb-4`}>
              <span>{status.msg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">First Name</span></label>
              <input type="text" name="firstName" className="input input-bordered w-full" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Last Name</span></label>
              <input type="text" name="lastName" className="input input-bordered w-full" value={formData.lastName} onChange={handleChange} />
            </div>
          </div>

          <div className="form-control mt-2">
            <label className="label"><span className="label-text font-medium">Email Address</span></label>
            <input type="email" name="emailId" className="input input-bordered w-full" value={formData.emailId} onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Temporary Password</span></label>
              <input type="password" name="password" className="input input-bordered w-full" value={formData.password} onChange={handleChange} required minLength={8} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">System Role</span></label>
              <select name="role" className="select select-bordered w-full" value={formData.role} onChange={handleChange}>
                <option value="viewer">Viewer (Read-only)</option>
                <option value="editor">Editor (Can upload/edit)</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <div className="form-control mt-8">
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? <span className="loading loading-spinner"></span> : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;