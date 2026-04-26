import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import SiteList from './pages/SiteList';
import UploadData from './pages/UploadData';
import ManageUsers from './pages/ManageUsers';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
        {/* Navbar is global and will adapt based on the current URL */}
        <Navbar />
        
        <main className="grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            
            {/* These routes should eventually be wrapped in a ProtectedRoute component */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/sites" element={<SiteList />} />
            <Route path="/upload" element={<UploadData />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/manage-users" element={<ManageUsers />} />

            {/* Fallback to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;