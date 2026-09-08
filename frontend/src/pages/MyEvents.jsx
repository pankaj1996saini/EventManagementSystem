import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const MyEvents = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/registrations', { params: { sortBy: 'createdAt', order: 'desc' } });
      setRegistrations(res.data.data);
    } catch (err) {
      setError('Failed to load your registrations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this registration?')) return;
    try {
      await api.delete(`/registrations/${id}`);
      setMessage('Registration cancelled successfully.');
      fetchRegistrations();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel registration.');
    }
  };

  if (loading) return <Loader text="Loading your events..." />;

  return (
    <div className="page-container">
      <h1>My Events</h1>
      <Alert type="success" message={message} />
      <Alert message={error} />

      {registrations.length === 0 ? (
        <p className="empty-state">
          You haven't registered for any events yet. <Link to="/events">Browse events →</Link>
        </p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Venue</th>
              <th>Participants</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((r) => (
              <tr key={r._id}>
                <td>
                  <Link to={`/events/${r.event?._id}`}>{r.event?.name || 'Event deleted'}</Link>
                </td>
                <td>{r.event ? formatDate(r.event.date) : '-'}</td>
                <td>{r.event?.venue || '-'}</td>
                <td>{r.participants}</td>
                <td>
                  <span className={`badge badge-${r.status === 'confirmed' ? 'open' : 'closed'}`}>{r.status}</span>
                </td>
                <td>
                  {r.status === 'confirmed' && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleCancel(r._id)}>
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyEvents;
