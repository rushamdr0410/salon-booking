# Salon Appointment Booking System

Django REST Framework + React + SQLite.

## Prerequisites
- Python 3.10+
- Node.js 18+

## Backend setup
```bash
cd backend
python -m venv venv
source venv/Scripts/activate      # Windows Git Bash
pip install -r requirements.txt
python manage.py migrate
python manage.py loaddata seed
python manage.py runserver
```

## Frontend setup
```bash
cd frontend
npm install
```
Create `frontend/.env`:
```
VITE_API_URL=http://localhost:8000/api
```
Then run `npm run dev` and open http://localhost:5173

## API endpoints
| Method | URL | Purpose |
|---|---|---|
| GET, POST | /api/services/ | list, create services |
| PUT, DELETE | /api/services/:id/ | update, delete a service |
| GET, POST | /api/appointments/ | list (optional `?status=`), create |
| PATCH | /api/appointments/:id/status/ | update status |
| DELETE | /api/appointments/:id/ | delete appointment |

## Architecture and key decisions
(write 5-6 bullets here in your own words)