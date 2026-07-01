# 🤖 Resolve AI — Multi-Tenant AI Customer Support Platform

> **"Chatbase meets Intercom, powered by RAG."**  
> Upload your company documents. Let AI answer your customers. Instantly.

## ✨ Features

- Multi-tenant SaaS — every company gets their own isolated workspace
- JWT authentication (register, login, roles)
- Upload PDF / DOCX / TXT / MD documents
- Automatic chunking → embeddings → per-company ChromaDB vector store
- RAG-powered chat using Gemini 2.5 Flash — answers only from your documents
- Conversation memory, sentiment analysis, issue classification
- 👍/👎 feedback per response
- Full analytics: daily/weekly/monthly charts, categories, sentiment, top questions
- Export to CSV and JSON
- Admin panel for platform management
- React frontend with dark mode, typing indicator, drag-and-drop uploads
- Docker support for one-command deployment

## 🚀 Quick Start

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# Add GEMINI_API_KEY to .env
uvicorn app:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 — register your company and start uploading documents!

## 🐳 Docker
```bash
docker-compose up --build -d
```

## 📡 Key API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/auth/register` | Register + create company |
| `POST /api/v1/auth/login` | Login, get JWT |
| `POST /api/v1/chat/` | RAG chat |
| `POST /api/v1/documents/upload` | Upload document |
| `GET /api/v1/analytics/` | Full analytics |
| `GET /api/v1/analytics/export/csv` | Export CSV |

Full docs at http://localhost:8000/docs

## 🏗 Architecture
```
React Frontend → FastAPI → Gemini 2.5 Flash
                        → ChromaDB (per-company)
                        → SQLite (sessions, messages, docs)
```

## Tech Stack
- FastAPI + Python 3.11
- Google Gemini 2.5 Flash
- LangChain + ChromaDB + HuggingFace Embeddings
- React 18 + Vite + Tailwind CSS + Recharts
- JWT Auth, SQLAlchemy, Docker
