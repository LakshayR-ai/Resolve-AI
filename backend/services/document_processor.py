import os
import logging
from typing import List, Tuple
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    Docx2txtLoader,
    UnstructuredMarkdownLoader,
)

logger = logging.getLogger(__name__)


def load_document(file_path: str, file_type: str) -> List[Document]:
    """Load a document based on its type."""
    file_type = file_type.lower().lstrip(".")

    try:
        if file_type == "pdf":
            loader = PyPDFLoader(file_path)
        elif file_type in ["docx", "doc"]:
            loader = Docx2txtLoader(file_path)
        elif file_type in ["txt"]:
            loader = TextLoader(file_path, encoding="utf-8")
        elif file_type == "md":
            loader = UnstructuredMarkdownLoader(file_path)
        else:
            loader = TextLoader(file_path, encoding="utf-8")

        documents = loader.load()
        logger.info(f"Loaded {len(documents)} pages from {file_path}")
        return documents

    except Exception as e:
        logger.error(f"Error loading document {file_path}: {e}")
        raise


def chunk_documents(documents: List[Document], chunk_size: int = 500, chunk_overlap: int = 50) -> List[Document]:
    """Split documents into chunks."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ". ", " ", ""],
        length_function=len,
    )
    chunks = splitter.split_documents(documents)
    logger.info(f"Created {len(chunks)} chunks from {len(documents)} pages")
    return chunks


def process_document(file_path: str, file_type: str) -> Tuple[List[Document], int]:
    """Full pipeline: load → chunk → return chunks."""
    documents = load_document(file_path, file_type)
    chunks = chunk_documents(documents)
    return chunks, len(chunks)
