"""
Document chunking strategies
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import re
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class TextChunk:
    """A chunk of text with metadata"""
    content: str
    metadata: Dict[str, Any]
    start_index: int
    end_index: int
    chunk_index: int


class ChunkingStrategy(ABC):
    """Base class for chunking strategies"""
    
    @abstractmethod
    def chunk(self, text: str, metadata: Optional[Dict[str, Any]] = None) -> List[TextChunk]:
        """Chunk text into smaller pieces"""
        pass


class FixedSizeChunker(ChunkingStrategy):
    """Chunk text into fixed-size pieces with overlap"""
    
    def __init__(self, chunk_size: int = 1000, overlap: int = 200):
        self.chunk_size = chunk_size
        self.overlap = overlap
    
    def chunk(self, text: str, metadata: Optional[Dict[str, Any]] = None) -> List[TextChunk]:
        """Chunk text into fixed-size pieces"""
        if not text:
            return []
        
        chunks = []
        start = 0
        chunk_index = 0
        
        while start < len(text):
            # Calculate end position
            end = start + self.chunk_size
            
            # Try to break at sentence boundary
            if end < len(text):
                # Look for sentence end
                sentence_end = text.rfind('.', start, end)
                if sentence_end > start + self.chunk_size // 2:
                    end = sentence_end + 1
            
            # Create chunk
            chunk_text = text[start:end].strip()
            if chunk_text:
                chunks.append(TextChunk(
                    content=chunk_text,
                    metadata={
                        **(metadata or {}),
                        "chunking_strategy": "fixed_size",
                        "chunk_size": self.chunk_size,
                        "overlap": self.overlap
                    },
                    start_index=start,
                    end_index=end,
                    chunk_index=chunk_index
                ))
                chunk_index += 1
            
            # Move start position
            start = end - self.overlap if end < len(text) else end
        
        return chunks


class SemanticChunker(ChunkingStrategy):
    """Chunk text based on semantic boundaries (paragraphs, sections)"""
    
    def __init__(self, max_chunk_size: int = 1500, min_chunk_size: int = 500):
        self.max_chunk_size = max_chunk_size
        self.min_chunk_size = min_chunk_size
    
    def chunk(self, text: str, metadata: Optional[Dict[str, Any]] = None) -> List[TextChunk]:
        """Chunk text based on semantic boundaries"""
        if not text:
            return []
        
        # Split by double newlines (paragraphs) or headers
        sections = self._split_sections(text)
        
        chunks = []
        current_chunk = []
        current_size = 0
        chunk_index = 0
        chunk_start = 0
        
        for section in sections:
            section_size = len(section)
            
            # If section is too large, split it further
            if section_size > self.max_chunk_size:
                # Save current chunk if any
                if current_chunk:
                    chunk_content = '\n\n'.join(current_chunk)
                    chunks.append(TextChunk(
                        content=chunk_content,
                        metadata={
                            **(metadata or {}),
                            "chunking_strategy": "semantic",
                            "max_chunk_size": self.max_chunk_size
                        },
                        start_index=chunk_start,
                        end_index=chunk_start + len(chunk_content),
                        chunk_index=chunk_index
                    ))
                    chunk_index += 1
                    current_chunk = []
                    current_size = 0
                
                # Split large section
                sub_chunks = self._split_large_section(section)
                for sub_chunk in sub_chunks:
                    chunks.append(TextChunk(
                        content=sub_chunk,
                        metadata={
                            **(metadata or {}),
                            "chunking_strategy": "semantic",
                            "max_chunk_size": self.max_chunk_size
                        },
                        start_index=text.find(sub_chunk),
                        end_index=text.find(sub_chunk) + len(sub_chunk),
                        chunk_index=chunk_index
                    ))
                    chunk_index += 1
            
            # If adding section exceeds max size, create new chunk
            elif current_size + section_size > self.max_chunk_size and current_chunk:
                chunk_content = '\n\n'.join(current_chunk)
                chunks.append(TextChunk(
                    content=chunk_content,
                    metadata={
                        **(metadata or {}),
                        "chunking_strategy": "semantic",
                        "max_chunk_size": self.max_chunk_size
                    },
                    start_index=chunk_start,
                    end_index=chunk_start + len(chunk_content),
                    chunk_index=chunk_index
                ))
                chunk_index += 1
                
                # Start new chunk
                current_chunk = [section]
                current_size = section_size
                chunk_start = text.find(section)
            else:
                # Add to current chunk
                if not current_chunk:
                    chunk_start = text.find(section)
                current_chunk.append(section)
                current_size += section_size
        
        # Add final chunk
        if current_chunk:
            chunk_content = '\n\n'.join(current_chunk)
            chunks.append(TextChunk(
                content=chunk_content,
                metadata={
                    **(metadata or {}),
                    "chunking_strategy": "semantic",
                    "max_chunk_size": self.max_chunk_size
                },
                start_index=chunk_start,
                end_index=chunk_start + len(chunk_content),
                chunk_index=chunk_index
            ))
        
        return chunks
    
    def _split_sections(self, text: str) -> List[str]:
        """Split text into sections"""
        # Split by double newlines
        sections = re.split(r'\n\s*\n', text)
        
        # Further split by headers (markdown style)
        all_sections = []
        for section in sections:
            # Check for headers
            header_splits = re.split(r'(?=^#{1,6}\s+)', section, flags=re.MULTILINE)
            all_sections.extend([s.strip() for s in header_splits if s.strip()])
        
        return all_sections
    
    def _split_large_section(self, section: str) -> List[str]:
        """Split a large section into smaller chunks"""
        # Split by sentences
        sentences = re.split(r'(?<=[.!?])\s+', section)
        
        chunks = []
        current_chunk = []
        current_size = 0
        
        for sentence in sentences:
            sentence_size = len(sentence)
            
            if current_size + sentence_size > self.max_chunk_size and current_chunk:
                chunks.append(' '.join(current_chunk))
                current_chunk = [sentence]
                current_size = sentence_size
            else:
                current_chunk.append(sentence)
                current_size += sentence_size
        
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        return chunks


class HybridChunker(ChunkingStrategy):
    """Combine multiple chunking strategies"""
    
    def __init__(self, strategies: List[ChunkingStrategy]):
        self.strategies = strategies
    
    def chunk(self, text: str, metadata: Optional[Dict[str, Any]] = None) -> List[TextChunk]:
        """Apply multiple chunking strategies and merge results"""
        all_chunks = []
        
        for strategy in self.strategies:
            chunks = strategy.chunk(text, metadata)
            all_chunks.extend(chunks)
        
        # Remove duplicates based on content
        seen_content = set()
        unique_chunks = []
        
        for chunk in all_chunks:
            if chunk.content not in seen_content:
                seen_content.add(chunk.content)
                unique_chunks.append(chunk)
        
        return unique_chunks


class DocumentChunker:
    """Main document chunker that handles different document types"""
    
    def __init__(self, default_strategy: Optional[ChunkingStrategy] = None):
        self.default_strategy = default_strategy or SemanticChunker()
        self.strategies = {
            "pdf": SemanticChunker(),
            "txt": FixedSizeChunker(),
            "md": SemanticChunker(),
            "html": SemanticChunker()
        }
    
    def chunk_document(
        self,
        text: str,
        document_type: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> List[TextChunk]:
        """Chunk document based on its type"""
        strategy = self.strategies.get(document_type, self.default_strategy)
        
        # Add document type to metadata
        if metadata is None:
            metadata = {}
        metadata["document_type"] = document_type
        
        return strategy.chunk(text, metadata)