import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../library/api';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const navigate = useNavigate();
  
  // State for the Edit Modal
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', role: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setStatus({ type: 'error', msg: err.response?.data?.error || 'Failed to load users. Ensure you have admin privileges.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE LOGIC ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this employee?")) return;
    
    try {
      const response = await api.delete(`/delete/${id}`);
      if (response.data.success) {
        setStatus({ type: 'success', msg: 'User deleted successfully.' });
        setUsers(users.filter(user => user._id !== id)); 
      }
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || 'Failed to delete user.' });
    }
  };

  // --- EDIT LOGIC ---
  const openEditModal = (user) => {
    setEditingUser(user._id);
    setEditForm({ firstName: user.firstName, lastName: user.lastName, role: user.role });
    document.getElementById('edit_modal').showModal();
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.patch(`/edit/${editingUser}`, editForm);
      if (response.data.success) {
        setStatus({ type: 'success', msg: 'User updated successfully.' });
        setUsers(users.map(u => u._id === editingUser ? { ...u, ...editForm } : u));
        document.getElementById('edit_modal').close();
      }
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || 'Failed to update user.' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pl-2">
        <div>
          {/* Changed to dark text */}
          <h2 className="text-3xl font-semibold text-gray-900">Employee Directory</h2>
          <p className="text-gray-500 mt-2 text-sm">Manage system access and roles.</p>
        </div>
        <div className="flex gap-4">
          <Link to="/signup" className="btn bg-[#fbbf24] hover:bg-[#f59e0b] text-gray-900 border-none rounded-md font-medium shadow-sm">
            + Add New Employee
          </Link>
          <Link to="/dashboard" className="btn btn-outline text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-900 rounded-md">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {status.msg && (
        <div className={`alert ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'} text-sm rounded-lg py-3 mb-6 shadow-sm`}>
          <span>{status.msg}</span>
        </div>
      )}

      {/* Data Table */}
      {/* Changed to light theme card */}
      <div className="card bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="table w-full text-gray-700">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="font-semibold text-xs uppercase tracking-wider py-4">Name</th>
                <th className="font-semibold text-xs uppercase tracking-wider py-4">Email</th>
                <th className="font-semibold text-xs uppercase tracking-wider py-4">Role</th>
                <th className="font-semibold text-xs uppercase tracking-wider py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-10"><span className="loading loading-spinner text-primary"></span></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-10 text-gray-500">No users found.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="font-medium text-gray-900">{user.firstName} {user.lastName}</td>
                    <td className="text-gray-500">{user.emailId}</td>
                    <td>
                      {/* Light theme badges */}
                      <span className={`badge badge-sm font-medium border-none ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : user.role === 'editor' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="text-right">
                      <button onClick={() => openEditModal(user)} className="btn btn-sm btn-ghost text-blue-600 hover:bg-blue-50 mr-2">Edit</button>
                      <button onClick={() => handleDelete(user._id)} className="btn btn-sm btn-ghost text-red-600 hover:bg-red-50">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {/* Changed to light theme modal */}
      <dialog id="edit_modal" className="modal">
        <div className="modal-box bg-white border border-gray-200 shadow-xl">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Edit Employee</h3>
          <form onSubmit={handleEditSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="form-control">
                <label className="label"><span className="label-text text-gray-500 font-medium">First Name</span></label>
                <input type="text" className="input input-bordered bg-white border-gray-300 text-gray-900" value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} required />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-gray-500 font-medium">Last Name</span></label>
                <input type="text" className="input input-bordered bg-white border-gray-300 text-gray-900" value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} />
              </div>
            </div>
            <div className="form-control mb-6">
              <label className="label"><span className="label-text text-gray-500 font-medium">System Role</span></label>
              <select className="select select-bordered bg-white border-gray-300 text-gray-900 font-medium" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}>
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div className="modal-action">
              <button type="button" className="btn btn-ghost text-gray-500 hover:text-gray-900 hover:bg-gray-100" onClick={() => document.getElementById('edit_modal').close()}>Cancel</button>
              <button type="submit" className="btn bg-[#2563eb] hover:bg-[#1d4ed8] text-white border-none">Save Changes</button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="cursor-default bg-gray-900/40 backdrop-blur-sm">close</button>
        </form>
      </dialog>

    </div>
  );
};

export default ManageUsers;