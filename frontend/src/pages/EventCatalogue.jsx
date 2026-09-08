import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import EventCard from '../components/EventCard';
import SearchFilterBar from '../components/SearchFilterBar';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

const defaultFilters = { search: '', category: '', date: '', venue: '', sortBy: 'date', order: 'asc', page: 1 };

const EventCatalogue = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    ...defaultFilters,
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
  });
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.data)).catch(() => {});
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { ...filters, limit: 9 };
      Object.keys(params).forEach((k) => (params[k] === '' ? delete params[k] : null));
      const res = await api.get('/events', { params });
      setEvents(res.data.data);
      setPagination({ page: res.data.page, pages: res.data.pages, total: res.data.total });
    } catch (err) {
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setFilters({ ...filters, page: newPage });
  };

  return (
    <div className="page-container">
      <h1>Event Catalogue</h1>
      <SearchFilterBar
        filters={filters}
        categories={categories}
        onChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
      />

      <Alert message={error} />

      {loading ? (
        <Loader text="Loading events..." />
      ) : events.length === 0 ? (
        <p className="empty-state">No events match your search. Try adjusting the filters.</p>
      ) : (
        <>
          <p className="results-count">{pagination.total} event(s) found</p>
          <div className="event-grid">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
          {pagination.pages > 1 && (
            <div className="pagination">
              <button disabled={pagination.page <= 1} onClick={() => handlePageChange(pagination.page - 1)}>
                ← Prev
              </button>
              <span>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button disabled={pagination.page >= pagination.pages} onClick={() => handlePageChange(pagination.page + 1)}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventCatalogue;
