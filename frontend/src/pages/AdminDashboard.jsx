import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const AdminDashboard = () => {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [usersRes, eventsRes, regRes, catRes] = await Promise.all([
        api.get('/users', { params: { search: userSearch, role: roleFilter } }),
        api.get('/events', { params: { status: 'all', limit: 100 } }),
        api.get('/registrations'),
        api.get('/categories'),
      ]);
      setUsers(usersRes.data.data);
      setEvents(eventsRes.data.data);
      setRegistrations(regRes.data.data);
      setCategories(catRes.data.data);
    } catch (err) {
      setError('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      api.get('/users', { params: { search: userSearch, role: roleFilter } }).then((res) => setUsers(res.data.data));
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSearch, roleFilter]);

  const toggleUserStatus = async (u) => {
    try {
      await api.put(`/users/${u._id}/status`, { status: u.status === 'active' ? 'blocked' : 'active' });
      setMessage(`User ${u.status === 'active' ? 'blocked' : 'activated'} successfully.`);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const toggleEventActive = async (e) => {
    try {
      await api.put(`/events/${e._id}`, { isActive: !e.isActive });
      fetchAll();
    } catch (err) {
      setError('Failed to update event.');
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm('Delete this event and all its registrations?')) return;
    try {
      await api.delete(`/events/${id}`);
      setMessage('Event deleted.');
      fetchAll();
    } catch (err) {
      setError('Failed to delete event.');
    }
  };

  const addCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      await api.post('/categories', { name: newCategory.trim() });
      setNewCategory('');
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add category.');
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchAll();
    } catch (err) {
      setError('Failed to delete category.');
    }
  };

  if (loading) return <Loader text="Loading admin dashboard..." />;

  return (
    <div className="page-container">
      <h1>Admin Dashboard</h1>
      <Alert type="success" message={message} />
      <Alert message={error} />

      <div className="stats-row">
        <div className="stat-card">
          <h3>{users.length}</h3>
          <p>Users</p>
        </div>
        <div className="stat-card">
          <h3>{events.length}</h3>
          <p>Events</p>
        </div>
        <div className="stat-card">
          <h3>{registrations.length}</h3>
          <p>Registrations</p>
        </div>
        <div className="stat-card">
          <h3>{categories.length}</h3>
          <p>Categories</p>
        </div>
      </div>

      <div className="tabs">
        <button className={tab === 'users' ? 'tab active' : 'tab'} onClick={() => setTab('users')}>
          Users
        </button>
        <button className={tab === 'events' ? 'tab active' : 'tab'} onClick={() => setTab('events')}>
          Events
        </button>
        <button className={tab === 'registrations' ? 'tab active' : 'tab'} onClick={() => setTab('registrations')}>
          Registrations
        </button>
        <button className={tab === 'categories' ? 'tab active' : 'tab'} onClick={() => setTab('categories')}>
          Categories
        </button>
      </div>

      {tab === 'users' && (
        <>
          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search by name or email"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="filter-input filter-search"
            />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="filter-input">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="organizer">Organizer</option>
              <option value="participant">Participant</option>
            </select>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                  <td>
                    <span className={`badge badge-${u.status === 'active' ? 'open' : 'closed'}`}>{u.status}</span>
                  </td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>
                    {u.role !== 'admin' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => toggleUserStatus(u)}>
                        {u.status === 'active' ? 'Block' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {tab === 'events' && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Organizer</th>
              <th>Date</th>
              <th>Seats</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e._id}>
                <td>{e.name}</td>
                <td>{e.organizer?.name || '-'}</td>
                <td>{formatDate(e.date)}</td>
                <td>
                  {e.availableSeats} / {e.totalSeats}
                </td>
                <td>
                  <span className={`badge badge-${e.isActive ? 'open' : 'closed'}`}>{e.isActive ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="action-cell">
                  <button className="btn btn-secondary btn-sm" onClick={() => toggleEventActive(e)}>
                    {e.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteEvent(e._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'registrations' && (
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
      )}

      {tab === 'categories' && (
        <div>
          <form className="inline-form" onSubmit={addCategory}>
            <input
              type="text"
              placeholder="New category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Add Category
            </button>
          </form>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteCategory(c._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
