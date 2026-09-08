import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🎫 EventHub
        </Link>
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/events">Events</Link>
          {user && user.role === 'participant' && <Link to="/my-events">My Events</Link>}
          {user && user.role === 'organizer' && <Link to="/organizer/dashboard">Dashboard</Link>}
          {user && user.role === 'admin' && <Link to="/admin/dashboard">Admin</Link>}

          {!user ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn-nav">
                Sign Up
              </Link>
            </>
          ) : (
            <div className="navbar-user">
              <span className="navbar-username">
                {user.name} <small>({user.role})</small>
              </span>
              <button className="btn-nav btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
