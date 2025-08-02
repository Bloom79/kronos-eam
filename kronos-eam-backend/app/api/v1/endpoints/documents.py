"""
Document management API endpoints
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, Body
from sqlalchemy.orm import Session
from io import BytesIO

from app.api import deps
from app.models.user import User
from app.models.document import (
    Document, DocumentCategoryEnum, DocumentTypeEnum, 
    DocumentStatusEnum
)
from app.schemas.document import (
    DocumentResponse, DocumentCreate, DocumentUpdate,
    DocumentSearchRequest, DocumentSearchResponse,
    DocumentCopyRequest
)
from app.services.document_service import DocumentService
from app.core.audit_decorator import audit_action
from app.models.audit import TipoModificaEnum


router = APIRouter()


@router.post("/upload", response_model=DocumentResponse)
@audit_action("document", TipoModificaEnum.CREAZIONE)
async def upload_document(
    file: UploadFile = File(...),
    name: str = Query(..., description="Document name"),
    category: DocumentCategoryEnum = Query(..., description="Document category"),
    description: Optional[str] = Query(None),
    plant_id: Optional[int] = Query(None),
    workflow_id: Optional[int] = Query(None),
    task_id: Optional[int] = Query(None),
    expiry_date: Optional[datetime] = Query(None),
    tags: Optional[List[str]] = Query(None),
    is_standard: bool = Query(False),
    regulatory_references: Optional[List[str]] = Query(None),
    external_links: Optional[List[str]] = Query(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Upload a new document"""
    service = DocumentService(db)
    
    # Read file content
    content = await file.read()
    file_obj = BytesIO(content)
    file_obj.filename = file.filename
    
    document = service.create_document(
        name=name,
        file=file_obj,
        category=category,
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        description=description,
        plant_id=plant_id,
        workflow_id=workflow_id,
        task_id=task_id,
        expiry_date=expiry_date,
        tags=tags,
        is_standard=is_standard,
        regulatory_references=regulatory_references,
        external_links=external_links
    )
    
    return document


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get document details"""
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.tenant_id == current_user.tenant_id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return document


@router.put("/{document_id}", response_model=DocumentResponse)
@audit_action("document", TipoModificaEnum.AGGIORNAMENTO, capture_old_state=True, capture_new_state=True)
async def update_document(
    document_id: int,
    update_data: DocumentUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Update document metadata"""
    service = DocumentService(db)
    
    document = service.update_document(
        document_id=document_id,
        user_id=current_user.id,
        tenant_id=current_user.tenant_id,
        nome=update_data.nome,
        descrizione=update_data.descrizione,
        data_scadenza=update_data.data_scadenza,
        tags=update_data.tags,
        metadata=update_data.metadata,
        riferimenti_normativi=update_data.riferimenti_normativi,
        link_esterni=update_data.link_esterni,
        version_note=update_data.version_note
    )
    
    return document


@router.put("/{document_id}/file", response_model=DocumentResponse)
@audit_action("document", TipoModificaEnum.AGGIORNAMENTO)
async def update_document_file(
    document_id: int,
    file: UploadFile = File(...),
    version_note: str = Query("File aggiornato"),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Update document file (creates new version)"""
    service = DocumentService(db)
    
    # Read file content
    content = await file.read()
    file_obj = BytesIO(content)
    file_obj.filename = file.filename
    
    document = service.update_document(
        document_id=document_id,
        user_id=current_user.id,
        tenant_id=current_user.tenant_id,
        new_file=file_obj,
        version_note=version_note
    )
    
    return document


@router.post("/search", response_model=DocumentSearchResponse)
async def search_documents(
    search_params: DocumentSearchRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Search documents with advanced filters"""
    service = DocumentService(db)
    
    result = service.search_documents(
        tenant_id=current_user.tenant_id,
        query=search_params.query,
        category=search_params.category,
        type=search_params.type,
        status=search_params.status,
        plant_id=search_params.plant_id,
        workflow_id=search_params.workflow_id,
        tags=search_params.tags,
        is_standard=search_params.is_standard,
        regulatory_reference=search_params.regulatory_reference,
        expiry_date_start=search_params.expiry_date_start,
        expiry_date_end=search_params.expiry_date_end,
        limit=search_params.limit,
        offset=search_params.offset,
        order_by=search_params.order_by,
        order_desc=search_params.order_desc
    )
    
    return result


@router.get("/expiring/{days}", response_model=List[DocumentResponse])
async def get_expiring_documents(
    days: int = 30,
    category: Optional[DocumentCategoryEnum] = Query(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get documents expiring within specified days"""
    service = DocumentService(db)
    
    documents = service.get_expiring_documents(
        tenant_id=current_user.tenant_id,
        days_ahead=days,
        category=category
    )
    
    return documents


@router.get("/standard/list", response_model=List[DocumentResponse])
async def get_standard_documents(
    category: Optional[DocumentCategoryEnum] = Query(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get all standard documents available for copying"""
    service = DocumentService(db)
    
    documents = service.get_standard_documents(
        tenant_id=current_user.tenant_id,
        category=category
    )
    
    return documents


@router.post("/{document_id}/copy", response_model=DocumentResponse)
@audit_action("document", TipoModificaEnum.CREAZIONE)
async def copy_document(
    document_id: int,
    copy_params: DocumentCopyRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Create a customized copy of a document"""
    service = DocumentService(db)
    
    try:
        document = service.copy_document(
            document_id=document_id,
            user_id=current_user.id,
            tenant_id=current_user.tenant_id,
            copy_name=copy_params.copy_name,
            target_plant_id=copy_params.target_plant_id,
            customizations=copy_params.customizations,
            notes=copy_params.notes
        )
        
        return document
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{document_id}/link-to-task/{task_id}")
async def link_document_to_task(
    document_id: int,
    task_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Link a document to a workflow task"""
    service = DocumentService(db)
    
    success = service.link_document_to_task(
        document_id=document_id,
        task_id=task_id,
        user_id=current_user.id,
        tenant_id=current_user.tenant_id
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Document or task not found")
    
    return {"message": "Document linked to task successfully"}


@router.delete("/{document_id}")
@audit_action("document", TipoModificaEnum.ELIMINAZIONE)
async def delete_document(
    document_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Soft delete a document"""
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.tenant_id == current_user.tenant_id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Check permissions
    if current_user.ruolo not in ["Admin", "Asset Manager"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Soft delete
    document.soft_delete(str(current_user.id))
    document.stato = DocumentStatusEnum.ARCHIVIATO
    db.commit()
    
    return {"message": "Document deleted successfully"}


@router.get("/{document_id}/download")
async def download_document(
    document_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Download document file"""
    from fastapi.responses import StreamingResponse
    
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.tenant_id == current_user.tenant_id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    service = DocumentService(db)
    
    try:
        content = service.storage.retrieve_file(document.file_path)
        
        return StreamingResponse(
            BytesIO(content),
            media_type=document.mime_type or "application/octet-stream",
            headers={
                "Content-Disposition": f"attachment; filename={document.nome}"
            }
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving file: {str(e)}")


@router.get("/{document_id}/versions", response_model=List[Dict[str, Any]])
async def get_document_versions(
    document_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get document version history"""
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.tenant_id == current_user.tenant_id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    versions = []
    for version in document.versions:
        versions.append({
            "id": version.id,
            "versione": version.versione,
            "modifiche": version.modifiche,
            "modificato_da": version.modificato_da,
            "created_at": version.created_at
        })
    
    return versions