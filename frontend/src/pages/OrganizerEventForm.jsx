import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import Alert from '../components/Alert';
import Loader from '../components/Loader';

const emptyForm = {
  name: '',
  description: '',
  image: '',
  category: '',
  date: '',
  time: '',
  venue: '',
  totalSeats: '',
  rules: '',
};

const OrganizerEventForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        const ev = res.data.data;
        setForm({
          name: ev.name,
          description: ev.description,
          image: ev.image || '',
          category: ev.category?._id || '',
          date: ev.date ? ev.date.substring(0, 10) : '',
          time: ev.time,
          venue: ev.venue,
          totalSeats: ev.totalSeats,
          rules: ev.rules || '',
        });
      } catch (err) {
        setError('Could not load event for editing.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.name.trim()) return 'Event name is required.';
    if (!form.description.trim()) return 'Description is required.';
    if (!form.category) return 'Please select a category.';
    if (!form.date) return 'Date is required.';
    if (!form.time) return 'Time is required.';
    if (!form.venue.trim()) return 'Venue is required.';
    if (!form.totalSeats || Number(form.totalSeats) < 1) return 'Total seats must be at least 1.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const payload = { ...form, totalSeats: Number(form.totalSeats) };
      if (isEdit) {
        await api.put(`/events/${id}`, payload);
      } else {
        await api.post('/events', payload);
      }
      navigate('/organizer/dashboard');
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Failed to save event.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader text="Loading event..." />;

  return (
    <div className="page-container">
      <h1>{isEdit ? 'Edit Event' : 'Create New Event'}</h1>
      <Alert message={error} />
      <form className="event-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Event Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" rows="4" value={form.description} onChange={handleChange}></textarea>
        </div>
        <div className="form-group">
          <label>Image URL (optional)</label>
          <input type="text" name="image" value={form.image} onChange={handleChange} placeholder="https://..." />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Total Seats</label>
            <input type="number" name="totalSeats" min="1" value={form.totalSeats} onChange={handleChange} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input type="time" name="time" value={form.time} onChange={handleChange} />
          </div>
        </div>
        <div className="form-group">
          <label>Venue</label>
          <input type="text" name="venue" value={form.venue} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Event Rules (optional)</label>
          <textarea name="rules" rows="3" value={form.rules} onChange={handleChange}></textarea>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : isEdit ? 'Update Event' : 'Create Event'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/organizer/dashboard')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrganizerEventForm;
