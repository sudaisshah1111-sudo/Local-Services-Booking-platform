import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-bg-card border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold bg-gradient-to-r from-brand-purple to-brand-teal bg-clip-text text-transparent">
        LocalServices
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            {user.role === 'provider' && (
              <Link to="/dashboard" className="text-gray-300 hover:text-brand-teal transition text-sm">
                Dashboard
              </Link>
            )}
            {user.role === 'customer' && (
              <Link to="/my-bookings" className="text-gray-300 hover:text-brand-teal transition text-sm">
                My Bookings
              </Link>
            )}
            <span className="text-gray-400 text-sm">Hi, {user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg px-4 py-1.5 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-300 hover:text-brand-teal transition text-sm">
              Log In
            </Link>
            <Link
              to="/register"
              className="bg-gradient-to-r from-brand-purple to-brand-pink text-white text-sm rounded-lg px-4 py-1.5 hover:opacity-90 transition"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;