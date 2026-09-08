import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import EventCard from '../components/EventCard';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

const Home = () => {
  const [upcoming, setUpcoming] = useState([]);
  const [popular, setPopular] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [upcomingRes, popularRes, categoriesRes] = await Promise.all([
          api.get('/events', { params: { sortBy: 'date', order: 'asc', limit: 6 } }),
          api.get('/events', { params: { sortBy: 'availableSeats', order: 'asc', limit: 4 } }),
          api.get('/categories'),
        ]);
        setUpcoming(upcomingRes.data.data);
        setPopular(popularRes.data.data);
        setCategories(categoriesRes.data.data);
      } catch (err) {
        setError('Could not load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    window.location.href = `/events?search=${encodeURIComponent(search)}`;
  };

  return (
    <div>
      <section className="hero">
        <h1>Discover & Register for Amazing Events</h1>
        <p>Find conferences, workshops, concerts and more — all in one place.</p>
        <form className="hero-search" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </section>

      {categories.length > 0 && (
        <section className="section">
          <h2>Browse by Category</h2>
          <div className="category-pills">
            {categories.map((c) => (
              <Link key={c._id} to={`/events?category=${c._id}`} className="category-pill">
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <Alert message={error} />

      {loading ? (
        <Loader text="Loading events..." />
      ) : (
        <>
          <section className="section">
            <div className="section-header">
              <h2>Upcoming Events</h2>
              <Link to="/events">View all →</Link>
            </div>
            {upcoming.length === 0 ? (
              <p className="empty-state">No upcoming events yet. Check back soon!</p>
            ) : (
              <div className="event-grid">
                {upcoming.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            )}
          </section>

          <section className="section">
            <div className="section-header">
              <h2>Popular Events</h2>
              <Link to="/events">View all →</Link>
            </div>
            {popular.length === 0 ? (
              <p className="empty-state">No events available right now.</p>
            ) : (
              <div className="event-grid">
                {popular.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
