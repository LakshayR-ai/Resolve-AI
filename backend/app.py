import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager

from core.config import settings
from database.database import engine
from database.models import Base

# Import routes
from routes.auth import router as auth_router
from routes.chat import router as chat_router
from routes.documents import router as documents_router
from routes.analytics import router as analytics_router
from routes.admin import router as admin_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("logs/app.log") if os.path.exists("logs") or not os.makedirs("logs", exist_ok=True) else logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.VERSION}")
    Base.metadata.create_all(bind=engine)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.VECTOR_STORE_DIR, exist_ok=True)
    os.makedirs("logs", exist_ok=True)
    logger.info("Database tables created")
    yield
    # Shutdown
    logger.info("Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    description="Multi-tenant AI Customer Support SaaS Platform",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(documents_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "application": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "healthy", "service": settings.APP_NAME, "version": settings.VERSION}
