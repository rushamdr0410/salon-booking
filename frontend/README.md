# Salon Appointment Booking System

A small, full-stack appointment booking application for a salon. Staff can manage salon services, book appointments, and view, filter, update and delete appointments.

Built as an in-house coding assessment for Vrit Technologies.

- **Backend:** Django + Django REST Framework (function-based views)
- **Frontend:** React (Vite) with React Router and Axios
- **Database:** SQLite

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Setup and Running Locally](#setup-and-running-locally)
6. [Sample Data (Seed)](#sample-data-seed)
7. [API Reference](#api-reference)
8. [Validation and Business Rules](#validation-and-business-rules)
9. [Database Design](#database-design)
10. [Architecture and Key Decisions](#architecture-and-key-decisions)
11. [Frontend Overview](#frontend-overview)
12. [Manual Testing Guide](#manual-testing-guide)
13. [Troubleshooting](#troubleshooting)
14. [Assumptions and Scope](#assumptions-and-scope)
15. [Possible Improvements](#possible-improvements)

---

## Features

**Services management**
- View the list of salon services
- Add, edit and delete a service (name, price, duration in minutes)
- A service that already has appointments cannot be deleted

**Appointment booking**
- Booking form with customer name, phone, service (dropdown), date, time and optional notes
- Client-side and server-side validation with clear error messages
- Double-booking prevention for the same service, date and time

**Appointment management**
- Table of all appointments (customer, service, date, time, status, action)
- Filter appointments by status
- Update status using a dropdown that offers only valid next statuses
- Delete an appointment

**Status workflow**

```
Pending   -> Confirmed -> Completed
Pending   -> Cancelled
Confirmed -> Cancelled
```

`Completed` and `Cancelled` are final states.

**UI quality**
- Loading and error states for every API call, with a Retry button
- Responsive layout (tables scroll horizontally on small screens)
- Reusable components

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend framework | Django, Django REST Framework |
| Backend views | Function-based views with `@api_view` |
| CORS | django-cors-headers |
| Database | SQLite |
| Frontend | React (Vite), React Router, Axios |
| Styling | Plain CSS |

---

## Project Structure

```
salon-booking/
├── README.md
├── .gitignore
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/                  # Django project (settings, root urls)
│   │   ├── settings.py
│   │   └── urls.py
│   └── booking/                 # Django app
│       ├── models.py            # Service, Appointment
│       ├── serializers.py       # Validation and JSON conversion
│       ├── views.py             # Function-based API views
│       ├── urls.py              # API routes
│       ├── admin.py
│       ├── migrations/
│       └── fixtures/
│           └── seed.json        # Sample data
└── frontend/
    ├── package.json
    ├── .env                     # VITE_API_URL (create this yourself)
    └── src/
        ├── main.jsx             # Entry point (BrowserRouter)
        ├── App.jsx              # Routes
        ├── index.css            # Styles
        ├── api/                 # One function per API endpoint
        │   ├── client.js        # Axios instance
        │   ├── services.js
        │   └── appointments.js
        ├── components/          # Reusable UI pieces
        │   ├── Navbar.jsx
        │   ├── Loader.jsx
        │   ├── ErrorMessage.jsx
        │   ├── StatusBadge.jsx
        │   └── ServiceForm.jsx
        ├── pages/               # One component per screen
        │   ├── ServicesPage.jsx
        │   ├── BookAppointmentPage.jsx
        │   └── AppointmentsPage.jsx
        └── utils/
            ├── errors.js        # Maps API errors to form errors
            ├── format.js        # Time and text formatting
            └── status.js        # Status list and allowed transitions
```

---

## Prerequisites

- **Python** 3.10 or newer
- **Node.js** 20.19 or newer, with npm
- **Git**

---

## Setup and Running Locally

You need two terminals: one for the backend and one for the frontend.

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd salon-booking
```

### 2. Backend (Terminal 1)

```bash
cd backend
python -m venv venv

# Activate the virtual environment
source venv/Scripts/activate      # Windows (Git Bash)
# venv\Scripts\activate           # Windows (CMD / PowerShell)
# source venv/bin/activate        # macOS / Linux

pip install -r requirements.txt
python manage.py migrate
python manage.py loaddata seed    # loads sample services and appointments
python manage.py runserver
```

The API is now available at `http://localhost:8000/api/`.

Optional: create an admin user to inspect the data at `http://localhost:8000/admin/`.

```bash
python manage.py createsuperuser
```

### 3. Frontend (Terminal 2)

```bash
cd frontend
npm install
```

Create a file named `.env` inside the `frontend` folder (next to `package.json`):

```
VITE_API_URL=http://localhost:8000/api
```

Then start the dev server:

```bash
npm run dev
```

Open **http://localhost:5173**.

> Restart `npm run dev` whenever you change `.env`. Vite only reads it at startup.

### Ports

| Service | URL |
|---|---|
| Django API | http://localhost:8000 |
| React app | http://localhost:5173 |

The frontend origin (`http://localhost:5173`) is allowed through `CORS_ALLOWED_ORIGINS` in `backend/config/settings.py`. If Vite starts on a different port, add that origin to the list.

---

## Sample Data (Seed)

Sample data lives in `backend/booking/fixtures/seed.json` and contains the example services from the assessment (Haircut, Hair Coloring, Facial) plus a few appointments.

Load it with:

```bash
python manage.py loaddata seed
```

To regenerate the file after changing the data:

```bash
python manage.py dumpdata booking --indent 2 --output booking/fixtures/seed.json
```

To start from a clean database:

```bash
# delete backend/db.sqlite3, then:
python manage.py migrate
python manage.py loaddata seed
```

---

## API Reference

Base URL: `http://localhost:8000/api`

All requests and responses use JSON. URLs end with a trailing slash (Django convention).

### Services

| Method | Endpoint | Description |
|---|---|---|
| GET | `/services/` | List all services |
| POST | `/services/` | Create a service |
| PUT | `/services/:id/` | Update a service |
| DELETE | `/services/:id/` | Delete a service |

**Service object**

```json
{
  "id": 1,
  "name": "Haircut",
  "price": "500.00",
  "duration": 30
}
```

> `price` is returned as a string to preserve decimal precision. The frontend converts it with `Number(...)` when needed.

**POST /services/**

```json
{ "name": "Facial", "price": 1500, "duration": 60 }
```

### Appointments

| Method | Endpoint | Description |
|---|---|---|
| GET | `/appointments/` | List appointments, newest first. Optional `?status=pending` filter |
| POST | `/appointments/` | Create an appointment |
| PATCH | `/appointments/:id/status/` | Update an appointment's status |
| DELETE | `/appointments/:id/` | Delete an appointment |

**Appointment object**

```json
{
  "id": 1,
  "customer_name": "Ram Sharma",
  "customer_phone": "9800000001",
  "service": 1,
  "service_name": "Haircut",
  "date": "2026-09-18",
  "time": "10:00:00",
  "notes": "",
  "status": "pending",
  "created_at": "2026-10-07T05:10:05.423590Z"
}
```

- `service` is the service ID and is what you send when creating an appointment.
- `service_name` is read-only and is included so the UI can show the name without an extra request.
- `status` and `created_at` are read-only on create. New appointments always start as `pending`.

**POST /appointments/**

```json
{
  "customer_name": "Ram Sharma",
  "customer_phone": "9800000001",
  "service": 1,
  "date": "2026-09-18",
  "time": "10:00",
  "notes": "Optional note"
}
```

**PATCH /appointments/:id/status/**

```json
{ "status": "confirmed" }
```

### HTTP status codes

| Code | When it is returned |
|---|---|
| 200 OK | Successful GET, PUT or PATCH |
| 201 Created | Successful POST |
| 204 No Content | Successful DELETE |
| 400 Bad Request | Validation failed, double booking, invalid status transition, or a service that cannot be deleted because it has appointments |
| 404 Not Found | The service or appointment does not exist |

### Error response formats

Validation errors are keyed by field name:

```json
{
  "name": ["This field may not be blank."],
  "price": ["Price must be a positive number."],
  "duration": ["Duration must be greater than zero."]
}
```

Business-rule errors:

```json
{ "non_field_errors": ["This slot is already booked."] }
```

```json
{ "error": "Cannot change status from 'pending' to 'completed'." }
```

```json
{ "error": "Cannot delete service with existing appointments." }
```

---

## Validation and Business Rules

### Validation

| Rule | Enforced in |
|---|---|
| Customer name cannot be empty | Frontend and serializer |
| Customer phone cannot be empty | Frontend and serializer |
| A service must be selected | Frontend and serializer |
| Appointment date and time are required | Frontend and serializer |
| Service name cannot be empty | Frontend and serializer |
| Service price must be a positive number | Frontend and serializer |
| Service duration must be greater than zero | Frontend and serializer |
| Appointment must reference an existing service | Serializer (foreign key lookup) |

The backend never trusts the frontend: every rule is checked again on the server.

### Appointment conflict (double booking)

An appointment is rejected if another appointment exists with the **same service, same date and same time**.

- Cancelled appointments do not block a slot, so a cancelled slot can be booked again.
- The check lives in `AppointmentSerializer.validate()`.
- The check excludes the appointment itself, so it stays correct for updates.

### Status transitions

Allowed transitions are defined in one dictionary in `views.py`:

| From | Can move to |
|---|---|
| pending | confirmed, cancelled |
| confirmed | completed, cancelled |
| completed | none |
| cancelled | none |

Any other transition returns a `400` response. The UI only offers the valid next statuses.

---

## Database Design

SQLite with two tables and a one-to-many relationship.

```
┌──────────────────┐         ┌───────────────────────┐
│ Service          │ 1     * │ Appointment           │
├──────────────────┤◄────────┤───────────────────────┤
│ id (PK)          │         │ id (PK)               │
│ name             │         │ customer_name         │
│ price (decimal)  │         │ customer_phone        │
│ duration (min)   │         │ service_id (FK)       │
└──────────────────┘         │ date                  │
                             │ time                  │
                             │ notes (optional)      │
                             │ status                │
                             │ created_at            │
                             └───────────────────────┘
```

| Model | Field | Type |
|---|---|---|
| Service | name | CharField(100) |
| Service | price | DecimalField(10, 2) |
| Service | duration | PositiveIntegerField (minutes) |
| Appointment | customer_name | CharField(100) |
| Appointment | customer_phone | CharField(15) |
| Appointment | service | ForeignKey(Service, `on_delete=PROTECT`, `related_name="appointments"`) |
| Appointment | date | DateField |
| Appointment | time | TimeField |
| Appointment | notes | TextField (optional) |
| Appointment | status | CharField with choices, default `pending` |
| Appointment | created_at | DateTimeField (auto) |

Migrations are in `backend/booking/migrations/`.

---

## Architecture and Key Decisions

### Overview

```
React (Vite, :5173)
   │  Axios (JSON over HTTP)
   ▼
Django REST Framework (:8000)
   │  views.py  ->  serializers.py  ->  models.py
   ▼
SQLite (db.sqlite3)
```

The frontend and backend are fully separate. The React app only talks to the backend through the REST API, so either side can be replaced independently.

### Backend decisions

- **Function-based views with `@api_view`.** As the assessment requires. Each view is a plain function that branches on `request.method`, which keeps the request flow easy to follow.
- **Serializers hold the validation.** Field rules (`validate_price`, `validate_duration`, and so on) and cross-field rules (the double-booking check) live in the serializers, not in the views. Views stay thin and focused on HTTP concerns.
- **`on_delete=PROTECT` on the service relationship.** Deleting a service that still has appointments would either orphan or silently destroy booking history. `PROTECT` blocks it, and the view turns the resulting `ProtectedError` into a readable `400` response.
- **Conflict check in `validate()`.** It queries for another non-cancelled appointment with the same service, date and time, and excludes the current record when editing. This follows the assessment's clarification that a same-service, same-slot check is sufficient.
- **A dedicated status endpoint.** Status changes go through `PATCH /appointments/:id/status/` and use their own `StatusUpdateSerializer`. The `status` field is read-only on the main appointment serializer, so it can only change through this controlled path.
- **Transition rules in a single dictionary.** `ALLOWED_TRANSITIONS` makes the workflow easy to read and change without hunting through `if` statements.
- **`select_related('service')`.** The appointments list joins the service table in one query instead of one extra query per row.
- **`service_name` as a read-only serializer field.** The table needs the service name, and this avoids a second request from the frontend.
- **Consistent HTTP status codes.** 200, 201, 204, 400 and 404 are used with their standard meanings.

### Frontend decisions

- **API layer separated from components.** Every endpoint is one small function in `src/api/`. Components never call Axios directly, so URLs and methods live in a single place.
- **Reusable components.** `Loader`, `ErrorMessage`, `StatusBadge`, `Navbar` and `ServiceForm` are shared across pages. `ServiceForm` is used for both adding and editing.
- **Two layers of validation.** The forms validate in the browser for instant feedback, and the server validates again. Server errors are mapped back onto the matching form fields by `parseApiError` in `utils/errors.js`.
- **Explicit loading, error and empty states.** Every page handles waiting, failed and empty responses, and distinguishes "validation failed" from "server unreachable".
- **Cancellation guard in `useEffect`.** Data-loading effects ignore results that arrive after the component has changed, which prevents state updates from stale requests.
- **Status filtering on the server.** The status dropdown sends `?status=...` to the API, so filtering stays correct as the data grows.
- **Environment-based API URL.** The base URL comes from `VITE_API_URL`, so no address is hard-coded in components.

---

## Frontend Overview

| Route | Page | Purpose |
|---|---|---|
| `/` and `/services` | ServicesPage | List services; add, edit, delete |
| `/book` | BookAppointmentPage | Booking form; redirects to the list on success |
| `/appointments` | AppointmentsPage | Table, status filter, status update, delete |

---

## Manual Testing Guide

### In the browser

1. **Services:** add, edit and delete a service. Submit the empty form and a negative price to see validation messages.
2. **Delete protection:** try to delete a service that has an appointment. A red message explains why it is blocked.
3. **Booking:** submit the empty form (each field shows an error), then book with valid data. You are taken to the appointment list.
4. **Double booking:** book the same service, date and time again. You see "This slot is already booked."
5. **Appointments:** filter by status, update a status, and delete an appointment.
6. **Error handling:** stop the Django server and use the app. You see "Could not reach the server" style messages with a Retry button.

### With curl

```bash
# List services
curl http://localhost:8000/api/services/

# Invalid service (expect 400 with field errors)
curl -X POST http://localhost:8000/api/services/ \
  -H "Content-Type: application/json" \
  -d '{"name":"","price":-5,"duration":0}'

# Create an appointment (expect 201)
curl -X POST http://localhost:8000/api/appointments/ \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"Ram Sharma","customer_phone":"9800000001","service":1,"date":"2026-09-18","time":"10:00"}'

# Same slot again (expect 400: slot already booked)
curl -X POST http://localhost:8000/api/appointments/ \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"Hari Thapa","customer_phone":"9800000003","service":1,"date":"2026-09-18","time":"10:00"}'

# Invalid transition pending -> completed (expect 400)
curl -X PATCH http://localhost:8000/api/appointments/1/status/ \
  -H "Content-Type: application/json" -d '{"status":"completed"}'

# Valid transition (expect 200)
curl -X PATCH http://localhost:8000/api/appointments/1/status/ \
  -H "Content-Type: application/json" -d '{"status":"confirmed"}'

# Filter by status
curl "http://localhost:8000/api/appointments/?status=confirmed"

# Delete a service that has appointments (expect 400)
curl -i -X DELETE http://localhost:8000/api/services/1/
```

---

## Troubleshooting

| Problem | Cause and fix |
|---|---|
| `source venv\Scripts\activate` fails in Git Bash | Use forward slashes: `source venv/Scripts/activate` |
| Browser shows a CORS error | Check that `corsheaders.middleware.CorsMiddleware` is near the top of `MIDDLEWARE`, and that `CORS_ALLOWED_ORIGINS` includes the exact frontend origin. Restart Django |
| "Network Error" in the browser | The Django server is not running, or `VITE_API_URL` is wrong. Restart `npm run dev` after editing `.env` |
| `loaddata` installs 0 objects | `seed.json` is empty. Add data, then regenerate it with `dumpdata` (see [Sample Data](#sample-data-seed)) |
| Vite port is not 5173 | Add the actual origin to `CORS_ALLOWED_ORIGINS` |
| POST to the API returns 404 or redirects | Make sure the URL ends with a trailing slash |
| Styles look missing | Confirm `src/main.jsx` imports `./index.css` and that the file contains the project styles |

---

## Assumptions and Scope

- A single salon with no authentication, as the assessment states. Staff access is not restricted.
- Conflict detection is a same-service, same-date, same-time check. It does not consider service duration or overlapping time ranges.
- Prices are in NPR and are stored as decimals.
- Times are stored and compared as entered, with no time zone conversion.
- Not implemented, because they are out of scope: authentication, payments, SMS reminders, staff management, and a full calendar UI.

---

## Possible Improvements

- Duration-based conflict detection (reject overlapping time ranges)
- Search by customer name or phone, and a date filter
- Pagination on the appointment list
- Revenue and appointment summary
- Automated backend tests with DRF's test client
- A database-level unique constraint on service, date and time
- Authentication for staff users

---

## Author

Rusha