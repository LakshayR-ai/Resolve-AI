import os
import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from database.database import get_db
from database import models
from schemas.document import DocumentResponse, DocumentListResponse
from core.dependencies import get_current_user
from core.config import settings
from services.document_processor import process_document
from services.embedding_service import add_documents_to_store, delete_document_from_store

router = APIRouter(prefix="/documents", tags=["Documents"])
logger = logging.getLogger(__name__)


def get_upload_dir(company_id: int) -> str:
    path = os.path.join(settings.UPLOAD_DIR, f"company_{company_id}")
    os.makedirs(path, exist_ok=True)
    return path


def process_and_embed(file_path: str, file_type: str, doc_id: int, company_id: int, db_url: str):
    """Background task to process a document and create embeddings."""
    from database.database import SessionLocal
    db = SessionLocal()
    try:
        chunks, chunk_count = process_document(file_path, file_type)
        add_documents_to_store(company_id, chunks, doc_id)
        doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
        if doc:
            doc.status = "ready"
            doc.chunk_count = chunk_count
            db.commit()
        logger.info(f"Document {doc_id} processed: {chunk_count} chunks")
    except Exception as e:
        logger.error(f"Failed to process document {doc_id}: {e}")
        doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
        if doc:
            doc.status = "failed"
            db.commit()
    finally:
        db.close()


@router.post("/upload", response_model=DocumentResponse, status_code=201)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not current_user.company_id:
        raise HTTPException(status_code=400, detail="User has no associated company")

    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type .{ext} not allowed. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > settings.MAX_FILE_SIZE_MB:
        raise HTTPException(status_code=400, detail=f"File too large. Max {settings.MAX_FILE_SIZE_MB}MB")

    safe_name = f"{uuid.uuid4().hex}.{ext}"
    upload_dir = get_upload_dir(current_user.company_id)
    file_path = os.path.join(upload_dir, safe_name)

    with open(file_path, "wb") as f:
        f.write(contents)

    doc = models.Document(
        company_id=current_user.company_id,
        filename=safe_name,
        original_name=file.filename,
        file_type=ext,
        file_size=len(contents),
        status="processing",
        uploaded_by=current_user.id,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    background_tasks.add_task(
        process_and_embed,
        file_path, ext, doc.id, current_user.company_id, settings.DATABASE_URL
    )

    return doc


@router.get("/", response_model=DocumentListResponse)
def list_documents(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    docs = db.query(models.Document).filter(
        models.Document.company_id == current_user.company_id
    ).order_by(models.Document.created_at.desc()).all()
    return DocumentListResponse(total=len(docs), documents=docs)


@router.delete("/{doc_id}", status_code=204)
def delete_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    doc = db.query(models.Document).filter(
        models.Document.id == doc_id,
        models.Document.company_id == current_user.company_id,
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Remove from vector store
    delete_document_from_store(current_user.company_id, doc_id)

    # Remove physical file
    upload_dir = get_upload_dir(current_user.company_id)
    file_path = os.path.join(upload_dir, doc.filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    db.delete(doc)
    db.commit()
    return None


@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    doc = db.query(models.Document).filter(
        models.Document.id == doc_id,
        models.Document.company_id == current_user.company_id,
    ).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc
