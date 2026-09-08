import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: '', participants: 1 });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/events/${id}`);
      setEvent(res.data.data);
    } catch (err) {
      setError('Event not found or could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRegisterClick = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }
    setShowForm(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.name.trim()) return 'Name is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'A valid email is required.';
    if (!form.phone.trim()) return 'Phone number is required.';
    if (!form.participants || Number(form.participants) < 1) return 'Number of participants must be at least 1.';
    if (event && Number(form.participants) > event.availableSeats) return `Only ${event.availableSeats} seat(s) available.`;
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }
    setFormError('');
    setSubmitting(true);
    try {
      await api.post(`/events/${id}/register`, { ...form, participants: Number(form.participants) });
      setSuccessMsg('You are successfully registered for this event!');
      setShowForm(false);
      fetchEvent();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader text="Loading event details..." />;
  if (error) return <div className="page-container"><Alert message={error} /></div>;
  if (!event) return null;

  return (
    <div className="page-container">
      <div className="event-details">
        <div className="event-details-image">
          {event.image ? <img src={event.image} alt={event.name} /> : <div className="event-card-placeholder large">{event.name.charAt(0)}</div>}
        </div>
        <div className="event-details-body">
          <span className="event-card-category">{event.category?.name}</span>
          <h1>{event.name}</h1>
          <p className="event-details-desc">{event.description}</p>

          <div className="event-details-grid">
            <div><strong>📅 Date</strong><br />{formatDate(event.date)}</div>
            <div><strong>🕒 Time</strong><br />{event.time}</div>
            <div><strong>📍 Venue</strong><br />{event.venue}</div>
            <div><strong>👤 Organizer</strong><br />{event.organizer?.name}</div>
            <div><strong>💺 Available Seats</strong><br />{event.availableSeats} / {event.totalSeats}</div>
            <div><strong>Status</strong><br /><span className={`badge badge-${event.registrationStatus}`}>{event.registrationStatus}</span></div>
          </div>

          {event.rules && (
            <div className="event-rules">
              <strong>Event Rules</strong>
              <p>{event.rules}</p>
            </div>
          )}

          <Alert type="success" message={successMsg} />
          <Alert message={formError} />

          {event.registrationStatus === 'open' && !showForm && (
            <button className="btn btn-primary" onClick={handleRegisterClick}>
              Register Now
            </button>
          )}

          {event.registrationStatus !== 'open' && (
            <p className="empty-state">Registration is currently {event.registrationStatus}.</p>
          )}

          {showForm && (
            <form className="registration-form" onSubmit={handleSubmit}>
              <h3>Complete Your Registration</h3>
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="text" name="phone" value={form.phone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Number of Participants</label>
                <input type="number" name="participants" min="1" max={event.availableSeats} value={form.participants} onChange={handleChange} />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Confirm Registration'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          <p style={{ marginTop: '1rem' }}>
            <Link to="/events">← Back to events</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
