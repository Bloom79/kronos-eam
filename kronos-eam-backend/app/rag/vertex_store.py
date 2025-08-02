"""
Google Vertex AI Vector Search implementation
"""

from typing import Dict, Any, List, Optional, Tuple
import logging
from datetime import datetime
import uuid
import json
import os

from google.cloud import aiplatform
from google.cloud import storage
from google.oauth2 import service_account

from app.rag.base import BaseVectorStore, Document, SearchResult, VectorStoreConfig

logger = logging.getLogger(__name__)


class VertexAIVectorStore(BaseVectorStore):
    """Google Vertex AI Vector Search implementation"""
    
    def __init__(self, config: VectorStoreConfig):
        super().__init__(config)
        self.index = None
        self.index_endpoint = None
        self.deployed_index_id = None
        self.storage_client = None
        self.bucket = None
        
        # Initialize credentials if provided
        if os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
            credentials = service_account.Credentials.from_service_account_file(
                os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
            )
            aiplatform.init(
                project=config.vertex_project_id,
                location=config.vertex_region,
                credentials=credentials
            )
        else:
            aiplatform.init(
                project=config.vertex_project_id,
                location=config.vertex_region
            )
    
    async def initialize(self, **kwargs) -> None:
        """Initialize Vertex AI Vector Search"""
        try:
            # Initialize storage client
            self.storage_client = storage.Client(project=self.config.vertex_project_id)
            self.bucket = self.storage_client.bucket(self.config.vertex_gcs_bucket)
            
            # Check if index exists or create new one
            if self.config.vertex_index_id:
                try:
                    self.index = aiplatform.MatchingEngineIndex(
                        index_name=self.config.vertex_index_id
                    )
                    logger.info(f"Using existing Vertex AI index: {self.config.vertex_index_id}")
                except Exception:
                    logger.info("Index not found, creating new one")
                    await self._create_index()
            else:
                await self._create_index()
            
            # Check if index endpoint exists or create new one
            if self.config.vertex_index_endpoint_id:
                try:
                    self.index_endpoint = aiplatform.MatchingEngineIndexEndpoint(
                        index_endpoint_name=self.config.vertex_index_endpoint_id
                    )
                    logger.info(f"Using existing endpoint: {self.config.vertex_index_endpoint_id}")
                    
                    # Check if index is deployed
                    deployed_indexes = self.index_endpoint.deployed_indexes
                    for deployed in deployed_indexes:
                        if deployed.index == self.index.resource_name:
                            self.deployed_index_id = deployed.id
                            break
                    
                    if not self.deployed_index_id:
                        await self._deploy_index()
                except Exception:
                    logger.info("Endpoint not found, creating new one")
                    await self._create_endpoint()
                    await self._deploy_index()
            else:
                await self._create_endpoint()
                await self._deploy_index()
                
        except Exception as e:
            logger.error(f"Failed to initialize Vertex AI: {str(e)}")
            raise
    
    async def _create_index(self) -> None:
        """Create a new Vertex AI index"""
        try:
            # Prepare index metadata
            index_metadata = {
                "contentsDeltaUri": f"gs://{self.config.vertex_gcs_bucket}/{self.config.collection_name}",
                "config": {
                    "dimensions": self.config.embedding_dimension,
                    "approximateNeighborsCount": 100,
                    "shardSize": "SHARD_SIZE_SMALL",
                    "distanceMeasureType": self._get_distance_type()
                }
            }
            
            # Create index
            self.index = aiplatform.MatchingEngineIndex.create(
                display_name=f"{self.config.collection_name}_index",
                description=f"Index for {self.config.collection_name}",
                metadata=index_metadata,
                index_update_method=self.config.vertex_index_update_method
            )
            
            logger.info(f"Created Vertex AI index: {self.index.resource_name}")
            
        except Exception as e:
            logger.error(f"Error creating index: {str(e)}")
            raise
    
    async def _create_endpoint(self) -> None:
        """Create a new index endpoint"""
        try:
            self.index_endpoint = aiplatform.MatchingEngineIndexEndpoint.create(
                display_name=f"{self.config.collection_name}_endpoint",
                description=f"Endpoint for {self.config.collection_name}",
                public_endpoint_enabled=True
            )
            
            logger.info(f"Created endpoint: {self.index_endpoint.resource_name}")
            
        except Exception as e:
            logger.error(f"Error creating endpoint: {str(e)}")
            raise
    
    async def _deploy_index(self) -> None:
        """Deploy index to endpoint"""
        try:
            self.deployed_index_id = f"{self.config.collection_name}_deployed"
            
            self.index_endpoint.deploy_index(
                index=self.index,
                deployed_index_id=self.deployed_index_id,
                display_name=f"{self.config.collection_name}_deployment",
                min_replica_count=1,
                max_replica_count=2
            )
            
            logger.info(f"Deployed index to endpoint with ID: {self.deployed_index_id}")
            
        except Exception as e:
            logger.error(f"Error deploying index: {str(e)}")
            raise
    
    def _get_distance_type(self) -> str:
        """Convert distance metric to Vertex AI format"""
        mapping = {
            "cosine": "COSINE_DISTANCE",
            "euclidean": "SQUARED_L2_DISTANCE",
            "dot": "DOT_PRODUCT_DISTANCE"
        }
        return mapping.get(self.config.distance_metric, "COSINE_DISTANCE")
    
    async def add_documents(
        self,
        documents: List[Document],
        tenant_id: str,
        **kwargs
    ) -> List[str]:
        """Add documents to Vertex AI Vector Search"""
        try:
            # Prepare documents for upload
            doc_ids = []
            jsonl_data = []
            
            for doc in documents:
                doc_id = doc.id or str(uuid.uuid4())
                doc_ids.append(doc_id)
                
                # Prepare document data
                doc_data = {
                    "id": doc_id,
                    "embedding": doc.embedding,
                    "restricts": [
                        {"namespace": "tenant_id", "allow": [tenant_id]}
                    ],
                    "metadata": {
                        **doc.metadata,
                        "tenant_id": tenant_id,
                        "content": doc.content,
                        "indexed_at": datetime.utcnow().isoformat()
                    }
                }
                
                jsonl_data.append(json.dumps(doc_data))
            
            # Upload to GCS
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            blob_name = f"{self.config.collection_name}/data_{timestamp}.jsonl"
            blob = self.bucket.blob(blob_name)
            blob.upload_from_string("\n".join(jsonl_data))
            
            logger.info(f"Uploaded {len(documents)} documents to GCS: {blob_name}")
            
            # For stream update, update the index
            if self.config.vertex_index_update_method == "STREAM_UPDATE":
                # Stream updates are handled automatically by Vertex AI
                pass
            
            return doc_ids
            
        except Exception as e:
            logger.error(f"Error adding documents to Vertex AI: {str(e)}")
            raise
    
    async def search(
        self,
        query_embedding: List[float],
        tenant_id: str,
        top_k: int = 10,
        filters: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> List[SearchResult]:
        """Search for similar documents in Vertex AI"""
        try:
            if not self.index_endpoint:
                raise ValueError("Index endpoint not initialized")
            
            # Prepare restricts for tenant isolation
            restricts = [{"namespace": "tenant_id", "allow": [tenant_id]}]
            
            # Add additional filters as restricts
            if filters:
                for key, value in filters.items():
                    if isinstance(value, list):
                        restricts.append({"namespace": key, "allow": value})
                    else:
                        restricts.append({"namespace": key, "allow": [str(value)]})
            
            # Perform search
            response = self.index_endpoint.match(
                deployed_index_id=self.deployed_index_id,
                queries=[query_embedding],
                num_neighbors=top_k,
                restricts=restricts
            )
            
            # Parse results
            results = []
            if response and len(response) > 0:
                for match in response[0]:
                    # Retrieve metadata from GCS if needed
                    metadata = self._retrieve_metadata(match.id)
                    
                    results.append(SearchResult(
                        id=match.id,
                        content=metadata.get("content", ""),
                        metadata={k: v for k, v in metadata.items() if k != "content"},
                        score=1.0 - match.distance  # Convert distance to similarity
                    ))
            
            return results
            
        except Exception as e:
            logger.error(f"Error searching in Vertex AI: {str(e)}")
            raise
    
    def _retrieve_metadata(self, doc_id: str) -> Dict[str, Any]:
        """Retrieve document metadata from storage"""
        try:
            # In production, implement metadata caching or database storage
            # For now, return basic metadata
            return {
                "id": doc_id,
                "retrieved_at": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Error retrieving metadata: {str(e)}")
            return {}
    
    async def delete_documents(
        self,
        document_ids: List[str],
        tenant_id: str,
        **kwargs
    ) -> bool:
        """Delete documents from Vertex AI"""
        try:
            # Vertex AI doesn't support direct deletion in streaming mode
            # Mark documents as deleted in metadata or maintain deletion list
            logger.warning("Document deletion not directly supported in Vertex AI streaming mode")
            
            # In production, implement soft delete by updating metadata
            # or maintaining a deletion list
            
            return True
            
        except Exception as e:
            logger.error(f"Error deleting documents: {str(e)}")
            return False
    
    async def update_document(
        self,
        document: Document,
        tenant_id: str,
        **kwargs
    ) -> bool:
        """Update a document in Vertex AI"""
        try:
            # For updates, add the document with the same ID
            # Vertex AI will overwrite the existing document
            await self.add_documents([document], tenant_id)
            return True
            
        except Exception as e:
            logger.error(f"Error updating document: {str(e)}")
            return False
    
    async def get_document(
        self,
        document_id: str,
        tenant_id: str,
        **kwargs
    ) -> Optional[Document]:
        """Get a document by ID"""
        try:
            # Vertex AI doesn't support direct document retrieval
            # Implement using metadata storage or perform a search with exact ID
            logger.warning("Direct document retrieval not supported in Vertex AI")
            return None
            
        except Exception as e:
            logger.error(f"Error getting document: {str(e)}")
            return None
    
    async def count_documents(
        self,
        tenant_id: str,
        filters: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> int:
        """Count documents in collection"""
        try:
            # Vertex AI doesn't provide direct count functionality
            # Implement using metadata storage or approximate count
            logger.warning("Document counting not directly supported in Vertex AI")
            return 0
            
        except Exception as e:
            logger.error(f"Error counting documents: {str(e)}")
            return 0
    
    async def health_check(self) -> bool:
        """Check if Vertex AI is healthy"""
        try:
            if self.index and self.index_endpoint:
                # Check if endpoint is deployed
                deployed_indexes = self.index_endpoint.deployed_indexes
                return len(deployed_indexes) > 0
            return False
        except Exception as e:
            logger.error(f"Vertex AI health check failed: {str(e)}")
            return False