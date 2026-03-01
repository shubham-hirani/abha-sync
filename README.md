# ABHA-Sync

> Digital health platform bridging paper-based health records with India's ABDM ecosystem.
> **MVP Microservices Architecture** — AI extraction, medical normalization, FHIR R4 bundles, mock ABHA integration.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Docker Compose                              │
│                                                                     │
│  ┌──────────┐   ┌──────────┐   ┌───────────────────────────────┐   │
│  │ Frontend  │   │ Dashboard│   │       API Gateway (:3010)     │   │
│  │  (:3000)  │   │  (:3011) │───│  Orchestrator + Auth + CRUD  │   │
│  └──────────┘   └──────────┘   └──────────┬────────────────────┘   │
│                                            │                        │
│                    ┌───────────────────────┬┴─────────────┐         │
│                    │                       │               │         │
│             ┌──────▼──────┐  ┌────────────▼──┐ ┌─────────▼──────┐  │
│             │AI Extraction│  │  Medical      │ │ FHIR Generator │  │
│             │   (:3001)   │  │  Normalization│ │    (:3003)     │  │
│             │             │  │   (:3002)     │ │                │  │
│             └─────────────┘  └──────────────┘ └────────────────┘  │
│                                                                     │
│             ┌─────────────┐  ┌──────────────┐                      │
│             │ABHA Mock    │  │  PostgreSQL   │                      │
│             │  (:3004)    │  │  (existing)   │                      │
│             └─────────────┘  └──────────────┘                      │
│                                                                     │
│             ┌──────────────────────────────┐                        │
│             │  SQLite (records, FHIR, etc) │                        │
│             └──────────────────────────────┘                        │
│                                                                     │
│  ┌──────────┐  ┌──────────┐                                        │
│  │ Backend  │  │PostgreSQL│  (existing — UNCHANGED)                │
│  │  (:8000) │  │  (:5432) │                                        │
│  └──────────┘  └──────────┘                                        │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow (Upload → FHIR)

```
User uploads prescription text
        │
        ▼
  API Gateway ──POST /extract──► AI Extraction Service
        │                         (regex-based NLP mock)
        │◄─── extracted fields ───┘
        │
        ▼
  API Gateway ──POST /normalize──► Medical Normalization
        │                          (ICD-10, SNOMED, generics)
        │◄─── normalized data ────┘
        │
        ▼
  API Gateway ──POST /generate──► FHIR Generator
        │                         (FHIR R4 Bundle)
        │◄─── FHIR JSON ─────────┘
        │
        ▼
  Store in SQLite (records + fhir_bundles tables)
        │
        ▼
  Return structured response to frontend
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend (existing) | Python 3.11 + FastAPI |
| Frontend (existing) | React 18 + Vite + TypeScript |
| Dashboard | React 18 + Vite + Tailwind CSS |
| Auth | Supabase (Phone OTP) + Mock JWT |
| Database (existing) | PostgreSQL 15 |
| Database (new) | SQLite (better-sqlite3, WAL mode) |
| Microservices | Node.js + Express |
| Health Records | FHIR R4 (4.0.1) |
| Medical Codes | ICD-10 + SNOMED CT |
| Testing | Jest + Supertest |
| Infrastructure | Docker Compose |

---

## Quick Start

### One Command Startup

```bash
# Clone and start
cp .env.example .env
make start
# or: docker compose up --build
```

| Service | URL |
|---------|-----|
| Dashboard (front-end-1) | http://localhost:3011 |
| API Gateway | http://localhost:3010 |
| API Health Check | http://localhost:3010/api/health |
| Frontend (existing) | http://localhost:3000 |
| Backend API (existing) | http://localhost:8000 |
| Swagger Docs (existing) | http://localhost:8000/docs |

### Prerequisites
- Docker Desktop installed and running
- For local dev: Node.js 18+, Python 3.11+
- A [Supabase](https://supabase.com) project with **Phone Auth** enabled (for existing auth flow)

### Environment Setup

```bash
cp .env.example .env
```

Edit `.env` and fill in your Supabase credentials (existing backend):

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Project Structure

```
abha-sync/
├── services/                          # NEW — Microservices
│   ├── shared/                        # Shared utilities
│   │   ├── index.js                   # Main exports
│   │   ├── database.js                # SQLite (5 tables)
│   │   ├── auth.js                    # JWT auth middleware
│   │   ├── validation.js              # Joi schemas
│   │   ├── logger.js                  # Winston logger
│   │   ├── errorHandler.js            # Error classes
│   │   ├── rateLimiter.js             # Rate limiting
│   │   └── tests/
│   ├── ai-extraction/                 # AI text extraction
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── routes/extract.js
│   │   │   └── services/extractor.js  # Regex NLP mock
│   │   └── tests/
│   ├── medical-normalization/         # ICD-10/SNOMED mapping
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── routes/normalize.js
│   │   │   └── services/normalizer.js # Fuzzy matching
│   │   └── tests/
│   ├── fhir-generator/               # FHIR R4 bundle builder
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── routes/generate.js
│   │   │   └── services/generator.js  # Patient/Condition/Obs
│   │   └── tests/
│   ├── abha-mock-service/             # Mock ABHA gov API
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   └── routes/abha.js
│   │   └── tests/
│   └── api-gateway/                   # Orchestrator
│       ├── src/
│       │   ├── index.js
│       │   ├── migrate.js
│       │   ├── routes/
│       │   │   ├── auth.js
│       │   │   ├── upload.js
│       │   │   ├── records.js
│       │   │   ├── consent.js
│       │   │   └── reminders.js
│       │   └── services/serviceClient.js
│       └── tests/
├── front-end-1/                       # Dashboard (UPDATED)
│   ├── src/
│   │   ├── services/api.js            # NEW — API client
│   │   ├── pages/                     # Updated for real API
│   │   └── ...
│   └── ...
├── backend/                           # EXISTING — UNCHANGED
│   └── ...
├── frontend/                          # EXISTING — UNCHANGED
│   └── ...
├── docker-compose.yml                 # All services orchestrated
├── Makefile                           # Build/test commands
├── scripts/
│   ├── setup.sh                       # Full setup script
│   └── test.sh                        # Run all tests
└── .env.example
```

---

## API Endpoints

### New Microservices API (Gateway :3010)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check for all services |
| `POST` | `/api/auth/send-otp` | Send OTP (mock: always `123456`) |
| `POST` | `/api/auth/verify-otp` | Verify OTP → returns JWT token |
| `POST` | `/api/upload` | Upload text → Extract → Normalize → FHIR → Store |
| `GET` | `/api/records` | List all stored medical records |
| `GET` | `/api/records/:id` | Get single record with FHIR bundle |
| `POST` | `/api/consent-upload` | Submit consent + upload to mock ABHA |
| `GET` | `/api/reminders` | List reminders |
| `POST` | `/api/reminders` | Create reminder |
| `PUT` | `/api/reminders/:id` | Update reminder |
| `DELETE` | `/api/reminders/:id` | Delete reminder |

### Existing API (Backend :8000)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/auth/send-otp` | Send OTP via SMS |
| `POST` | `/api/v1/auth/verify-otp` | Verify OTP and get tokens |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |
| `POST` | `/api/v1/auth/logout` | Invalidate session |
| `GET` | `/api/v1/auth/me` | Get current user profile |
| `GET` | `/health` | Health check |

