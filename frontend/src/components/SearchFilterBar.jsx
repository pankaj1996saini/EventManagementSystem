import React from 'react';

const SearchFilterBar = ({ filters, onChange, categories, onReset }) => {
  const handleInput = (e) => onChange({ ...filters, [e.target.name]: e.target.value, page: 1 });

  return (
    <div className="filter-bar">
      <input
        type="text"
        name="search"
        placeholder="Search events by name, description, venue..."
        value={filters.search}
        onChange={handleInput}
        className="filter-input filter-search"
      />
      <select name="category" value={filters.category} onChange={handleInput} className="filter-input">
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>
      <input type="date" name="date" value={filters.date} onChange={handleInput} className="filter-input" />
      <input
        type="text"
        name="venue"
        placeholder="Location / venue"
        value={filters.venue}
        onChange={handleInput}
        className="filter-input"
      />
      <select name="sortBy" value={filters.sortBy} onChange={handleInput} className="filter-input">
        <option value="date">Sort: Date</option>
        <option value="name">Sort: Name</option>
        <option value="availableSeats">Sort: Seats Available</option>
      </select>
      <select name="order" value={filters.order} onChange={handleInput} className="filter-input">
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
      <button className="btn btn-secondary" onClick={onReset} type="button">
        Reset
      </button>
    </div>
  );
};

export default SearchFilterBar;
