import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

const Register = () => {
  const { register, loading, error, setError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'participant' });
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.name.trim()) return 'Name is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Please enter a valid email.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const err = validate();
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError('');

    const { confirmPassword, ...payload } = form;
    const result = await register(payload);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join EventHub to discover and host events</p>
        <Alert message={validationError || error} />
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Jane Doe" />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input id="phone" type="text" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 555 123 4567" />
          </div>
          <div className="form-group">
            <label htmlFor="role">I want to</label>
            <select id="role" name="role" value={form.role} onChange={handleChange}>
              <option value="participant">Attend Events (Participant)</option>
              <option value="organizer">Organize Events (Organizer)</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
