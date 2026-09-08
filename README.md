# EventManagementSystem — Online Event Management & Registration System

A full-stack MERN application where **organizers** can create and manage events,
**participants** can discover events and register for them, and an **admin**
oversees users, organizers, and events.

Built to satisfy the "Computer Programming – Full Stack Project" assignment spec
(React, Node.js/Express, MongoDB, JWT auth, CRUD, search/filter/sort, protected
routes, responsive UI).

---

## Tech Stack

| Layer      | Technology                                   |
|------------|-----------------------------------------------|
| Frontend   | React.js, React Router, Axios, CSS3            |
| Backend    | Node.js, Express.js, REST API                   |
| Database   | MongoDB + Mongoose                              |
| Auth       | JWT (JSON Web Tokens), bcrypt password hashing  |
| Validation | express-validator (backend), inline (frontend)  |

## Features

- Register / Login / Logout with JWT, role-based access (Admin, Organizer, Participant)
- Home page with upcoming/popular events, categories, search
- Event catalogue with search, category/date/venue filters, sorting, pagination
- Event details page with seat-availability–aware registration
- "My Events" page for participants with cancellation
- Organizer dashboard: create/edit/delete events, view registrations, monitor seats, activate/deactivate
- Admin dashboard: manage users (block/activate), manage events, view all registrations, manage categories
- Protected routes on both frontend (route guards) and backend (JWT middleware + role checks)
- Backend validation, centralized error handling, meaningful success/error responses
- Responsive design (mobile-friendly), loading states, no hard-coded records — all data comes from the database via the app

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+ and npm
- [MongoDB](https://www.mongodb.com/try/download/community) running locally (or a MongoDB Atlas connection string)

Check versions:
```bash
node -v
npm -v
mongod --version
```

---

#1. Clone the project

```
git clone https://github.com/pankaj1996saini/EventManagementSystem.git
```

#2. Start MongoDB

If using a local install:
```bash
mongod
```
(Leave this running in its own terminal, or run MongoDB as a service.)

If using MongoDB Atlas instead, just copy your connection string — you'll use it in step 3.

#3. Set up and run the Backend

```bash
cd event-management-system/backend
npm install
cp .env.example .env
```

Open `.env` and adjust if needed (defaults work for a local MongoDB install):
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/event_management
JWT_SECRET=9ce462d12e699a8edd00c4f9fdb082b4a4021a6be18ebc1d89d2978f762e2065a6555695719bebfd97a246fda957505dd626f398389b9252d700be8c75188240
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

(Optional but recommended) seed a default admin account and starter categories:
```bash
npm run seed
```
This creates:
- Admin login → `admin@eventms.com` / `Admin@123`
- Categories: Technology, Music, Sports, Business, Education, Arts

Start the backend:
```bash
npm run dev
# or
npm start
```
Backend runs at **http://localhost:5000**. Health check: `http://localhost:5000/api/health`

## 4. Set up and run the Frontend

Open a **new terminal**:
```bash
cd event-management-system/frontend
npm install
cp .env.example .env
```
`.env` should contain:
```
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm start
```
The app opens at **http://localhost:3000**.

---

## Using the App

1. Go to `http://localhost:3000/register` and create an **Organizer** account, and
   separately a **Participant** account (use two different browsers or incognito
   windows to be logged in as both at once).
2. Log in as the Organizer → **Dashboard → Create Event** → fill in the event form.
3. Log in as the Participant → browse **Events**, open an event, click **Register Now**.
4. Log in as **Admin** (`admin@eventms.com` / `Admin@123`, if you ran `npm run seed`)
   to manage users, events, registrations, and categories from the Admin Dashboard.

> Note: category management is done from the Admin Dashboard → Categories tab, or via the seed script. An organizer cannot create an event without at least one category existing.

---

## Project Structure

```
backend/
  config/db.js            MongoDB connection
  models/                 User, Event, Registration, Category (Mongoose schemas)
  middleware/auth.js       JWT verification + role-based authorization
  middleware/errorHandler.js
  controllers/             Business logic per resource
  routes/                  Express routers
  utils/generateToken.js
  seed/seed.js             Optional: creates admin + starter categories
  server.js                App entry point

frontend/
  src/
    api/axios.js            Axios instance with JWT interceptor
    context/AuthContext.js  Auth state (login/register/logout)
    components/             Navbar, EventCard, ProtectedRoute, Loader, Alert, SearchFilterBar
    pages/                  Home, Login, Register, EventCatalogue, EventDetails,
                             MyEvents, OrganizerDashboard, OrganizerEventForm,
                             AdminDashboard, NotFound
    styles/index.css        Global responsive styling
```

## REST API Summary

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/events                 (search, category, date, venue, sortBy, order, page, limit)
GET    /api/events/:id
POST   /api/events                 (organizer, admin)
PUT    /api/events/:id             (organizer who owns it, admin)
DELETE /api/events/:id             (organizer who owns it, admin)
POST   /api/events/:id/register    (participant)

GET    /api/registrations          (role-scoped: own / own events / all)
GET    /api/registrations/:id
DELETE /api/registrations/:id      (cancel)

GET    /api/users                  (admin)
PUT    /api/users/:id/status       (admin — activate/block)

GET    /api/categories
POST   /api/categories             (admin)
DELETE /api/categories/:id         (admin)
```

## Building for Production

Frontend:
```bash
cd frontend
npm run build
```
This outputs a static build in `frontend/build`, which can be served by any static
host (Netlify, Vercel, nginx) or served directly by the Express backend if desired.

---

Developed by Pankaj Saini
