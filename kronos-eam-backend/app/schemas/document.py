"""
Document schemas for API requests and responses
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

from app.models.document import (
    DocumentCategoryEnum, DocumentTypeEnum, DocumentStatusEnum
)


class DocumentBase(BaseModel):
    """Base document schema"""
    name: str
    description: Optional[str] = None
    category: DocumentCategoryEnum
    due_date: Optional[datetime] = None
    tags: Optional[List[str]] = []
    model_metadata: Optional[Dict[str, Any]] = {}
    is_standard: bool = False
    regulatory_references: Optional[List[str]] = []
    external_links: Optional[List[str]] = []


class DocumentCreate(DocumentBase):
    """Schema for creating documents"""
    plant_id: Optional[int] = None
    workflow_id: Optional[int] = None
    task_id: Optional[int] = None


class DocumentUpdate(BaseModel):
    """Schema for updating documents"""
    name: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    regulatory_references: Optional[List[str]] = None
    external_links: Optional[List[str]] = None
    version_note: Optional[str] = None


class DocumentResponse(DocumentBase):
    """Document response schema"""
    id: int
    type: DocumentTypeEnum
    status: DocumentStatusEnum
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    checksum: Optional[str] = None
    plant_id: Optional[int] = None
    workflow_id: Optional[int] = None
    task_id: Optional[int] = None
    upload_date: datetime
    last_modified_date: datetime
    version: int
    size_display: Optional[str] = None
    
    class Config:
        from_attributes = True


class DocumentSearchRequest(BaseModel):
    """Document search request schema"""
    query: Optional[str] = None
    category: Optional[DocumentCategoryEnum] = None
    type: Optional[DocumentTypeEnum] = None
    status: Optional[DocumentStatusEnum] = None
    plant_id: Optional[int] = None
    workflow_id: Optional[int] = None
    tags: Optional[List[str]] = None
    is_standard: Optional[bool] = None
    regulatory_reference: Optional[str] = None
    data_scadenza_start: Optional[datetime] = None
    data_scadenza_end: Optional[datetime] = None
    limit: int = Field(default=50, ge=1, le=100)
    offset: int = Field(default=0, ge=0)
    order_by: str = Field(default="created_at")
    order_desc: bool = True


class DocumentSearchResponse(BaseModel):
    """Document search response schema"""
    documents: List[DocumentResponse]
    total: int
    limit: int
    offset: int
    facets: Dict[str, Any]


class DocumentCopyRequest(BaseModel):
    """Request schema for copying documents"""
    copy_name: Optional[str] = None
    target_impianto_id: Optional[int] = None
    customizations: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


class DocumentVersionResponse(BaseModel):
    """Document version response schema"""
    id: int
    version: int
    changes: Optional[str] = None
    modified_by: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class DocumentCopyResponse(BaseModel):
    """Document copy response schema"""
    id: int
    original_document_id: int
    copy_name: Optional[str] = None
    customized_content: Optional[str] = None
    copy_date: datetime
    last_modified_copy: datetime
    applied_changes: Optional[Dict[str, Any]] = {}
    customization_notes: Optional[str] = None
    
    class Config:
        from_attributes = True