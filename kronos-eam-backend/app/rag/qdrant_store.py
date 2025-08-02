"""
Qdrant vector store implementation
"""

from typing import Dict, Any, List, Optional
import logging
from datetime import datetime
import uuid

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance, VectorParams, PointStruct, 
    Filter, FieldCondition, MatchValue,
    SearchRequest, SearchParams,
    UpdateStatus
)

from app.rag.base import BaseVectorStore, Document, SearchResult, VectorStoreConfig

logger = logging.getLogger(__name__)


class QdrantVectorStore(BaseVectorStore):
    """Qdrant vector store implementation"""
    
    def __init__(self, config: VectorStoreConfig):
        super().__init__(config)
        self.client = None
        self._distance_map = {
            "cosine": Distance.COSINE,
            "euclidean": Distance.EUCLID,
            "dot": Distance.DOT
        }
    
    async def initialize(self, **kwargs) -> None:
        """Initialize Qdrant client and create collection if needed"""
        try:
            # Initialize client
            if self.config.qdrant_use_grpc:
                self.client = QdrantClient(
                    url=self.config.qdrant_url,
                    api_key=self.config.qdrant_api_key,
                    grpc_port=6334,
                    prefer_grpc=True
                )
            else:
                self.client = QdrantClient(
                    url=self.config.qdrant_url,
                    api_key=self.config.qdrant_api_key
                )
            
            # Check if collection exists
            collections = self.client.get_collections().collections
            collection_names = [c.name for c in collections]
            
            if self.config.collection_name not in collection_names:
                # Create collection
                self.client.create_collection(
                    collection_name=self.config.collection_name,
                    vectors_config=VectorParams(
                        size=self.config.embedding_dimension,
                        distance=self._distance_map.get(
                            self.config.distance_metric, 
                            Distance.COSINE
                        )
                    )
                )
                logger.info(f"Created Qdrant collection: {self.config.collection_name}")
            else:
                logger.info(f"Using existing Qdrant collection: {self.config.collection_name}")
                
        except Exception as e:
            logger.error(f"Failed to initialize Qdrant: {str(e)}")
            raise
    
    async def add_documents(
        self,
        documents: List[Document],
        tenant_id: str,
        **kwargs
    ) -> List[str]:
        """Add documents to Qdrant"""
        try:
            points = []
            doc_ids = []
            
            for doc in documents:
                # Generate ID if not provided
                doc_id = doc.id or str(uuid.uuid4())
                doc_ids.append(doc_id)
                
                # Prepare metadata
                metadata = doc.metadata.copy()
                metadata["tenant_id"] = tenant_id
                metadata["content"] = doc.content
                metadata["indexed_at"] = datetime.utcnow().isoformat()
                
                # Create point
                point = PointStruct(
                    id=doc_id,
                    vector=doc.embedding,
                    payload=metadata
                )
                points.append(point)
            
            # Batch upload
            operation_info = self.client.upsert(
                collection_name=self.config.collection_name,
                points=points,
                wait=True
            )
            
            if operation_info.status == UpdateStatus.COMPLETED:
                logger.info(f"Added {len(documents)} documents to Qdrant")
                return doc_ids
            else:
                raise Exception(f"Failed to add documents: {operation_info}")
                
        except Exception as e:
            logger.error(f"Error adding documents to Qdrant: {str(e)}")
            raise
    
    async def search(
        self,
        query_embedding: List[float],
        tenant_id: str,
        top_k: int = 10,
        filters: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> List[SearchResult]:
        """Search for similar documents in Qdrant"""
        try:
            # Build filter with tenant isolation
            must_conditions = [
                FieldCondition(
                    key="tenant_id",
                    match=MatchValue(value=tenant_id)
                )
            ]
            
            # Add additional filters
            if filters:
                for key, value in filters.items():
                    must_conditions.append(
                        FieldCondition(
                            key=key,
                            match=MatchValue(value=value)
                        )
                    )
            
            # Perform search
            search_result = self.client.search(
                collection_name=self.config.collection_name,
                query_vector=query_embedding,
                query_filter=Filter(must=must_conditions),
                limit=top_k,
                with_payload=True,
                with_vectors=False
            )
            
            # Convert to SearchResult
            results = []
            for hit in search_result:
                results.append(SearchResult(
                    id=str(hit.id),
                    content=hit.payload.get("content", ""),
                    metadata={k: v for k, v in hit.payload.items() if k != "content"},
                    score=hit.score
                ))
            
            return results
            
        except Exception as e:
            logger.error(f"Error searching in Qdrant: {str(e)}")
            raise
    
    async def delete_documents(
        self,
        document_ids: List[str],
        tenant_id: str,
        **kwargs
    ) -> bool:
        """Delete documents from Qdrant"""
        try:
            # Delete with tenant filter for safety
            self.client.delete(
                collection_name=self.config.collection_name,
                points_selector=Filter(
                    must=[
                        FieldCondition(
                            key="tenant_id",
                            match=MatchValue(value=tenant_id)
                        ),
                        FieldCondition(
                            key="id",
                            match=MatchValue(any=document_ids)
                        )
                    ]
                )
            )
            
            logger.info(f"Deleted {len(document_ids)} documents from Qdrant")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting documents from Qdrant: {str(e)}")
            return False
    
    async def update_document(
        self,
        document: Document,
        tenant_id: str,
        **kwargs
    ) -> bool:
        """Update a document in Qdrant"""
        try:
            # Prepare metadata
            metadata = document.metadata.copy()
            metadata["tenant_id"] = tenant_id
            metadata["content"] = document.content
            metadata["updated_at"] = datetime.utcnow().isoformat()
            
            # Update point
            operation_info = self.client.upsert(
                collection_name=self.config.collection_name,
                points=[
                    PointStruct(
                        id=document.id,
                        vector=document.embedding,
                        payload=metadata
                    )
                ],
                wait=True
            )
            
            return operation_info.status == UpdateStatus.COMPLETED
            
        except Exception as e:
            logger.error(f"Error updating document in Qdrant: {str(e)}")
            return False
    
    async def get_document(
        self,
        document_id: str,
        tenant_id: str,
        **kwargs
    ) -> Optional[Document]:
        """Get a document by ID from Qdrant"""
        try:
            # Retrieve with tenant filter
            result = self.client.retrieve(
                collection_name=self.config.collection_name,
                ids=[document_id],
                with_payload=True,
                with_vectors=True
            )
            
            if result:
                point = result[0]
                # Verify tenant ownership
                if point.payload.get("tenant_id") == tenant_id:
                    return Document(
                        id=str(point.id),
                        content=point.payload.get("content", ""),
                        metadata={k: v for k, v in point.payload.items() if k != "content"},
                        embedding=point.vector
                    )
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting document from Qdrant: {str(e)}")
            return None
    
    async def count_documents(
        self,
        tenant_id: str,
        filters: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> int:
        """Count documents in Qdrant collection"""
        try:
            # Build filter
            must_conditions = [
                FieldCondition(
                    key="tenant_id",
                    match=MatchValue(value=tenant_id)
                )
            ]
            
            if filters:
                for key, value in filters.items():
                    must_conditions.append(
                        FieldCondition(
                            key=key,
                            match=MatchValue(value=value)
                        )
                    )
            
            # Count with filter
            count_result = self.client.count(
                collection_name=self.config.collection_name,
                count_filter=Filter(must=must_conditions)
            )
            
            return count_result.count
            
        except Exception as e:
            logger.error(f"Error counting documents in Qdrant: {str(e)}")
            return 0
    
    async def health_check(self) -> bool:
        """Check if Qdrant is healthy"""
        try:
            info = self.client.get_collection(self.config.collection_name)
            return info is not None
        except Exception as e:
            logger.error(f"Qdrant health check failed: {str(e)}")
            return False
    
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
        Hybrid search in Qdrant
        Combines vector similarity with text search in metadata
        """
        try:
            # Get vector search results
            vector_results = await self.search(
                query_embedding, tenant_id, top_k * 2, filters
            )
            
            # Filter by text relevance in content
            query_terms = query_text.lower().split()
            scored_results = []
            
            for result in vector_results:
                content_lower = result.content.lower()
                # Calculate text relevance score
                text_score = sum(
                    1 for term in query_terms 
                    if term in content_lower
                ) / len(query_terms)
                
                # Combine scores
                combined_score = (alpha * result.score) + ((1 - alpha) * text_score)
                result.score = combined_score
                scored_results.append(result)
            
            # Sort by combined score and return top_k
            scored_results.sort(key=lambda x: x.score, reverse=True)
            return scored_results[:top_k]
            
        except Exception as e:
            logger.error(f"Error in hybrid search: {str(e)}")
            # Fallback to vector search
            return await self.search(query_embedding, tenant_id, top_k, filters)