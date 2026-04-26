import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../library/api';

const UploadData = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus({ type: '', msg: '' });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      return setStatus({ type: 'error', msg: 'Please select an Excel file first.' });
    }

    setLoading(true);
    setStatus({ type: '', msg: '' });

    const formData = new FormData();
    formData.append('excelFile', file); 

    try {
      const response = await api.post('/upload-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        setStatus({ type: 'success', msg: response.data.message || 'Data successfully ingested into the database!' });
        setFile(null); 
        document.getElementById('excel-upload-input').value = ''; 
      }
    } catch (err) {
      setStatus({ 
        type: 'error', 
        msg: err.response?.data?.error || 'Failed to upload data. Ensure it is a valid Excel file.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-10 pl-2">
        <div>
          {/* Fixed: Dark text for the header */}
          <h2 className="text-3xl font-semibold text-gray-900">Data Ingestion</h2>
          <p className="text-gray-500 mt-2 text-sm">Upload monthly Excel hardware logs.</p>
        </div>
        <Link to="/dashboard" className="btn btn-outline btn-sm text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-900 rounded-md font-medium">
          Back to Dashboard
        </Link>
      </div>

      {/* Upload Box */}
      {/* Fixed: bg-white for the main card container */}
      <div className="card bg-white border border-gray-200 rounded-xl shadow-sm">
        <form className="card-body p-8" onSubmit={handleUpload}>

          {/* Status Messages */}
          {status.msg && (
            <div className={`alert ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'} text-sm rounded-lg py-3 mb-6`}>
              <span>{status.msg}</span>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div className="flex flex-col items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-12 h-12 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold text-blue-600">Click to browse</span> or drag and drop</p>
                <p className="text-xs text-gray-400">.XLSX, .XLS files only</p>
              </div>
              <input 
                id="excel-upload-input" 
                type="file" 
                className="hidden" 
                accept=".xlsx, .xls"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Selected File Display Card */}
          {file && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between border border-gray-200">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="text-2xl opacity-80">📊</span>
                <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
              </div>
              <span className="text-xs text-gray-500 font-mono">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-8">
            <button 
              type="submit" 
              className="btn bg-[#2563eb] hover:bg-[#1d4ed8] text-white border-none w-full h-12 rounded-lg font-medium tracking-wide disabled:bg-gray-200 disabled:text-gray-400" 
              disabled={loading || !file}
            >
              {loading ? <span className="loading loading-spinner"></span> : 'Process Data Pipeline'}
            </button>
          </div>

        </form>
      </div>
      
    </div>
  );
};

export default UploadData;