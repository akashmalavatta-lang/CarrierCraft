# CareerCraft (CC) — AI-Powered Resume & Interview Coach

[![Production Status](https://img.shields.io/badge/Production-Ready-brightgreen)](https://github.com/akashmalavatta-lang/CarrierCraft)
[![Test Suite](https://img.shields.io/badge/Tests-10%2F10%20Passed-success)](https://github.com/akashmalavatta-lang/CarrierCraft)
[![Platform](https://img.shields.io/badge/Deploy-Render%20%7C%20Vercel%20%7C%20Docker-blue)](https://render.com)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

CareerCraft is an enterprise-grade, evidence-based AI career platform built specifically for students, freshers, job seekers, and early-career professionals. It provides transparent ATS resume analysis, honest bullet refinement without hallucination, structured STAR mock interview evaluations, and personalized skill gap roadmaps.

---

## 📑 Table of Contents

- [Architectural Overview](#-architectural-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Deployment Failure (Status 3) Root Cause Analysis & Fix](#-deployment-failure-status-3-root-cause-analysis--fix)
- [Prerequisites](#-prerequisites)
- [Local Installation & Setup](#-local-installation--setup)
- [Environment Variables](#-environment-variables)
- [Database Configuration & Models](#-database-configuration--models)
- [Running Automated Tests](#-running-automated-tests)
- [Render Production Deployment Guide](#-render-production-deployment-guide)
- [Security & Access Control](#-security--access-control)
- [Troubleshooting & FAQ](#-troubleshooting--faq)

---

## 🏛 Architectural Overview

```
CareerCraft Architecture
├── Frontend (React 18 + Vite 8 + Tailwind/CareerCraft CSS)
│   ├── Interactive 3-slide Hero Carousel & Introductory Animation
│   ├── JWT Auth & Token Expiration Interceptor
│   ├── Resume Upload (PDF / DOCX with drag-and-drop)
│   ├── ATS Score Dashboard & Transparent Rubric Visualizer
│   └── Real-Time Mock Interview Simulator (STAR Method)
│
├── Backend (Flask 3.1 + Gunicorn 23 + SQLAlchemy 2.0)
│   ├── Safe Database Initialization (Idempotent table bootstrap & PostgreSQL pool_pre_ping)
│   ├── Strict User Isolation (RBAC & scoped foreign-key queries)
│   ├── Document Parser (PyMuPDF & python-docx with scanned image / encrypted PDF detection)
│   ├── Deterministic NLP Engine (70+ modern skill taxonomy, TF-IDF JD matcher)
│   └── Interview Evaluator (STAR rubric, clarity/completeness/structure scoring, follow-ups)
│
└── Infrastructure & Deployment
    ├── render.yaml (1-click Blueprint for Render.com)
    ├── build.sh (Automated dependency installation & React distribution builder)
    ├── Multi-Stage Dockerfile (Node 20 build -> Python 3.11 runtime)
    └── Procfile (Zero-config Gunicorn runner with dynamic $PORT binding)
```

---

## 🚀 Key Features

1. **Evidence-Based ATS Analyzer**:
   - Scores across 6 transparent dimensions: ATS compatibility, Content quality, Format readability, Skills breadth, Experience progression, Education completeness.
   - Detects ATS-unfriendly formatting (tables, embedded photos, multi-columns, exotic bullet glyphs).
   - Guarantees **zero hallucinated metrics or fabricated credentials**. Every suggestion provides exact resume evidence, reason, and a structured template example:
     `[Action Verb] + [Technical Contribution] using [Stack] resulting in [Real Metric]`.

2. **Job Description (JD) Semantic Matcher**:
   - Matches candidate resume directly against employer job postings.
   - Separates mandatory requirements from preferred qualifications.
   - Calculates keyword overlap and skill gap analysis with actionable recommendations.

3. **STAR Method Mock Interview Coach**:
   - Generates role-specific questions for Software Engineers, Full-Stack Developers, Data Scientists, and DevOps.
   - Evaluates user answers on **Relevance (30%)**, **Completeness (25%)**, **Clarity (20%)**, and **STAR Structure (15%)**.
   - Contextually generates follow-up technical and behavioral questions.

4. **Security & Data Isolation**:
   - bcrypt-hashed credentials with 8+ character strength validation.
   - Scoped database operations (`user_id = int(get_jwt_identity())`), preventing any user from viewing or altering another candidate's resumes or interview transcripts.
   - Safe sanitization against SQL injection, XSS (`bleach`), and path traversal (`uuid4` unique file keys).

---

## 💻 Technology Stack

| Component | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Backend Framework** | Flask | 3.1.0 | RESTful API server |
| **WSGI Server** | Gunicorn | 23.0.0 | High-performance multi-threaded production server |
| **ORM & Database** | SQLAlchemy / SQLite / PostgreSQL | 2.0.40 | Relational persistence with connection pooling |
| **Authentication** | Flask-JWT-Extended & bcrypt | 4.7.1 / 1.0.1 | Stateless JWT auth with encrypted passwords |
| **Document Parsing** | PyMuPDF (fitz) & python-docx | 1.26.1 / 1.1.2 | PDF and DOCX text extraction |
| **NLP & Scoring** | scikit-learn & numpy | 1.6.1 / 2.2.5 | TF-IDF matching and keyword frequency analysis |
| **Frontend Framework** | React & Vite | 18.3.1 / 8.3.4 | Ultra-responsive client UI with hot module reload |
| **Routing & State** | React Router DOM & Lucide Icons | 6.22.3 / 0.344.0 | SPA navigation and iconography |

---

## 🔍 Deployment Failure (Status 3) Root Cause Analysis & Fix

### Symptoms Observed
On Render dashboard:
```
Exited with status 3 while running your code.
...
CREATE TABLE resume_analyses (
    id INTEGER NOT NULL,
    resume_id INTEGER NOT NULL,
    ats_issues TEXT,
    missing_sections TEXT,
    keywords TEXT,
    analyzed_at DATETIME,
    model_used VARCHAR(100),
    PRIMARY KEY (id),
    FOREIGN KEY(resume_id) REFERENCES resumes (id)
)
Worker exiting (pid: ...)
Shutting down: Master
```

### Confirmed Root Causes
1. **Dynamic `$PORT` Binding Mismatch**:
   - In Docker deployments, Render dynamically assigns a port (e.g. `PORT=10000`).
   - The previous `Dockerfile` line 39 had hardcoded `CMD ["gunicorn", "--bind", "0.0.0.0:5000", ...]`. Because this was an exec array, environment variable substitution did not occur. The server bound to port 5000, Render's external health check pinged port 10000, received no response, and terminated the container with exit status 3.
   - **Fix**: Updated `Dockerfile` and `gunicorn.conf.py` to dynamically bind to `0.0.0.0:${PORT:-5000}`.
2. **Root Directory Execution & Missing `app` Module**:
   - In Render Native Python deployments, if Root Directory is left as repository root (`.`), executing `gunicorn run:app` fails with `ModuleNotFoundError: No module named 'app'` because `app` is located inside `backend/app`.
   - **Fix**: Added `sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))` in `backend/run.py`, provided a root `Procfile` with `--chdir backend`, and created `render.yaml` specifying build and start commands explicitly.
3. **Database Concurrency Race During Worker Startup**:
   - Gunicorn boot previously invoked `create_app()` across workers concurrently, where each worker executed `db.create_all()` and seeded demo accounts simultaneously. On SQLite, this triggered `database is locked`, killing workers and causing Gunicorn arbiter to halt with exit code 3.
   - **Fix**: Isolated database initialization in an idempotent `init_db(app)` routine with transactional rollback protection and added `pool_pre_ping=True` for PostgreSQL.
4. **Unsafe JSON Deserialization in Model `to_dict()`**:
   - Models previously called raw `json.loads` directly on columns such as `ats_issues` and `rubric`. If a value was null or unparsed, it threw `JSONDecodeError` or `AttributeError: 'str' object has no attribute 'get'`.
   - **Fix**: Created universal `safe_json_loads(val, default)` and None-safe numeric rounding.

---

## 🛠 Local Installation & Setup

### Prerequisites
- Python 3.10+ (tested on Python 3.11.9)
- Node.js 18+ & npm 9+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/akashmalavatta-lang/CarrierCraft.git
cd CarrierCraft
```

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend development server
python run.py
```
Backend will start on `http://localhost:5000`.

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend will be accessible at `http://localhost:5173`.

---

## ⚙️ Environment Variables

Create `.env` in the `backend/` directory (refer to `.env.example`):

```ini
# Flask Security
FLASK_ENV=production
SECRET_KEY=generate-a-strong-32-byte-secret-key-here
JWT_SECRET_KEY=generate-a-strong-jwt-secret-key-here

# Database (Default: local SQLite; for Render use PostgreSQL)
# Local SQLite:
DATABASE_URL=sqlite:///cc_careercraft.db
# Render PostgreSQL Example:
# DATABASE_URL=postgresql://user:password@hostname:5432/dbname

# File Upload Constraints
MAX_CONTENT_LENGTH=10485760
UPLOAD_FOLDER=uploads

# Concurrency & Timeouts
WEB_CONCURRENCY=1
GUNICORN_TIMEOUT=120

# Optional integrations
GEMINI_API_KEY=
ADZUNA_APP_ID=
ADZUNA_APP_KEY=
```

---

## 🧪 Running Automated Tests

A comprehensive unit and integration test suite verifies all 10 core subsystems:
```bash
cd backend
python -m unittest test_production_suite.py
```
**Test Results**:
```
..........
----------------------------------------------------------------------
Ran 10 tests in 5.558s

OK
```

Coverage includes:
- Healthcheck endpoint diagnostics (`/health` and `/api/health`)
- Database models, foreign-key relationships, and safe JSON parsing
- Transaction rollback behavior on integrity conflict
- Text cleaning and whitespace normalization
- Error handling on missing, corrupted, or encrypted documents
- Explainable resume analysis and transparent scoring
- Semantic JD matching with keyword overlap
- Interview question generation and rubric-based STAR evaluation
- User registration, login, JWT validation, and cross-user data isolation

---

## 🚢 Render Production Deployment Guide

### Option A: 1-Click Deployment via `render.yaml`
1. Push your repository to GitHub.
2. Log into [Render.com](https://render.com).
3. Click **New +** &rarr; **Blueprint**.
4. Connect `CarrierCraft` repository.
5. Render reads `render.yaml` automatically and provisions the web service with all required environment variables, healthchecks, and build scripts.

### Option B: Manual Web Service Setup on Render
1. Create a new **Web Service** on Render connected to your repository.
2. Set configuration:
   - **Environment**: `Python 3`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --config gunicorn.conf.py run:app`
   - **Health Check Path**: `/api/health`
3. Add Environment Variables in Render Dashboard:
   - `PYTHON_VERSION`: `3.11.9`
   - `FLASK_ENV`: `production`
   - `SECRET_KEY`: *(Generate a secure random string)*
   - `JWT_SECRET_KEY`: *(Generate a secure random string)*
   - `WEB_CONCURRENCY`: `1`
   - `GUNICORN_TIMEOUT`: `120`
4. Click **Create Web Service**.
5. Once deployed, verify:
   ```bash
   curl -I https://<your-render-url>.onrender.com/api/health
   ```
   Should return `HTTP/1.1 200 OK` with JSON `{"status": "healthy"}`.

---

## 🔒 Security & Access Control

- **Password Storage**: Passwords are encrypted using salted bcrypt hashes. Plaintext passwords are never logged or stored.
- **Resource Ownership**: Endpoints verify JWT identity on every request. Resumes, job matches, and interview sessions can only be retrieved or deleted by the user who created them.
- **File Handling**: Uploaded files receive cryptographically unique filenames (`<user_id>_<uuid4>.<ext>`) and are stored in isolated per-user directories.
- **Payload Sanitization**: User inputs are stripped and sanitized using `bleach` to prevent stored Cross-Site Scripting (XSS).

---

## ❓ Troubleshooting & FAQ

**Q: Render dashboard displays "Worker Timeout"?**
A: Render free tier spins down idle instances. Increase `GUNICORN_TIMEOUT` to `120` (already pre-configured in `gunicorn.conf.py`) to prevent premature worker termination during cold starts.

**Q: Does CareerCraft require paid AI API keys to function?**
A: **No.** CareerCraft is 100% functional out-of-the-box using curated deterministic NLP taxonomies, rule-based ATS validators, and TF-IDF matching. Gemini API integration is strictly optional.

**Q: What credentials can I use to test the platform immediately?**
A: The database seeds a demo candidate profile on initial launch:
- **Email**: `demo@careercraft.io`
- **Password**: `Password123!`

---

## 📄 License
This project is open-source and released under the MIT License.
