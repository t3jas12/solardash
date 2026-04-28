import { Link } from 'react-router-dom';

const SiteList = () => {
  // We will fetch real data from your backend later. 
  // For now, this is the UI layout so you can see how it looks.
  
  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Active solar sites</h2>
        <div>
          <Link to="/upload" className="btn btn-primary me-2">Upload logs</Link>
          <Link to="/dashboard" className="btn btn-outline-secondary">Back</Link>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Site name</th>
                <th>State presence</th>
                <th>Generation (KWH)</th>
                <th>AC CUF %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Placeholder row. We will map over your MongoDB data here! */}
              <tr>
                <td> Site 1 (testing)</td>
                <td>Uttarakhand</td>
                <td>45,000</td>
                <td>18.5%</td>
                <td><span className="badge bg-success">Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SiteList;