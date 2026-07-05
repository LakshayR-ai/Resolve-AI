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


def load_document(file_path: str, file_type: str) -> List[Document]:
    """Load a document based on its type."""
    file_type = file_type.lower().lstrip(".")

    try:
        if file_type == "pdf":
            loader = PyPDFLoader(file_path)
            documents = loader.load()

            # Filter out empty pages
            documents = [d for d in documents if d.page_content.strip()]

            # If PyPDFLoader gave empty pages (scanned PDF), try raw text extraction
            if not documents:
                logger.warning(f"PyPDFLoader returned no text for {file_path}, trying raw extraction")
                try:
                    import pypdf
                    reader = pypdf.PdfReader(file_path)
                    all_text = []
                    for i, page in enumerate(reader.pages):
                        text = page.extract_text() or ""
                        if text.strip():
                            all_text.append(Document(
                                page_content=text.strip(),
                                metadata={"source": file_path, "page": i}
                            ))
                    if all_text:
                        documents = all_text
                        logger.info(f"Raw extraction recovered {len(documents)} pages")
                    else:
                        raise ValueError(
                            "This PDF appears to be image-based (scanned) and contains no "
                            "extractable text. Please use a text-based PDF or convert it first."
                        )
                except ImportError:
                    raise ValueError("Could not extract text from PDF. The file may be scanned or corrupted.")

        elif file_type in ["docx", "doc"]:
            loader = Docx2txtLoader(file_path)
            documents = loader.load()
            documents = [d for d in documents if d.page_content.strip()]

        elif file_type == "csv":
            loader = CSVLoader(file_path, encoding="utf-8")
            documents = loader.load()

        elif file_type in ["xlsx", "xls"]:
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

        elif file_type in ["txt", "md"]:
            loader = TextLoader(file_path, encoding="utf-8")
            documents = loader.load()
            documents = [d for d in documents if d.page_content.strip()]

        else:
            loader = TextLoader(file_path, encoding="utf-8")
            documents = loader.load()
            documents = [d for d in documents if d.page_content.strip()]

        if not documents:
            raise ValueError("Document loaded but contains no readable text. Check the file content.")

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

    # Fallback: if splitter produced nothing, use original pages as chunks
    if not chunks:
        logger.warning("Splitter produced 0 chunks — using raw pages as chunks")
        chunks = []
        for doc in documents:
            text = doc.page_content.strip()
            if text:
                # Still split into manageable pieces manually
                for i in range(0, len(text), chunk_size):
                    chunk_text = text[i:i + chunk_size].strip()
                    if chunk_text:
                        chunks.append(Document(
                            page_content=chunk_text,
                            metadata=doc.metadata
                        ))

    # Final safety check
    chunks = [c for c in chunks if c.page_content.strip()]

    if not chunks:
        raise ValueError(
            "Could not extract any text chunks from the document. "
            "The file may be empty, corrupted, or contain only images."
        )

    logger.info(f"Created {len(chunks)} chunks from {len(documents)} pages")
    return chunks


def process_document(file_path: str, file_type: str) -> Tuple[List[Document], int]:
    """Full pipeline: load → chunk → validate → return chunks."""
    documents = load_document(file_path, file_type)
    chunks = chunk_documents(documents)

    if not chunks:
        raise ValueError("No text could be extracted from this document.")

    return chunks, len(chunks)
