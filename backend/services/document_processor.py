import os
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


def _extract_pdf(file_path: str) -> List[Document]:
    """
    Try multiple PDF extraction methods in order of reliability.
    Returns a list of Documents with non-empty page_content.
    """
    docs = []

    # --- Method 1: PyPDFLoader (fastest, works on text PDFs) ---
    try:
        loader = PyPDFLoader(file_path)
        raw = loader.load()
        docs = [d for d in raw if d.page_content.strip()]
        if docs:
            logger.info(f"PyPDFLoader extracted {len(docs)} pages")
            return docs
    except Exception as e:
        logger.warning(f"PyPDFLoader failed: {e}")

    # --- Method 2: pdfplumber (better for complex layouts & rendered pages) ---
    try:
        import pdfplumber
        plumber_docs = []
        with pdfplumber.open(file_path) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text() or ""
                text = text.strip()
                if text:
                    plumber_docs.append(Document(
                        page_content=text,
                        metadata={"source": file_path, "page": i}
                    ))
        if plumber_docs:
            logger.info(f"pdfplumber extracted {len(plumber_docs)} pages")
            return plumber_docs
    except Exception as e:
        logger.warning(f"pdfplumber failed: {e}")

    # --- Method 3: pypdf direct (raw byte extraction) ---
    try:
        import pypdf
        reader = pypdf.PdfReader(file_path)
        pypdf_docs = []
        for i, page in enumerate(reader.pages):
            text = (page.extract_text() or "").strip()
            if text:
                pypdf_docs.append(Document(
                    page_content=text,
                    metadata={"source": file_path, "page": i}
                ))
        if pypdf_docs:
            logger.info(f"pypdf extracted {len(pypdf_docs)} pages")
            return pypdf_docs
    except Exception as e:
        logger.warning(f"pypdf failed: {e}")

    # --- All methods failed ---
    raise ValueError(
        "This PDF contains no extractable text. It appears to be a scanned/image-based PDF. "
        "Please convert it to a text-based PDF, or copy the content into a .txt file and upload that instead."
    )


def load_document(file_path: str, file_type: str) -> List[Document]:
    """Load a document based on its type."""
    file_type = file_type.lower().lstrip(".")

    try:
        if file_type == "pdf":
            documents = _extract_pdf(file_path)

        elif file_type in ["docx", "doc"]:
            loader = Docx2txtLoader(file_path)
            documents = [d for d in loader.load() if d.page_content.strip()]

        elif file_type == "csv":
            loader = CSVLoader(file_path, encoding="utf-8")
            documents = loader.load()

        elif file_type in ["xlsx", "xls"]:
            import openpyxl
            wb = openpyxl.load_workbook(file_path, read_only=True, data_only=True)
            documents = []
            for sheet in wb.sheetnames:
                ws = wb[sheet]
                rows = []
                for row in ws.iter_rows(values_only=True):
                    row_text = " | ".join(str(c) for c in row if c is not None)
                    if row_text.strip():
                        rows.append(row_text)
                if rows:
                    documents.append(Document(
                        page_content="\n".join(rows),
                        metadata={"source": file_path, "sheet": sheet}
                    ))

        elif file_type in ["txt", "md"]:
            loader = TextLoader(file_path, encoding="utf-8")
            documents = [d for d in loader.load() if d.page_content.strip()]

        else:
            loader = TextLoader(file_path, encoding="utf-8")
            documents = [d for d in loader.load() if d.page_content.strip()]

        if not documents:
            raise ValueError(
                "Document loaded but contains no readable text. "
                "Check the file content and format."
            )

        logger.info(f"Loaded {len(documents)} pages/sections from {file_path}")
        return documents

    except Exception as e:
        logger.error(f"Error loading document {file_path}: {e}")
        raise


def chunk_documents(documents: List[Document], chunk_size: int = 800, chunk_overlap: int = 100) -> List[Document]:
    """Split documents into chunks with smart fallback."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", "! ", "? ", "; ", ", ", " ", ""],
        length_function=len,
    )
    chunks = splitter.split_documents(documents)

    # Fallback: if splitter somehow produced 0 chunks, manually slice
    if not chunks:
        logger.warning("Splitter produced 0 chunks — using manual chunking")
        chunks = []
        for doc in documents:
            text = doc.page_content.strip()
            for i in range(0, max(len(text), 1), chunk_size):
                chunk_text = text[i:i + chunk_size].strip()
                if chunk_text:
                    chunks.append(Document(
                        page_content=chunk_text,
                        metadata=doc.metadata
                    ))

    # Final filter
    chunks = [c for c in chunks if c.page_content.strip()]

    if not chunks:
        raise ValueError(
            "Could not extract any text chunks from the document. "
            "The file may be empty, corrupted, or contain only images."
        )

    logger.info(f"Created {len(chunks)} chunks from {len(documents)} pages")
    return chunks


def process_document(file_path: str, file_type: str) -> Tuple[List[Document], int]:
    """Full pipeline: load → chunk → return chunks."""
    documents = load_document(file_path, file_type)
    chunks = chunk_documents(documents)
    return chunks, len(chunks)
