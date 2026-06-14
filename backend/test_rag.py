from services.rag_service import create_vector_database


db = create_vector_database()


print(
    "Vector database created successfully"
)