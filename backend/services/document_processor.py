"""
document_processor.py
=====================
Handles PDF text extraction with automatic OCR fallback.

Extraction strategy
-------------------
1. Try pdfplumber  (fast, works on digital/text-based PDFs)
2. If extracted text < MIN_TEXT_CHARS → OCR via pytesseract
   (handles scanned PDFs, image-only PDFs, screenshots-as-PDF)
3. Return plain text in exactly the same format as before,
   so the rest of the pipeline (chunking → embeddings → ChromaDB)
   requires ZERO changes.

Windows installation notes
--------------------------
Tesseract OCR (required for pytesseract):
  Download installer from:
  https://github.com/UB-Mannheim/tesseract/wiki
  Default install path: C:\\Program Files\\Tesseract-OCR\\tesseract.exe
  After install, add that folder to your PATH, OR set the path
  explicitly in TESSERACT_CMD below.

Poppler (required for pdf2image):
  Download from: https://github.com/oschwartz10612/poppler-windows/releases
  Extract to e.g. C:\\poppler\\Library\\bin
  Add that bin/ folder to your PATH, OR pass poppler_path= to
  convert_from_path() (see _ocr_pdf() below).
"""

import os
import time
import logging
from typing import List, Tuple

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    Docx2txtLoader,
    CSVLoader,
)

logger = logging.getLogger(__name__)

# ─── Configuration ─────────────────────────────────────────────────────────
# Minimum characters extracted by pdfplumber before we fall back to OCR.
MIN_TEXT_CHARS: int = int(os.getenv("OCR_MIN_CHARS", "50"))

# Path to the Tesseract executable.
# Leave empty to rely on PATH; set explicitly if Tesseract is not on PATH.
TESSERACT_CMD: str = os.getenv(
    "TESSERACT_CMD",
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
)

# Path to Poppler's bin/ folder (Windows only).
# Leave empty to rely on PATH.
POPPLER_PATH: str = os.getenv("POPPLER_PATH", "")


# ─── Internal helpers ───────────────────────────────────────────────────────

def _configure_tesseract() -> None:
    """Point pytesseract at the Tesseract executable if the path exists."""
    try:
        import pytesseract
        if TESSERACT_CMD and os.path.isfile(TESSERACT_CMD):
            pytesseract.pytesseract.tesseract_cmd = TESSERACT_CMD
    except ImportError:
        pass  # handled later with a clear error message


def _extract_with_pdfplumber(pdf_path: str) -> str:
    """
    Extract text from a PDF using pdfplumber.
    Returns concatenated text from all pages.
    """
    import pdfplumber
    pages_text: List[str] = []
    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            try:
                text = page.extract_text() or ""
                pages_text.append(text)
                logger.debug("pdfplumber page %d: %d chars", page_num, len(text))
            except Exception as exc:
                logger.warning("pdfplumber failed on page %d: %s", page_num, exc)
    return "\n".join(pages_text)


def _ocr_pdf(pdf_path: str) -> str:
    """
    Convert PDF pages to images and run Tesseract OCR on each.
    Returns concatenated OCR text from all pages.
    """
    try:
        import pytesseract
        from pdf2image import convert_from_path
        from PIL import Image
    except ImportError as exc:
        raise RuntimeError(
            f"OCR dependencies not installed: {exc}. "
            "Run: pip install pytesseract pdf2image Pillow"
        ) from exc

    _configure_tesseract()

    convert_kwargs: dict = {"pdf_path": pdf_path}
    if POPPLER_PATH:
        convert_kwargs["poppler_path"] = POPPLER_PATH

    logger.info("OCR: converting PDF to images -> %s", pdf_path)
    try:
        images = convert_from_path(**convert_kwargs)
    except Exception as exc:
        raise RuntimeError(
            f"pdf2image failed to convert '{pdf_path}': {exc}. "
            "Ensure Poppler is installed and on PATH (Windows: set POPPLER_PATH env var)."
        ) from exc

    pages_text: List[str] = []
    for page_num, image in enumerate(images, start=1):
        try:
            text = pytesseract.image_to_string(image, lang="eng")
            pages_text.append(text)
            logger.debug("OCR page %d: %d chars extracted", page_num, len(text))
        except Exception as exc:
            logger.warning("OCR failed on page %d: %s", page_num, exc)

    logger.info("OCR complete: %d pages processed", len(images))
    return "\n".join(pages_text)


