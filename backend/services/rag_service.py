from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import CharacterTextSplitter

from langchain_community.vectorstores import Chroma

from langchain_community.embeddings import HuggingFaceEmbeddings



def create_vector_database():


    loader = TextLoader(
        "documents/company_policy.txt"
    )


    documents = loader.load()


    splitter = CharacterTextSplitter(
        chunk_size=200,
        chunk_overlap=20
    )


    chunks = splitter.split_documents(
        documents
    )


    embeddings = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2"
    )


    vector_db = Chroma.from_documents(

        chunks,

        embeddings,

        persist_directory="vector_store"
    )


    return vector_db