---

## Upload Flow Example

```bash
# 1. Send OTP
curl -X POST http://localhost:3010/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9876543210"}'

# 2. Verify OTP (mock: use 123456)
TOKEN=$(curl -s -X POST http://localhost:3010/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9876543210", "otp": "123456"}' | jq -r '.token')

# 3. Upload prescription text
curl -X POST http://localhost:3010/api/upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "text": "Patient: John Doe, Age: 45\nDr. Smith, Cardiology\nDiagnosis: Hypertension\nRx: Azithromycin 500mg, Paracetamol 650mg\nBP: 140/90 mmHg",
    "fileType": "text",
    "fileName": "prescription.txt"
  }'

# 4. List records
curl http://localhost:3010/api/records \
  -H "Authorization: Bearer $TOKEN"
```

---

## Testing

```bash
# Run all tests
make test
# or: ./scripts/test.sh

# Individual service tests
make test-shared
make test-extraction
make test-normalization
make test-fhir
make test-abha
make test-gateway
```

---

## Makefile Commands

| Command | Description |
|---------|-------------|
| `make start` | Build and start all services (ONE COMMAND) |
| `make stop` | Stop all services |
| `make restart` | Restart services |
| `make test` | Run all test suites |
| `make install` | Install local dependencies |
| `make logs` | View all service logs |
| `make logs-gateway` | View API Gateway logs |
| `make clean` | Remove containers, volumes, images |
| `make help` | Show all available commands |

---

## Database Schema (SQLite)

```sql
-- Users (seeded with default user)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  mobile TEXT UNIQUE NOT NULL,
  name TEXT,
  abha_id TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Medical Records
CREATE TABLE records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT,
  extracted_data TEXT,    -- JSON
  normalized_data TEXT,   -- JSON
  status TEXT DEFAULT 'pending',
  confidence_score REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- FHIR R4 Bundles
CREATE TABLE fhir_bundles (
  id TEXT PRIMARY KEY,
  record_id TEXT UNIQUE NOT NULL,
  bundle TEXT NOT NULL,   -- FHIR JSON
  version TEXT DEFAULT '4.0.1',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (record_id) REFERENCES records(id)
);

-- Consent Logs
CREATE TABLE consent_logs (
  id TEXT PRIMARY KEY,
  record_id TEXT NOT NULL,
  consent_type TEXT NOT NULL,
  granted INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (record_id) REFERENCES records(id)
);

-- Reminders
CREATE TABLE reminders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## Development (without Docker)

### New Microservices (Local)

```bash
# Setup
./scripts/setup.sh

# Start services individually
cd services/ai-extraction && npm start       # :3001
cd services/medical-normalization && npm start # :3002
cd services/fhir-generator && npm start       # :3003
cd services/abha-mock-service && npm start    # :3004
cd services/api-gateway && npm start          # :3010
```

### Existing Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### Existing Frontend

```bash
cd frontend
npm install
npm run dev    # http://localhost:3000
```

---

## License

See [LICENSE](LICENSE) for details.

> Make sure the backend is running first so the Vite dev proxy works.
