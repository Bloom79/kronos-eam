"""
Disabled vector store implementation for when Qdrant is not available
"""

from typing import List, Dict, Any, Optional, Tuple
import logging

from app.rag.base import BaseVectorStore, VectorStoreConfig, SearchResult

logger = logging.getLogger(__name__)


class DisabledVectorStore(BaseVectorStore):
    """
    Vector store implementation that returns empty results when vector DB is disabled
    """
    
    def __init__(self, config: VectorStoreConfig):
        super().__init__(config)
        logger.warning("Vector store is disabled. All vector operations will return empty results.")
    
    async def initialize(self) -> None:
        """Initialize (no-op)"""
        logger.info("Disabled vector store initialized")
    
    async def add_documents(
        self,
        documents: List[Dict[str, Any]],
        metadata: Optional[List[Dict[str, Any]]] = None,
        ids: Optional[List[str]] = None
    ) -> List[str]:
        """Add documents (no-op)"""
        logger.debug(f"Skipping add of {len(documents)} documents (vector store disabled)")
        return ids or [f"disabled_{i}" for i in range(len(documents))]
    
    async def search(
        self,
        query_vector: List[float],
        limit: int = 10,
        filter_dict: Optional[Dict[str, Any]] = None,
        score_threshold: Optional[float] = None
    ) -> List[SearchResult]:
        """Search (returns empty results)"""
        logger.debug("Returning empty search results (vector store disabled)")
        return []
    
    async def hybrid_search(
        self,
        query_text: str,
        query_vector: List[float],
        limit: int = 10,
        filter_dict: Optional[Dict[str, Any]] = None,
        alpha: float = 0.5
    ) -> List[SearchResult]:
        """Hybrid search (returns empty results)"""
        logger.debug("Returning empty hybrid search results (vector store disabled)")
        return []
    
    async def delete(
        self,
        ids: Optional[List[str]] = None,
        filter_dict: Optional[Dict[str, Any]] = None
    ) -> int:
        """Delete documents (no-op)"""
        logger.debug("Skipping delete operation (vector store disabled)")
        return 0
    
    async def update_metadata(
        self,
        id: str,
        metadata: Dict[str, Any]
    ) -> bool:
        """Update metadata (no-op)"""
        logger.debug(f"Skipping metadata update for {id} (vector store disabled)")
        return True
    
    async def get_by_ids(
        self,
        ids: List[str]
    ) -> List[Tuple[str, Dict[str, Any], Dict[str, Any]]]:
        """Get documents by IDs (returns empty)"""
        logger.debug(f"Returning empty results for {len(ids)} IDs (vector store disabled)")
        return []
    
    async def count(
        self,
        filter_dict: Optional[Dict[str, Any]] = None
    ) -> int:
        """Count documents (returns 0)"""
        return 0
    
    async def health_check(self) -> Dict[str, Any]:
        """Health check"""
        return {
            "status": "disabled",
            "message": "Vector store is disabled",
            "available": False
        }