import React from 'react';
import { Link } from 'react-router-dom';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const EventCard = ({ event }) => {
  const statusLabel =
    event.registrationStatus === 'open'
      ? 'Open'
      : event.registrationStatus === 'full'
      ? 'Full'
      : 'Closed';

  return (
    <div className="event-card">
      <div className="event-card-image">
        {event.image ? (
          <img src={event.image} alt={event.name} />
        ) : (
          <div className="event-card-placeholder">{event.name.charAt(0)}</div>
        )}
        <span className={`badge badge-${event.registrationStatus}`}>{statusLabel}</span>
      </div>
      <div className="event-card-body">
        <span className="event-card-category">{event.category?.name || 'Uncategorized'}</span>
        <h3>{event.name}</h3>
        <p className="event-card-meta">
          📅 {formatDate(event.date)} &nbsp;|&nbsp; 🕒 {event.time}
        </p>
        <p className="event-card-meta">📍 {event.venue}</p>
        <p className="event-card-meta">💺 {event.availableSeats} seats available</p>
        <Link to={`/events/${event._id}`} className="btn btn-primary btn-block">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
