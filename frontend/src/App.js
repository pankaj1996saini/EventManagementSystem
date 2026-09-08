import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EventCatalogue from './pages/EventCatalogue';
import EventDetails from './pages/EventDetails';
import MyEvents from './pages/MyEvents';
import OrganizerDashboard from './pages/OrganizerDashboard';
import OrganizerEventForm from './pages/OrganizerEventForm';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<EventCatalogue />} />
          <Route path="/events/:id" element={<EventDetails />} />

          <Route
            path="/my-events"
            element={
              <ProtectedRoute allowedRoles={['participant']}>
                <MyEvents />
              </ProtectedRoute>
            }
          />

          <Route
            path="/organizer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/new"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <OrganizerEventForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <OrganizerEventForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
