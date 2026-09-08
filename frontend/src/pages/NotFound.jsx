import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="page-container" style={{ textAlign: 'center', padding: '4rem 0' }}>
    <h1>404</h1>
    <p>The page you're looking for doesn't exist.</p>
    <Link to="/" className="btn btn-primary">
      Go Home
    </Link>
  </div>
);

export default NotFound;
