"""
Factory for creating vector stores
"""

from typing import Optional
import logging

from app.rag.base import BaseVectorStore, VectorStoreConfig, VectorStoreType
from app.rag.qdrant_store import QdrantVectorStore
from app.rag.vertex_store import VertexAIVectorStore
from app.rag.disabled_store import DisabledVectorStore
from app.core.config import get_settings

logger = logging.getLogger(__name__)


class VectorStoreFactory:
    """Factory for creating vector store instances"""
    
    _instances = {}
    
    @classmethod
    def create(
        cls,
        config: Optional[VectorStoreConfig] = None,
        store_type: Optional[VectorStoreType] = None
    ) -> BaseVectorStore:
        """
        Create a vector store instance
        
        Args:
            config: Vector store configuration. If not provided, uses settings
            store_type: Override store type from settings
        
        Returns:
            Vector store instance
        """
        settings = get_settings()
        
        # Check if Qdrant is disabled
        if settings.DISABLE_QDRANT:
            logger.warning("Qdrant is disabled. Using DisabledVectorStore.")
            return DisabledVectorStore(VectorStoreConfig(
                store_type=VectorStoreType.QDRANT,
                collection_name="disabled",
                embedding_dimension=768
            ))
        
        # Use provided config or create from settings
        if not config:
            # Determine store type
            if not store_type:
                store_type = VectorStoreType(
                    settings.VECTOR_STORE_TYPE or VectorStoreType.QDRANT
                )
            
            # Create config based on store type
            if store_type == VectorStoreType.QDRANT:
                config = VectorStoreConfig(
                    store_type=VectorStoreType.QDRANT,
                    collection_name=settings.VECTOR_COLLECTION_NAME or "kronos_documents",
                    embedding_dimension=settings.EMBEDDING_DIMENSION or 768,
                    qdrant_url=settings.QDRANT_URL or "http://localhost:6333",
                    qdrant_api_key=settings.QDRANT_API_KEY,
                    qdrant_use_grpc=settings.QDRANT_USE_GRPC or False
                )
            elif store_type == VectorStoreType.VERTEX_AI:
                config = VectorStoreConfig(
                    store_type=VectorStoreType.VERTEX_AI,
                    collection_name=settings.VECTOR_COLLECTION_NAME or "kronos_documents",
                    embedding_dimension=settings.EMBEDDING_DIMENSION or 768,
                    vertex_project_id=settings.GCP_PROJECT_ID,
                    vertex_region=settings.GCP_REGION or "us-central1",
                    vertex_index_id=settings.VERTEX_INDEX_ID,
                    vertex_index_endpoint_id=settings.VERTEX_INDEX_ENDPOINT_ID,
                    vertex_gcs_bucket=settings.VERTEX_GCS_BUCKET,
                    vertex_index_update_method=settings.VERTEX_INDEX_UPDATE_METHOD or "STREAM_UPDATE"
                )
            else:
                raise ValueError(f"Unsupported vector store type: {store_type}")
        
        # Create cache key
        cache_key = f"{config.store_type}:{config.collection_name}"
        
        # Check cache
        if cache_key in cls._instances:
            logger.info(f"Returning cached vector store: {cache_key}")
            return cls._instances[cache_key]
        
        # Create new instance
        logger.info(f"Creating new vector store: {config.store_type}")
        
        if config.store_type == VectorStoreType.QDRANT:
            instance = QdrantVectorStore(config)
        elif config.store_type == VectorStoreType.VERTEX_AI:
            instance = VertexAIVectorStore(config)
        else:
            raise ValueError(f"Unsupported vector store type: {config.store_type}")
        
        # Cache instance
        cls._instances[cache_key] = instance
        
        return instance
    
    @classmethod
    def get_default(cls) -> BaseVectorStore:
        """Get the default vector store based on settings"""
        return cls.create()
    
    @classmethod
    def clear_cache(cls):
        """Clear all cached instances"""
        cls._instances.clear()
        logger.info("Cleared vector store cache")