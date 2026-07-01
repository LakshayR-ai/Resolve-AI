import os
import shutil
import logging
from typing import List
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document
from core.config import settings

logger = logging.getLogger(__name__)

_embeddings = None

def get_embeddings() -> HuggingFaceEmbeddings:
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)
    return _embeddings


def get_vector_store_path(company_id: int) -> str:
    path = os.path.join(settings.VECTOR_STORE_DIR, f"company_{company_id}")
    os.makedirs(path, exist_ok=True)
    return path


def get_vector_store(company_id: int) -> Chroma:
    return Chroma(
        persist_directory=get_vector_store_path(company_id),
        embedding_function=get_embeddings()
    )


def add_documents_to_store(company_id: int, chunks: List[Document], doc_id: int) -> int:
    """Add document chunks to the company's vector store."""
    for chunk in chunks:
        chunk.metadata["company_id"] = company_id
        chunk.metadata["doc_id"] = doc_id

    store = get_vector_store(company_id)
    store.add_documents(chunks)
    logger.info(f"Added {len(chunks)} chunks for company {company_id}, doc {doc_id}")
    return len(chunks)


def delete_document_from_store(company_id: int, doc_id: int):
    """Remove all chunks for a specific document from the vector store."""
    try:
        store = get_vector_store(company_id)
        collection = store._collection
        collection.delete(where={"doc_id": doc_id})
        logger.info(f"Deleted doc {doc_id} from company {company_id} vector store")
    except Exception as e:
        logger.error(f"Error deleting doc {doc_id}: {e}")


def search_similar(company_id: int, query: str, k: int = 4) -> List[Document]:
    """Search for relevant chunks in a company's vector store."""
    try:
        store = get_vector_store(company_id)
        results = store.similarity_search(query, k=k)
        return results
    except Exception as e:
        logger.error(f"Vector search error for company {company_id}: {e}")
        return []


def delete_company_store(company_id: int):
    """Delete the entire vector store for a company."""
    path = get_vector_store_path(company_id)
    if os.path.exists(path):
        shutil.rmtree(path)
        logger.info(f"Deleted vector store for company {company_id}")
