import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import UploadData from './pages/UploadData';
// Assuming you have these pages created based on our previous setup:
import SiteList from './pages/SiteList'; // Just replace with your actual directory component name if different
import ManageUsers from './pages/ManageUsers';
import SystemLogs from './pages/SystemLogs';

// Bouncers
import SecuredRoute from './components/SecuredRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-gray-50">
        
        <Navbar /> 
        
        <main className="grow">
          <Routes>

            <Route element={<PublicRoute />}>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
            </Route>

            {/* ========================================== */}
            {/* SECURED ROUTES (Must be logged in)         */}
            {/* ========================================== */}
            <Route element={<SecuredRoute />}>
              
              {/* Visible to ALL logged-in users (Admin, Editor, Viewer) */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />

              {/* Visible ONLY to Admins & Editors */}
              <Route element={<SecuredRoute allowedRoles={['admin', 'editor']} />}>
                <Route path="/upload" element={<UploadData />} />
                <Route path="/sites" element={<SiteList />} />
              </Route>

              {/* Visible ONLY to Admins */}
              <Route element={<SecuredRoute allowedRoles={['admin']} />}>
                <Route path="/manage-users" element={<ManageUsers />} />
                <Route path="/logs" element={<SystemLogs />} />
                {/* Your signup is now effectively part of manage-users, but if you still have a separate route: */}
                <Route path="/signup" element={<Signup />} />
              </Route>

            </Route>

            {/* Catch-all: If a user types a random URL, boot them safely to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />

          </Routes>
        </main>

        <Footer />
        
      </div>
    </BrowserRouter>
  );
}

export default App;