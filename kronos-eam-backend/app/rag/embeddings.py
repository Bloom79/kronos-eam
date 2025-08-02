"""
Embedding service for document vectorization
"""

from typing import List, Dict, Any, Optional
import logging
from abc import ABC, abstractmethod
import asyncio

from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_openai import OpenAIEmbeddings
from sentence_transformers import SentenceTransformer
import numpy as np

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class BaseEmbedder(ABC):
    """Base class for embedding models"""
    
    @abstractmethod
    async def embed_text(self, text: str) -> List[float]:
        """Embed a single text"""
        pass
    
    @abstractmethod
    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Embed multiple texts"""
        pass
    
    @abstractmethod
    def get_dimension(self) -> int:
        """Get embedding dimension"""
        pass


class GoogleEmbedder(BaseEmbedder):
    """Google Generative AI embeddings"""
    
    def __init__(self, model_name: str = "models/embedding-001"):
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model=model_name,
            google_api_key=get_settings().GOOGLE_API_KEY
        )
        self._dimension = 768  # Default for Google embeddings
    
    async def embed_text(self, text: str) -> List[float]:
        """Embed a single text"""
        try:
            embedding = await self.embeddings.aembed_query(text)
            return embedding
        except Exception as e:
            logger.error(f"Error embedding text with Google: {str(e)}")
            raise
    
    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Embed multiple texts"""
        try:
            embeddings = await self.embeddings.aembed_documents(texts)
            return embeddings
        except Exception as e:
            logger.error(f"Error embedding texts with Google: {str(e)}")
            raise
    
    def get_dimension(self) -> int:
        return self._dimension


class OpenAIEmbedder(BaseEmbedder):
    """OpenAI embeddings"""
    
    def __init__(self, model_name: str = "text-embedding-ada-002"):
        self.embeddings = OpenAIEmbeddings(
            model=model_name,
            openai_api_key=get_settings().OPENAI_API_KEY
        )
        self._dimension = 1536  # Default for ada-002
    
    async def embed_text(self, text: str) -> List[float]:
        """Embed a single text"""
        try:
            embedding = await self.embeddings.aembed_query(text)
            return embedding
        except Exception as e:
            logger.error(f"Error embedding text with OpenAI: {str(e)}")
            raise
    
    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Embed multiple texts"""
        try:
            embeddings = await self.embeddings.aembed_documents(texts)
            return embeddings
        except Exception as e:
            logger.error(f"Error embedding texts with OpenAI: {str(e)}")
            raise
    
    def get_dimension(self) -> int:
        return self._dimension


class LocalEmbedder(BaseEmbedder):
    """Local sentence transformers embeddings"""
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)
        self._dimension = self.model.get_sentence_embedding_dimension()
    
    async def embed_text(self, text: str) -> List[float]:
        """Embed a single text"""
        try:
            # Run in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            embedding = await loop.run_in_executor(
                None, self.model.encode, text
            )
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Error embedding text locally: {str(e)}")
            raise
    
    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Embed multiple texts"""
        try:
            loop = asyncio.get_event_loop()
            embeddings = await loop.run_in_executor(
                None, self.model.encode, texts
            )
            return embeddings.tolist()
        except Exception as e:
            logger.error(f"Error embedding texts locally: {str(e)}")
            raise
    
    def get_dimension(self) -> int:
        return self._dimension


class EmbeddingService:
    """Main embedding service with fallback support"""
    
    def __init__(self, primary_provider: str = "google"):
        self.settings = get_settings()
        self.primary_provider = primary_provider
        self.embedders = self._initialize_embedders()
        self._dimension = None
    
    def _initialize_embedders(self) -> Dict[str, BaseEmbedder]:
        """Initialize available embedders"""
        embedders = {}
        
        # Try to initialize Google embedder
        if self.settings.GOOGLE_API_KEY:
            try:
                embedders["google"] = GoogleEmbedder()
                logger.info("Initialized Google embedder")
            except Exception as e:
                logger.warning(f"Failed to initialize Google embedder: {e}")
        
        # Try to initialize OpenAI embedder
        if self.settings.OPENAI_API_KEY:
            try:
                embedders["openai"] = OpenAIEmbedder()
                logger.info("Initialized OpenAI embedder")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI embedder: {e}")
        
        # Always have local embedder as fallback
        try:
            embedders["local"] = LocalEmbedder()
            logger.info("Initialized local embedder")
        except Exception as e:
            logger.error(f"Failed to initialize local embedder: {e}")
        
        return embedders
    
    def get_dimension(self) -> int:
        """Get embedding dimension from primary provider"""
        if self._dimension is None:
            embedder = self._get_embedder()
            self._dimension = embedder.get_dimension()
        return self._dimension
    
    def _get_embedder(self) -> BaseEmbedder:
        """Get embedder with fallback"""
        # Try primary provider
        if self.primary_provider in self.embedders:
            return self.embedders[self.primary_provider]
        
        # Fallback order
        fallback_order = ["google", "openai", "local"]
        for provider in fallback_order:
            if provider in self.embedders:
                logger.warning(f"Using fallback embedder: {provider}")
                return self.embedders[provider]
        
        raise ValueError("No embedding providers available")
    
    async def embed_text(self, text: str) -> List[float]:
        """Embed a single text with automatic fallback"""
        embedder = self._get_embedder()
        
        try:
            return await embedder.embed_text(text)
        except Exception as e:
            logger.error(f"Primary embedder failed: {e}")
            
            # Try fallbacks
            for provider, embedder in self.embedders.items():
                if provider != self.primary_provider:
                    try:
                        logger.info(f"Trying fallback embedder: {provider}")
                        return await embedder.embed_text(text)
                    except Exception as e2:
                        logger.error(f"Fallback {provider} also failed: {e2}")
            
            raise Exception("All embedding providers failed")
    
    async def embed_texts(self, texts: List[str], batch_size: int = 100) -> List[List[float]]:
        """Embed multiple texts with batching and fallback"""
        if not texts:
            return []
        
        embedder = self._get_embedder()
        all_embeddings = []
        
        # Process in batches
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            
            try:
                embeddings = await embedder.embed_texts(batch)
                all_embeddings.extend(embeddings)
            except Exception as e:
                logger.error(f"Batch embedding failed: {e}")
                
                # Try fallbacks
                success = False
                for provider, fallback_embedder in self.embedders.items():
                    if provider != self.primary_provider:
                        try:
                            logger.info(f"Trying fallback embedder: {provider}")
                            embeddings = await fallback_embedder.embed_texts(batch)
                            all_embeddings.extend(embeddings)
                            success = True
                            break
                        except Exception as e2:
                            logger.error(f"Fallback {provider} also failed: {e2}")
                
                if not success:
                    raise Exception("All embedding providers failed")
        
        return all_embeddings
    
    async def embed_documents(
        self,
        documents: List[Dict[str, Any]],
        text_field: str = "content"
    ) -> List[Dict[str, Any]]:
        """Embed documents and add embeddings to them"""
        # Extract texts
        texts = [doc.get(text_field, "") for doc in documents]
        
        # Generate embeddings
        embeddings = await self.embed_texts(texts)
        
        # Add embeddings to documents
        for doc, embedding in zip(documents, embeddings):
            doc["embedding"] = embedding
        
        return documents