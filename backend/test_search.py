from services.rag_service import get_relevant_context


answer = get_relevant_context(
    "When can I get refund?"
)


print(answer)