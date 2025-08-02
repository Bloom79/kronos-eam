"""
Base classes for vector stores
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class VectorStoreType(str, Enum):
    """Available vector store types"""
    QDRANT = "qdrant"
    VERTEX_AI = "vertex_ai"
    CHROMA = "chroma"  # For local development


@dataclass
class VectorStoreConfig:
    """Configuration for vector stores"""
    store_type: VectorStoreType
    collection_name: str
    embedding_dimension: int = 768
    
    # Qdrant specific
    qdrant_url: Optional[str] = None
    qdrant_api_key: Optional[str] = None
    qdrant_use_grpc: bool = False
    
    # Vertex AI specific
    vertex_project_id: Optional[str] = None
    vertex_region: Optional[str] = None
    vertex_index_id: Optional[str] = None
    vertex_index_endpoint_id: Optional[str] = None
    vertex_gcs_bucket: Optional[str] = None
    vertex_index_update_method: str = "STREAM_UPDATE"  # or "BATCH_UPDATE"
    
    # ChromaDB specific
    chroma_persist_dir: Optional[str] = None
    
    # Common settings
    distance_metric: str = "cosine"
    batch_size: int = 100
    
    def validate(self) -> bool:
        """Validate configuration based on store type"""
        if self.store_type == VectorStoreType.QDRANT:
            return bool(self.qdrant_url)
        elif self.store_type == VectorStoreType.VERTEX_AI:
            return all([
                self.vertex_project_id,
                self.vertex_region,
                self.vertex_gcs_bucket
            ])
        elif self.store_type == VectorStoreType.CHROMA:
            return True  # ChromaDB can work with default settings
        return False


@dataclass
class Document:
    """Document for vector storage"""
    id: str
    content: str
    metadata: Dict[str, Any]
    embedding: Optional[List[float]] = None


@dataclass
class SearchResult:
    """Search result from vector store"""
    id: str
    content: str
    metadata: Dict[str, Any]
    score: float


class BaseVectorStore(ABC):
    """Base class for all vector stores"""
    
    def __init__(self, config: VectorStoreConfig):
        self.config = config
        if not config.validate():
            raise ValueError(f"Invalid configuration for {config.store_type}")
        self.logger = logging.getLogger(f"{__name__}.{self.__class__.__name__}")
    
    @abstractmethod
    async def initialize(self, **kwargs) -> None:
        """Initialize the vector store (create collection/index if needed)"""
        pass
    
    @abstractmethod
    async def add_documents(
        self,
        documents: List[Document],
        tenant_id: str,
        **kwargs
    ) -> List[str]:
        """Add documents to the vector store"""
        pass
    
    @abstractmethod
    async def search(
        self,
        query_embedding: List[float],
        tenant_id: str,
        top_k: int = 10,
        filters: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> List[SearchResult]:
        """Search for similar documents"""
        pass
    
    @abstractmethod
    async def delete_documents(
        self,
        document_ids: List[str],
        tenant_id: str,
        **kwargs
    ) -> bool:
        """Delete documents by IDs"""
        pass
    
    @abstractmethod
    async def update_document(
        self,
        document: Document,
        tenant_id: str,
        **kwargs
    ) -> bool:
        """Update a document"""
        pass
    
    @abstractmethod
    async def get_document(
        self,
        document_id: str,
        tenant_id: str,
        **kwargs
    ) -> Optional[Document]:
        """Get a document by ID"""
        pass
    
    @abstractmethod
    async def count_documents(
        self,
        tenant_id: str,
        filters: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> int:
        """Count documents in the collection"""
        pass
    
    @abstractmethod
    async def health_check(self) -> bool:
        """Check if the vector store is healthy"""
        pass
    
    def _add_tenant_filter(self, filters: Optional[Dict[str, Any]], tenant_id: str) -> Dict[str, Any]:
        """Add tenant filter to ensure data isolation"""
        if filters is None:
            filters = {}
        filters["tenant_id"] = tenant_id
        return filters
    
    async def hybrid_search(
        self,
        query_embedding: List[float],
        query_text: str,
        tenant_id: str,
        top_k: int = 10,
        filters: Optional[Dict[str, Any]] = None,
        alpha: float = 0.5,
        **kwargs
    ) -> List[SearchResult]:
        """
        Hybrid search combining vector and text search
        Default implementation uses only vector search
        Override in subclasses for true hybrid search
        """
        return await self.search(query_embedding, tenant_id, top_k, filters, **kwargs)
    
    async def batch_search(
        self,
        query_embeddings: List[List[float]],
        tenant_id: str,
        top_k: int = 10,
        filters: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> List[List[SearchResult]]:
        """Batch search for multiple queries"""
        results = []
        for embedding in query_embeddings:
            result = await self.search(embedding, tenant_id, top_k, filters, **kwargs)
            results.append(result)
        return results