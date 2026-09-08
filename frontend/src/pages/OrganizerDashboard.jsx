import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState('events');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, regRes] = await Promise.all([
        api.get('/events', { params: { organizer: user._id, status: 'all', limit: 100 } }),
        api.get('/registrations'),
      ]);
      setEvents(eventsRes.data.data);
      setRegistrations(regRes.data.data);
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event? All its registrations will be removed too.')) return;
    try {
      await api.delete(`/events/${id}`);
      setMessage('Event deleted successfully.');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete event.');
    }
  };

  const handleToggleActive = async (event) => {
    try {
      await api.put(`/events/${event._id}`, { isActive: !event.isActive });
      fetchData();
    } catch (err) {
      setError('Failed to update event status.');
    }
  };

  if (loading) return <Loader text="Loading dashboard..." />;

  const totalSeatsMonitored = events.reduce((sum, e) => sum + e.availableSeats, 0);

  return (
    <div className="page-container">
      <div className="section-header">
        <h1>Organizer Dashboard</h1>
        <Link to="/organizer/events/new" className="btn btn-primary">
          + Create Event
        </Link>
      </div>

      <Alert type="success" message={message} />
      <Alert message={error} />

      <div className="stats-row">
        <div className="stat-card">
          <h3>{events.length}</h3>
          <p>Total Events</p>
        </div>
        <div className="stat-card">
          <h3>{registrations.length}</h3>
          <p>Total Registrations</p>
        </div>
        <div className="stat-card">
          <h3>{totalSeatsMonitored}</h3>
          <p>Seats Available (all events)</p>
        </div>
      </div>

      <div className="tabs">
        <button className={tab === 'events' ? 'tab active' : 'tab'} onClick={() => setTab('events')}>
          My Events
        </button>
        <button className={tab === 'registrations' ? 'tab active' : 'tab'} onClick={() => setTab('registrations')}>
          Registrations
        </button>
      </div>

      {tab === 'events' &&
        (events.length === 0 ? (
          <p className="empty-state">You haven't created any events yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Seats</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e._id}>
                  <td>
                    <Link to={`/events/${e._id}`}>{e.name}</Link>
                  </td>
                  <td>{formatDate(e.date)}</td>
                  <td>{e.venue}</td>
                  <td>
                    {e.availableSeats} / {e.totalSeats}
                  </td>
                  <td>
                    <span className={`badge badge-${e.isActive ? 'open' : 'closed'}`}>{e.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="action-cell">
                    <Link to={`/organizer/events/${e._id}/edit`} className="btn btn-secondary btn-sm">
                      Edit
                    </Link>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleToggleActive(e)}>
                      {e.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(e._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}

      {tab === 'registrations' &&
        (registrations.length === 0 ? (
          <p className="empty-state">No registrations for your events yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Attendee</th>
                <th>Email</th>
                <th>Participants</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((r) => (
                <tr key={r._id}>
                  <td>{r.event?.name || '-'}</td>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.participants}</td>
                  <td>
                    <span className={`badge badge-${r.status === 'confirmed' ? 'open' : 'closed'}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
    </div>
  );
};

export default OrganizerDashboard;
