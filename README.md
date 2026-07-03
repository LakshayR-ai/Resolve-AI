# 🤖 Resolve AI — Multi-Tenant AI Customer Support Platform

> **The open-source Chatbase alternative.** Any company registers, uploads their documents, and gets a production-ready AI chatbot in minutes — powered by RAG + Gemini.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![LangChain](https://img.shields.io/badge/LangChain-0.3-1C3C3C)](https://langchain.com)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-0.5-FF6B35)](https://trychroma.com)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?logo=google)](https://ai.google.dev)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## ✨ Features

### 🏢 Multi-Tenant SaaS
- Any company registers and gets a **fully isolated workspace**
- Separate ChromaDB vector collection per company — zero data leakage
- JWT authentication with role-based access (Super Admin / Company Admin / Customer)
- Public chatbot URL: `resolveai.com/{company-slug}` — no login required for customers

### 📄 Knowledge Base Management
- Upload **PDF, DOCX, TXT, MD, CSV, XLSX** files (up to 50MB each)
- Automatic pipeline: detect → extract → clean → chunk → embed → store
- Per-document status tracking (processing / ready / failed)
- **Rebuild embeddings** on demand with one click
- Search and filter documents in the dashboard

### 🤖 AI Chat (RAG-Powered)
- Answers **only from uploaded company documents** — no hallucination
- Conversation memory across the session (last 6 exchanges)
- **Source citations** shown per response
- Sentiment analysis + issue classification on every message
- Typing indicator, suggested questions, quick replies
- 👍 / 👎 feedback per response

### 📊 Analytics Dashboard
- **12 stat cards**: Total Chats, Today, Monthly, Sessions, Documents, Avg Response, Positive%, Negative%, Helpful Rate, Knowledge Coverage, Top Questions, Failed Queries
- **4 time series charts**: Hourly Peak, Daily, Weekly, Monthly
- Issue category breakdown (bar chart)
- Sentiment distribution (donut chart)
- Customer satisfaction score
- Export to **CSV and JSON**

### 🎨 Professional Frontend
- React 19 + Vite + Tailwind CSS
- Full **dark mode** support
- **Responsive** — works on mobile, tablet, desktop
- Loading skeletons on all data fetches
- Toast notifications for all actions
- Drag-and-drop document upload

### 🔐 Security
- JWT tokens with configurable expiry
- bcrypt password hashing
- Role-based access control on every endpoint
- Rate limiting on public endpoints (slowapi)
- Input validation via Pydantic v2
- Environment variable configuration

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                       │
│  Login · Register · Dashboard · Chat · Docs · Analytics │
│  History · Settings · Admin · Public Widget             │
└────────────────────┬────────────────────────────────────┘
                     │ REST API (JWT)
┌────────────────────▼────────────────────────────────────┐
│                   FastAPI Backend                        │
│                                                          │
│  /api/v1/auth      → Register, Login, Profile           │
│  /api/v1/chat      → RAG Chat, Feedback, History        │
│  /api/v1/documents → Upload, Delete, Reindex            │
│  /api/v1/analytics → Stats, Export CSV/JSON             │
│  /api/v1/company   → Profile, Embed Code, Team          │
│  /api/v1/admin     → Platform Management                │
│  /api/v1/widget    → Public Chat (no auth)              │
└──────┬─────────────┬──────────────┬─────────────────────┘
       │             │              │
┌──────▼──────┐ ┌────▼────┐ ┌──────▼──────────────┐
│   SQLite    │ │ChromaDB │ │  Gemini 2.5 Flash   │
│  (SQLAlch.) │ │per-co.  │ │  + HuggingFace Emb. │
└─────────────┘ └─────────┘ └─────────────────────┘
```

---

## 📁 Folder Structure

```
Resolve-AI/
├── backend/
│   ├── app.py                    # FastAPI entry point + rate limiting
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── core/
│   │   ├── config.py             # All settings via env vars
│   │   ├── security.py           # JWT + bcrypt
│   │   └── dependencies.py       # Auth middleware
│   ├── database/
│   │   ├── database.py           # SQLAlchemy engine + session
│   │   └── models.py             # Company, User, Document, ChatSession, ChatMessage
│   ├── schemas/                  # Pydantic v2 request/response models
│   │   ├── auth.py
│   │   ├── chat.py
│   │   ├── document.py
│   │   └── analytics.py
│   ├── routes/
│   │   ├── auth.py               # Register, Login, PATCH /me
│   │   ├── chat.py               # RAG Chat, Feedback, History, Search
│   │   ├── documents.py          # Upload, Delete, Reindex
│   │   ├── analytics.py          # Stats, Export CSV/JSON
│   │   ├── company.py            # Profile, Embed Code, Team
│   │   ├── admin.py              # Platform stats, Company toggle
│   │   └── widget.py             # Public chat (no auth required)
│   ├── services/
│   │   ├── llm_service.py        # Gemini + Prompt engineering
│   │   ├── embedding_service.py  # ChromaDB per-company
│   │   ├── document_processor.py # Load → chunk pipeline
│   │   └── analytics_service.py  # SQL aggregations
│   ├── uploads/                  # company_{id}/ raw files
│   └── vector_stores/            # company_{id}/ ChromaDB
│
├── frontend/
│   ├── src/
│   │   ├── api/axios.js          # JWT interceptor + auto-logout
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Login, Register, Logout
│   │   │   └── ThemeContext.jsx  # Dark/Light mode
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       ├── Dashboard.jsx     # 12-card analytics overview
│   │       ├── Chat.jsx          # Internal chat with sources
│   │       ├── History.jsx       # Session browser + search
│   │       ├── Documents.jsx     # Upload, search, reindex
│   │       ├── Analytics.jsx     # Full charts + satisfaction
│   │       ├── Settings.jsx      # Profile + embed code
│   │       ├── Admin.jsx         # Super admin panel
│   │       └── PublicChat.jsx    # Customer-facing widget
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.js
│
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI/CD
├── docker-compose.yml
├── .env
└── sample_data/
    └── LR_Company_FAQ.txt
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- [Gemini API Key](https://aistudio.google.com/apikey)

### 1. Clone and configure

```bash
git clone https://github.com/LakshayR-ai/Resolve-AI.git
cd Resolve-AI
```

Edit `.env`:
```env
GEMINI_API_KEY=your_key_here
SECRET_KEY=change-this-in-production
```

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

API docs: **http://localhost:8000/docs**

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: **http://localhost:3000**

---

## 🐳 Docker Deployment

```bash
# Configure your keys
cp .env .env.production
# Edit .env.production

docker-compose up --build -d
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## ☁️ Cloud Deployment

### Backend → Render / Railway
1. Connect your GitHub repo
2. Set root directory to `backend/`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app:app --host 0.0.0.0 --port $PORT`
5. Add all `.env` variables in the dashboard

### Frontend → Vercel
1. Connect your GitHub repo
2. Set root directory to `frontend/`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add `VITE_API_URL` environment variable

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | None | Register company + admin |
| POST | `/api/v1/auth/login` | None | Login, returns JWT |
| GET | `/api/v1/auth/me` | JWT | Get current user |
| PATCH | `/api/v1/auth/me` | JWT | Update profile |
| POST | `/api/v1/chat/` | JWT | RAG chat message |
| POST | `/api/v1/chat/feedback` | JWT | Submit 👍/👎 |
| GET | `/api/v1/chat/history/sessions` | JWT | List sessions |
| GET | `/api/v1/chat/history/sessions/{id}` | JWT | Get messages |
| GET | `/api/v1/chat/history/search` | JWT | Search history |
| POST | `/api/v1/documents/upload` | JWT | Upload document |
| GET | `/api/v1/documents/` | JWT | List documents |
| DELETE | `/api/v1/documents/{id}` | JWT | Delete document |
| POST | `/api/v1/documents/{id}/reindex` | JWT | Rebuild embeddings |
| GET | `/api/v1/analytics/` | JWT | Full analytics |
| GET | `/api/v1/analytics/export/csv` | JWT | Export CSV |
| GET | `/api/v1/analytics/export/json` | JWT | Export JSON |
| GET | `/api/v1/company/profile` | JWT | Get company info |
| PATCH | `/api/v1/company/profile` | JWT | Update company |
| GET | `/api/v1/company/embed-config` | JWT | Get embed code |
| GET | `/api/v1/company/team` | JWT | List team members |
| GET | `/api/v1/widget/{slug}/info` | None | Public chatbot info |
| POST | `/api/v1/widget/{slug}/chat` | None | Public chat |
| POST | `/api/v1/widget/{slug}/feedback` | None | Rate response |
| GET | `/api/v1/admin/stats` | Admin | Platform stats |
| GET | `/api/v1/admin/companies` | Admin | All companies |
| PATCH | `/api/v1/admin/companies/{id}/toggle` | Admin | Enable/disable |

---

## 🔐 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | ✅ | — | Google Gemini API key |
| `SECRET_KEY` | ✅ | change-me | JWT signing secret |
| `DATABASE_URL` | — | sqlite:///./resolve_ai.db | Database URL |
| `GEMINI_MODEL` | — | gemini-2.5-flash | Gemini model |
| `EMBEDDING_MODEL` | — | all-MiniLM-L6-v2 | HuggingFace model |
| `MAX_FILE_SIZE_MB` | — | 50 | Max upload size |
| `ALLOWED_ORIGINS` | — | localhost:3000 | CORS origins |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | — | 1440 | JWT expiry |

---

## 🛣 Future Roadmap

- [ ] Streaming responses (Server-Sent Events)
- [ ] PostgreSQL support with Alembic migrations
- [ ] Email verification on registration
- [ ] Embeddable JavaScript widget (`<script>` tag)
- [ ] Multi-language support (auto-detect + translate)
- [ ] Escalate to human agent (live handoff)
- [ ] Subscription plans + usage limits
- [ ] Website crawler (scrape docs from URL)
- [ ] PowerPoint / HTML document support
- [ ] Confidence score per response
- [ ] Slack / Teams integration webhooks
- [ ] White-label branding per company
- [ ] API key system for external integrations

---

## 🧑‍💻 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, Recharts |
| Backend | FastAPI 0.115, Python 3.11, Pydantic v2 |
| AI / LLM | Google Gemini 2.5 Flash |
| RAG | LangChain 0.3, ChromaDB 0.5 |
| Embeddings | HuggingFace `all-MiniLM-L6-v2` |
| Auth | JWT (python-jose), bcrypt, slowapi |
| Database | SQLite / SQLAlchemy 2.0 ORM |
| Deployment | Docker, Docker Compose, Nginx |
| CI/CD | GitHub Actions |

---

*Built as a production-grade portfolio project demonstrating multi-tenant SaaS architecture with RAG-powered AI.*
