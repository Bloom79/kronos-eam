"""
Document indexing service for processing and storing documents in vector store
"""

from typing import Dict, Any, List, Optional
import logging
from datetime import datetime
import os
import asyncio
from pathlib import Path

from app.rag.factory import VectorStoreFactory
from app.rag.embeddings import EmbeddingService
from app.rag.chunking import DocumentChunker
from app.rag.base import Document as VectorDocument
from app.core.config import get_settings
from sqlalchemy.orm import Session
from app.models.document import Document, DocumentStatusEnum
import uuid

logger = logging.getLogger(__name__)


class DocumentIndexingService:
    """Service for indexing documents into vector store"""
    
    def __init__(self):
        self.settings = get_settings()
        self.vector_store = VectorStoreFactory.get_default()
        self.embedding_service = EmbeddingService()
        self.chunker = DocumentChunker()
        self._initialized = False
    
    async def initialize(self):
        """Initialize the service"""
        if not self._initialized:
            await self.vector_store.initialize()
            self._initialized = True
    
    async def index_document(
        self,
        document_id: int,
        content: str,
        metadata: Dict[str, Any],
        tenant_id: str,
        db: Session
    ) -> Dict[str, Any]:
        """
        Index a document into the vector store
        
        Args:
            document_id: Database document ID
            content: Document text content
            metadata: Document metadata
            tenant_id: Tenant identifier
            db: Database session
            
        Returns:
            Indexing result with statistics
        """
        try:
            await self.initialize()
            
            # Get document from database
            document = db.query(Document).filter(
                Document.id == document_id,
                Document.tenant_id == tenant_id
            ).first()
            
            if not document:
                return {"error": "Document not found"}
            
            # Prepare metadata
            doc_metadata = {
                "document_id": document_id,
                "document_name": document.nome,
                "document_type": document.tipo,
                "category": document.categoria,
                "impianto_id": document.impianto_id,
                "upload_date": document.data_caricamento.isoformat() if document.data_caricamento else None,
                "expiration_date": document.data_scadenza.isoformat() if document.data_scadenza else None,
                **metadata
            }
            
            # Chunk the document
            chunks = self.chunker.chunk_document(
                text=content,
                document_type=document.tipo or "generic",
                metadata=doc_metadata
            )
            
            # Generate embeddings and create vector documents
            vector_docs = []
            for i, chunk in enumerate(chunks):
                # Generate embedding
                embedding = await self.embedding_service.embed_text(chunk.content)
                
                # Create vector document
                vec_doc = VectorDocument(
                    id=f"{document_id}_{i}",
                    content=chunk.content,
                    metadata={
                        **chunk.metadata,
                        "chunk_index": i,
                        "total_chunks": len(chunks)
                    },
                    embedding=embedding
                )
                vector_docs.append(vec_doc)
            
            # Add to vector store
            doc_ids = await self.vector_store.add_documents(vector_docs, tenant_id)
            
            # Update document status
            document.stato = DocumentStatusEnum.INDEXED
            document.metadata = document.metadata or {}
            document.metadata["vector_ids"] = doc_ids
            document.metadata["chunks_count"] = len(chunks)
            document.metadata["indexed_at"] = datetime.utcnow().isoformat()
            
            db.commit()
            
            logger.info(f"Indexed document {document_id} into {len(chunks)} chunks")
            
            return {
                "success": True,
                "document_id": document_id,
                "chunks_created": len(chunks),
                "vector_ids": doc_ids
            }
            
        except Exception as e:
            logger.error(f"Error indexing document {document_id}: {str(e)}")
            db.rollback()
            return {"error": str(e)}
    
    async def index_batch(
        self,
        documents: List[Dict[str, Any]],
        tenant_id: str,
        db: Session
    ) -> Dict[str, Any]:
        """Index multiple documents in batch"""
        results = {
            "total": len(documents),
            "successful": 0,
            "failed": 0,
            "errors": []
        }
        
        for doc in documents:
            try:
                result = await self.index_document(
                    document_id=doc["id"],
                    content=doc["content"],
                    metadata=doc.get("metadata", {}),
                    tenant_id=tenant_id,
                    db=db
                )
                
                if result.get("success"):
                    results["successful"] += 1
                else:
                    results["failed"] += 1
                    results["errors"].append({
                        "document_id": doc["id"],
                        "error": result.get("error", "Unknown error")
                    })
                    
            except Exception as e:
                results["failed"] += 1
                results["errors"].append({
                    "document_id": doc.get("id", "unknown"),
                    "error": str(e)
                })
        
        return results
    
    async def reindex_document(
        self,
        document_id: int,
        tenant_id: str,
        db: Session
    ) -> Dict[str, Any]:
        """Reindex an existing document"""
        try:
            # Delete existing vectors
            document = db.query(Document).filter(
                Document.id == document_id,
                Document.tenant_id == tenant_id
            ).first()
            
            if not document:
                return {"error": "Document not found"}
            
            # Delete old vectors
            if document.metadata and "vector_ids" in document.metadata:
                old_ids = document.metadata["vector_ids"]
                await self.vector_store.delete_documents(old_ids, tenant_id)
            
            # Read document content
            content = self._read_document_content(document)
            
            # Reindex
            return await self.index_document(
                document_id=document_id,
                content=content,
                metadata={},
                tenant_id=tenant_id,
                db=db
            )
            
        except Exception as e:
            logger.error(f"Error reindexing document {document_id}: {str(e)}")
            return {"error": str(e)}
    
    def _read_document_content(self, document: Document) -> str:
        """Read document content from file"""
        try:
            # Construct file path
            file_path = Path(self.settings.UPLOAD_PATH) / document.percorso_file
            
            if not file_path.exists():
                logger.error(f"Document file not found: {file_path}")
                return ""
            
            # Read based on file type
            if document.tipo == "pdf":
                return self._extract_pdf_text(file_path)
            elif document.tipo in ["txt", "md"]:
                return file_path.read_text(encoding="utf-8")
            else:
                # For other types, return empty for now
                logger.warning(f"Unsupported document type: {document.tipo}")
                return ""
                
        except Exception as e:
            logger.error(f"Error reading document content: {str(e)}")
            return ""
    
    def _extract_pdf_text(self, file_path: Path) -> str:
        """Extract text from PDF file"""
        try:
            import PyPDF2
            
            text = ""
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    text += page.extract_text() + "\n"
            
            return text
            
        except Exception as e:
            logger.error(f"Error extracting PDF text: {str(e)}")
            return ""
    
    async def search_similar_documents(
        self,
        query: str,
        tenant_id: str,
        filters: Optional[Dict[str, Any]] = None,
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        """Search for similar documents"""
        try:
            await self.initialize()
            
            # Generate query embedding
            query_embedding = await self.embedding_service.embed_text(query)
            
            # Search
            results = await self.vector_store.search(
                query_embedding=query_embedding,
                tenant_id=tenant_id,
                top_k=top_k,
                filters=filters
            )
            
            # Format results
            formatted_results = []
            for result in results:
                formatted_results.append({
                    "document_id": result.metadata.get("document_id"),
                    "document_name": result.metadata.get("document_name"),
                    "chunk_content": result.content,
                    "score": result.score,
                    "metadata": result.metadata
                })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error searching documents: {str(e)}")
            return []


# Singleton instance
document_indexing_service = DocumentIndexingService()