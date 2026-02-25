# ABHA-Sync

> Digital health platform bridging paper-based health records with India's ABDM ecosystem.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3.11 + FastAPI |
| Frontend | React 18 + Vite + TypeScript |
| Auth | Supabase (Phone OTP) |
| Database | PostgreSQL 15 |
| Infrastructure | Docker Compose |

---

## Quick Start

### 1. Prerequisites
- Docker Desktop installed and running
- A [Supabase](https://supabase.com) project with **Phone Auth** enabled

### 2. Configure Supabase
In your Supabase dashboard:
1. Go to **Authentication → Providers → Phone**
2. Enable Phone provider and configure Twilio (for SMS OTP delivery)
3. Note down your **Project URL**, **Anon Key**, **Service Role Key**, and **JWT Secret**

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your Supabase credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

### 4. Start the stack

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

---

## Project Structure

```
abha-sync/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py           # Settings / env vars
│   │   │   ├── database.py         # SQLAlchemy engine
│   │   │   └── supabase_client.py  # Supabase client factory
│   │   ├── middleware/
│   │   │   └── auth.py             # JWT Bearer dependency
│   │   ├── models/
│   │   │   └── user.py             # User SQLAlchemy model
│   │   ├── routers/
│   │   │   └── auth.py             # Auth API endpoints
│   │   ├── schemas/
│   │   │   └── auth.py             # Pydantic request/response models
│   │   └── main.py                 # FastAPI entrypoint
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── OTPInput.tsx        # 6-digit OTP input
│   │   ├── context/
│   │   │   └── AuthContext.tsx     # Auth state + session
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── services/
│   │   │   └── api.ts              # Axios + interceptors
│   │   ├── App.tsx                 # Router + route guards
│   │   ├── main.tsx
│   │   └── index.css               # Global styles
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.example
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Auth Flow

```
User enters phone → POST /api/v1/auth/send-otp → Supabase sends SMS
User enters OTP  → POST /api/v1/auth/verify-otp → Supabase verifies
                 → User profile upserted in PostgreSQL
                 → Returns access_token + refresh_token
Frontend stores tokens in localStorage → Protected routes accessible
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/auth/send-otp` | Send OTP via SMS |
| `POST` | `/api/v1/auth/verify-otp` | Verify OTP and get tokens |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |
| `POST` | `/api/v1/auth/logout` | Invalidate session |
| `GET` | `/api/v1/auth/me` | Get current user profile |
| `GET` | `/health` | Health check |

---

## Development (without Docker)

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env     # fill in your credentials
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev              # runs on http://localhost:3000
```

> Make sure the backend is running first so the Vite dev proxy works.