def extract_text(pdf_path: str) -> str:
    """
    Public entry point: extract plain text from a PDF file.

    Strategy:
      1. pdfplumber  (fast, no external deps)
      2. If text < MIN_TEXT_CHARS  →  OCR fallback (pytesseract + pdf2image)

    Returns
    -------
    str
        Plain text suitable for downstream chunking → embedding → RAG.

    Raises
    ------
    ValueError
        If no text could be extracted at all.
    RuntimeError
        If OCR dependencies are missing or Poppler/Tesseract are not installed.
    FileNotFoundError
        If the PDF path does not exist.
    """
    if not os.path.isfile(pdf_path):
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    start = time.monotonic()

    # ── Step 1: pdfplumber ──────────────────────────────────────────────────
    try:
        text = _extract_with_pdfplumber(pdf_path)
        char_count = len(text.strip())
        logger.info(
            "pdfplumber extracted %d chars from '%s'",
            char_count, os.path.basename(pdf_path),
        )
    except Exception as exc:
        logger.warning("pdfplumber error on '%s': %s - falling back to OCR", pdf_path, exc)
        text = ""
        char_count = 0

    # ── Step 2: OCR fallback ────────────────────────────────────────────────
    if char_count < MIN_TEXT_CHARS:
        logger.info(
            "Text too short (%d < %d chars) - triggering OCR for '%s'",
            char_count, MIN_TEXT_CHARS, os.path.basename(pdf_path),
        )
        text = _ocr_pdf(pdf_path)
        char_count = len(text.strip())
        logger.info(
            "OCR produced %d chars from '%s'",
            char_count, os.path.basename(pdf_path),
        )

    elapsed = time.monotonic() - start
    logger.info(
        "Text extraction complete: %d chars in %.2fs for '%s'",
        char_count, elapsed, os.path.basename(pdf_path),
    )

    if char_count == 0:
        raise ValueError(
            f"No text could be extracted from '{pdf_path}'. "
            "The file may be corrupted, password-protected, or an image-only PDF "
            "with OCR unavailable. See installation instructions in document_processor.py."
        )

    return text


# ─── Document loading (unchanged interface) ────────────────────────────────

def load_document(file_path: str, file_type: str) -> List[Document]:
    """
    Load a document based on its type.

    For PDFs this now calls extract_text() which includes
    the pdfplumber → OCR fallback automatically.
    All other formats are unchanged.
    """
    file_type = file_type.lower().lstrip(".")

    try:
        if file_type == "pdf":
            # Use our new extractor (pdfplumber + OCR fallback)
            raw_text = extract_text(file_path)
            # Wrap in the same Document format PyPDFLoader would return
            documents = [Document(
                page_content=raw_text,
                metadata={"source": file_path, "file_type": "pdf"}
            )]

        elif file_type in ("docx", "doc"):
            loader = Docx2txtLoader(file_path)
            documents = [d for d in loader.load() if d.page_content.strip()]

        elif file_type == "csv":
            loader = CSVLoader(file_path, encoding="utf-8")
            documents = loader.load()

        elif file_type in ("xlsx", "xls"):
            import openpyxl
            wb = openpyxl.load_workbook(file_path, read_only=True, data_only=True)
            docs = []
            for sheet in wb.sheetnames:
                ws = wb[sheet]
                rows = []
                for row in ws.iter_rows(values_only=True):
                    row_text = " | ".join(str(c) for c in row if c is not None)
                    if row_text.strip():
                        rows.append(row_text)
                if rows:
                    docs.append(Document(
                        page_content="\n".join(rows),
                        metadata={"source": file_path, "sheet": sheet}
                    ))
            documents = docs

        elif file_type in ("txt", "md"):
            loader = TextLoader(file_path, encoding="utf-8")
            documents = [d for d in loader.load() if d.page_content.strip()]

        else:
            loader = TextLoader(file_path, encoding="utf-8")
            documents = [d for d in loader.load() if d.page_content.strip()]

        # Final guard: ensure we have at least one document with content
        documents = [d for d in documents if d.page_content.strip()]
        if not documents:
            raise ValueError(
                f"Document loaded but contains no readable text: '{file_path}'"
            )

        logger.info(
            "Loaded %d section(s) from '%s'",
            len(documents), os.path.basename(file_path),
        )
        return documents

    except (ValueError, RuntimeError, FileNotFoundError):
        raise  # re-raise domain errors as-is
    except Exception as exc:
        logger.error("Unexpected error loading '%s': %s", file_path, exc)
        raise


def chunk_documents(
    documents: List[Document],
    chunk_size: int = 800,
    chunk_overlap: int = 100,
) -> List[Document]:
    """
    Split documents into chunks for embedding.
    Unchanged from the original implementation except for stronger fallback.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", "! ", "? ", "; ", ", ", " ", ""],
        length_function=len,
    )
    chunks = splitter.split_documents(documents)

    # Fallback: if the splitter returned nothing, slice manually
    if not chunks:
        logger.warning(
            "Splitter produced 0 chunks – using manual chunking fallback"
        )
        chunks = []
        for doc in documents:
            text = doc.page_content.strip()
            for i in range(0, max(len(text), 1), chunk_size):
                piece = text[i : i + chunk_size].strip()
                if piece:
                    chunks.append(Document(
                        page_content=piece,
                        metadata=doc.metadata,
                    ))

    # Remove any empty chunks
    chunks = [c for c in chunks if c.page_content.strip()]

    if not chunks:
        raise ValueError(
            "Could not produce any text chunks. "
            "The document may be empty or contain only unsupported content."
        )

    logger.info("Created %d chunks from %d document section(s)", len(chunks), len(documents))
    return chunks


def process_document(file_path: str, file_type: str) -> Tuple[List[Document], int]:
    """
    Full pipeline: load → chunk → return (chunks, count).
    Called by routes/documents.py – interface unchanged.
    """
    documents = load_document(file_path, file_type)
    chunks = chunk_documents(documents)
    return chunks, len(chunks)
