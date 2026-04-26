import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="hero min-h-[calc(100vh-4rem)] bg-base-100">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold text-base-content">SolarDash MIS</h1>
          <p className="py-6 text-base-content/70">
            Authorized personnel only. Centralized management system for tracking utility-scale solar asset performance, energy yields, and hardware metrics.
          </p>
          <Link to="/login" className="btn btn-primary w-full shadow-lg">
            Access Secure Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;