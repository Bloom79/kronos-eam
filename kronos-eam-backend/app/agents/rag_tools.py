"""
RAG-powered tools for LangGraph agents
"""

from typing import Dict, Any, Optional, List
from langchain_core.tools import tool
import logging

from app.rag.factory import VectorStoreFactory
from app.rag.embeddings import EmbeddingService

logger = logging.getLogger(__name__)

# Initialize services
vector_store = None
embedding_service = None


def get_vector_store():
    global vector_store
    if not vector_store:
        vector_store = VectorStoreFactory.get_default()
    return vector_store


def get_embedding_service():
    global embedding_service
    if not embedding_service:
        embedding_service = EmbeddingService()
    return embedding_service


@tool
async def semantic_document_search(query: str, tenant_id: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """Search for documents using semantic similarity"""
    try:
        # Get services
        store = get_vector_store()
        embedder = get_embedding_service()
        
        # Initialize store if needed
        await store.initialize()
        
        # Generate query embedding
        query_embedding = await embedder.embed_text(query)
        
        # Search in vector store
        results = await store.search(
            query_embedding=query_embedding,
            tenant_id=tenant_id,
            top_k=top_k
        )
        
        # Format results
        formatted_results = []
        for result in results:
            formatted_results.append({
                "id": result.id,
                "content": result.content[:500] + "..." if len(result.content) > 500 else result.content,
                "score": result.score,
                "metadata": result.metadata
            })
        
        return formatted_results
    except Exception as e:
        logger.error(f"Error in semantic search: {e}")
        return []


@tool
async def hybrid_document_search(
    query: str,
    tenant_id: str,
    impianto_id: Optional[int] = None,
    document_type: Optional[str] = None,
    top_k: int = 5
) -> List[Dict[str, Any]]:
    """Hybrid search combining semantic and keyword matching"""
    try:
        # Get services
        store = get_vector_store()
        embedder = get_embedding_service()
        
        # Initialize store if needed
        await store.initialize()
        
        # Generate query embedding
        query_embedding = await embedder.embed_text(query)
        
        # Build filters
        filters = {}
        if impianto_id:
            filters["impianto_id"] = impianto_id
        if document_type:
            filters["document_type"] = document_type
        
        # Perform hybrid search
        results = await store.hybrid_search(
            query_embedding=query_embedding,
            query_text=query,
            tenant_id=tenant_id,
            top_k=top_k,
            filters=filters,
            alpha=0.7  # Weight towards semantic search
        )
        
        # Format results
        formatted_results = []
        for result in results:
            formatted_results.append({
                "id": result.id,
                "content": result.content[:500] + "..." if len(result.content) > 500 else result.content,
                "score": result.score,
                "metadata": result.metadata,
                "document_name": result.metadata.get("document_name", "Unknown"),
                "document_type": result.metadata.get("document_type", "Unknown")
            })
        
        return formatted_results
    except Exception as e:
        logger.error(f"Error in hybrid search: {e}")
        return []


@tool
async def get_similar_cases(
    case_description: str,
    tenant_id: str,
    case_type: Optional[str] = None,
    top_k: int = 3
) -> List[Dict[str, Any]]:
    """Find similar cases or issues from history"""
    try:
        # Get services
        store = get_vector_store()
        embedder = get_embedding_service()
        
        # Initialize store if needed
        await store.initialize()
        
        # Generate embedding
        case_embedding = await embedder.embed_text(case_description)
        
        # Build filters for cases
        filters = {"content_type": "case"}
        if case_type:
            filters["case_type"] = case_type
        
        # Search for similar cases
        results = await store.search(
            query_embedding=case_embedding,
            tenant_id=tenant_id,
            top_k=top_k,
            filters=filters
        )
        
        # Format results with resolution information
        formatted_results = []
        for result in results:
            formatted_results.append({
                "case_id": result.id,
                "description": result.content[:300] + "..." if len(result.content) > 300 else result.content,
                "similarity_score": result.score,
                "resolution": result.metadata.get("resolution", "No resolution recorded"),
                "resolution_time": result.metadata.get("resolution_time", "Unknown"),
                "case_type": result.metadata.get("case_type", "General"),
                "date": result.metadata.get("created_at", "Unknown")
            })
        
        return formatted_results
    except Exception as e:
        logger.error(f"Error finding similar cases: {e}")
        return []


@tool
async def extract_document_insights(
    document_id: str,
    tenant_id: str,
    insight_type: str = "summary"
) -> Dict[str, Any]:
    """Extract insights from a specific document"""
    try:
        # Get document from vector store
        store = get_vector_store()
        await store.initialize()
        
        document = await store.get_document(document_id, tenant_id)
        
        if not document:
            return {"error": "Document not found"}
        
        # Extract insights based on type
        insights = {
            "document_id": document_id,
            "document_name": document.metadata.get("document_name", "Unknown"),
            "insight_type": insight_type
        }
        
        if insight_type == "summary":
            # Extract key points
            content = document.content
            insights["summary"] = content[:500] + "..." if len(content) > 500 else content
            insights["key_points"] = document.metadata.get("key_points", [])
            
        elif insight_type == "dates":
            # Extract important dates
            insights["dates"] = document.metadata.get("important_dates", {})
            insights["expiration"] = document.metadata.get("expiration_date")
            insights["next_action"] = document.metadata.get("next_action_date")
            
        elif insight_type == "obligations":
            # Extract obligations and requirements
            insights["obligations"] = document.metadata.get("obligations", [])
            insights["requirements"] = document.metadata.get("requirements", [])
            insights["penalties"] = document.metadata.get("penalties", [])
            
        elif insight_type == "technical":
            # Extract technical specifications
            insights["technical_specs"] = document.metadata.get("technical_specs", {})
            insights["parameters"] = document.metadata.get("parameters", {})
            insights["limits"] = document.metadata.get("limits", {})
        
        return insights
    except Exception as e:
        logger.error(f"Error extracting document insights: {e}")
        return {"error": str(e)}


@tool
async def index_document(
    document_content: str,
    document_name: str,
    tenant_id: str,
    impianto_id: Optional[int] = None,
    document_type: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Index a new document in the vector store"""
    try:
        from app.rag.chunking import DocumentChunker
        from app.rag.base import Document as VectorDocument
        import uuid
        
        # Get services
        store = get_vector_store()
        embedder = get_embedding_service()
        chunker = DocumentChunker()
        
        # Initialize store if needed
        await store.initialize()
        
        # Chunk the document
        chunks = chunker.chunk_document(
            text=document_content,
            document_type=document_type or "generic",
            metadata={
                "document_name": document_name,
                "impianto_id": impianto_id,
                **(metadata or {})
            }
        )
        
        # Create vector documents
        vector_docs = []
        for chunk in chunks:
            # Generate embedding
            embedding = await embedder.embed_text(chunk.content)
            
            # Create document
            doc = VectorDocument(
                id=str(uuid.uuid4()),
                content=chunk.content,
                metadata={
                    **chunk.metadata,
                    "chunk_index": chunk.chunk_index,
                    "document_name": document_name,
                    "document_type": document_type,
                    "impianto_id": impianto_id
                },
                embedding=embedding
            )
            vector_docs.append(doc)
        
        # Add to vector store
        doc_ids = await store.add_documents(vector_docs, tenant_id)
        
        return {
            "success": True,
            "document_name": document_name,
            "chunks_created": len(doc_ids),
            "document_ids": doc_ids
        }
    except Exception as e:
        logger.error(f"Error indexing document: {e}")
        return {"error": str(e)}