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
    nome: str
    descrizione: Optional[str] = None
    categoria: DocumentCategoryEnum
    data_scadenza: Optional[datetime] = None
    tags: Optional[List[str]] = []
    model_metadata: Optional[Dict[str, Any]] = {}
    is_standard: bool = False
    riferimenti_normativi: Optional[List[str]] = []
    link_esterni: Optional[List[str]] = []


class DocumentCreate(DocumentBase):
    """Schema for creating documents"""
    impianto_id: Optional[int] = None
    workflow_id: Optional[int] = None
    task_id: Optional[int] = None


class DocumentUpdate(BaseModel):
    """Schema for updating documents"""
    nome: Optional[str] = None
    descrizione: Optional[str] = None
    data_scadenza: Optional[datetime] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    riferimenti_normativi: Optional[List[str]] = None
    link_esterni: Optional[List[str]] = None
    version_note: Optional[str] = None


class DocumentResponse(DocumentBase):
    """Document response schema"""
    id: int
    tipo: DocumentTypeEnum
    stato: DocumentStatusEnum
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    checksum: Optional[str] = None
    impianto_id: Optional[int] = None
    workflow_id: Optional[int] = None
    task_id: Optional[int] = None
    data_caricamento: datetime
    data_ultima_modifica: datetime
    versione: int
    dimensione: Optional[str] = None
    
    class Config:
        from_attributes = True


class DocumentSearchRequest(BaseModel):
    """Document search request schema"""
    query: Optional[str] = None
    categoria: Optional[DocumentCategoryEnum] = None
    tipo: Optional[DocumentTypeEnum] = None
    stato: Optional[DocumentStatusEnum] = None
    impianto_id: Optional[int] = None
    workflow_id: Optional[int] = None
    tags: Optional[List[str]] = None
    is_standard: Optional[bool] = None
    riferimento_normativo: Optional[str] = None
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
    nome_copia: Optional[str] = None
    target_impianto_id: Optional[int] = None
    customizations: Optional[Dict[str, Any]] = None
    note: Optional[str] = None


class DocumentVersionResponse(BaseModel):
    """Document version response schema"""
    id: int
    versione: int
    modifiche: Optional[str] = None
    modificato_da: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class DocumentCopyResponse(BaseModel):
    """Document copy response schema"""
    id: int
    documento_originale_id: int
    nome_copia: Optional[str] = None
    contenuto_customizzato: Optional[str] = None
    data_copia: datetime
    ultima_modifica_copia: datetime
    modifiche_applicate: Optional[Dict[str, Any]] = {}
    note_personalizzazione: Optional[str] = None
    
    class Config:
        from_attributes = True