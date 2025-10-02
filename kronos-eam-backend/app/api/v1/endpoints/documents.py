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
from app.data.document_templates import DOCUMENT_TEMPLATES
import json


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
        name=update_data.name,
        description=update_data.description,
        due_date=update_data.due_date,
        tags=update_data.tags,
        metadata=update_data.metadata,
        regulatory_references=update_data.regulatory_references,
        external_links=update_data.external_links,
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


@router.get("/templates", response_model=List[Dict[str, Any]])
async def get_document_templates(
    category: Optional[DocumentCategoryEnum] = None,
    current_user: User = Depends(deps.get_current_active_user)
):
    """Get available document templates with official URLs"""
    templates = DOCUMENT_TEMPLATES
    
    if category:
        templates = [t for t in templates if t.get("category") == category]
    
    # Enhance with download status
    for template in templates:
        template["has_official_url"] = bool(template.get("official_template_url"))
        template["download_sources"] = []
        
        if template.get("official_template_url"):
            template["download_sources"].append({
                "name": "Official Template",
                "url": template["official_template_url"],
                "type": "direct_download"
            })
        
        if template.get("portal_download_page"):
            template["download_sources"].append({
                "name": "Portal Page",
                "url": template["portal_download_page"],
                "type": "portal_page"
            })
        
        if template.get("alternate_sources"):
            for source in template["alternate_sources"]:
                template["download_sources"].append({
                    **source,
                    "type": "alternate"
                })
    
    return templates


@router.post("/templates/upload", response_model=DocumentResponse)
@audit_action("document_template", TipoModificaEnum.CREAZIONE)
async def upload_document_template(
    file: UploadFile = File(...),
    template_name: str = Query(...),
    template_category: DocumentCategoryEnum = Query(...),
    description: Optional[str] = Query(None),
    form_fields: Optional[str] = Query(None, description="JSON string of form fields"),
    task_associations: Optional[List[int]] = Query(None),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Upload a new document template with field mapping"""
    service = DocumentService(db)
    
    # Read file content
    content = await file.read()
    file_obj = BytesIO(content)
    file_obj.filename = file.filename
    
    # Parse form fields if provided
    parsed_fields = None
    if form_fields:
        try:
            parsed_fields = json.loads(form_fields)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid form_fields JSON")
    
    # Create document with template metadata
    document = service.create_document(
        name=template_name,
        file=file_obj,
        category=template_category,
        tenant_id=current_user.tenant_id,
        user_id=current_user.id,
        description=description,
        is_standard=True,
        tags=["template", "official"],
        metadata={
            "is_template": True,
            "form_fields": parsed_fields,
            "task_associations": task_associations or []
        }
    )
    
    return document


@router.get("/templates/search")
async def search_official_templates(
    query: str = Query(..., description="Search query for official templates"),
    entity: Optional[str] = Query(None, description="Filter by entity (DSO, GSE, Terna, etc)"),
    current_user: User = Depends(deps.get_current_active_user)
):
    """Search for official document templates online"""
    results = []
    
    # Known official sources to search
    official_sources = [
        {
            "entity": "DSO",
            "name": "E-Distribuzione",
            "search_url": "https://www.e-distribuzione.it/it-IT/Pagine/ricerca.aspx?k=",
            "base_url": "https://www.e-distribuzione.it",
            "common_templates": ["Modello Unico", "Regolamento Esercizio", "TICA"]
        },
        {
            "entity": "GSE",
            "name": "GSE - Gestore Servizi Energetici",
            "search_url": "https://www.gse.it/servizi-per-te/fotovoltaico/ritiro-dedicato/documenti",
            "base_url": "https://www.gse.it",
            "common_templates": ["RID", "SSP", "Antimafia", "Convenzione"]
        },
        {
            "entity": "Terna",
            "name": "Terna",
            "search_url": "https://www.terna.it/it/sistema-elettrico/gaudi",
            "base_url": "https://www.terna.it",
            "common_templates": ["GAUDÌ", "Anagrafica Impianti"]
        },
        {
            "entity": "ADM",
            "name": "Agenzia Dogane Monopoli",
            "search_url": "https://www.adm.gov.it/portale/lagenzia/dogane/operatore/accise/modulistica-accise",
            "base_url": "https://www.adm.gov.it",
            "common_templates": ["AD-1", "Dichiarazione Consumo", "Officina Elettrica"]
        }
    ]
    
    # Filter by entity if specified
    if entity:
        official_sources = [s for s in official_sources if s["entity"] == entity]
    
    # Build search results
    for source in official_sources:
        # Check if query matches common templates
        for template in source["common_templates"]:
            if query.lower() in template.lower():
                results.append({
                    "entity": source["entity"],
                    "entity_name": source["name"],
                    "template_name": template,
                    "search_url": f"{source['search_url']}{query}",
                    "base_url": source["base_url"],
                    "likely_available": True
                })
    
    # Add direct links from our template database
    for template in DOCUMENT_TEMPLATES:
        if query.lower() in template["name"].lower():
            if template.get("official_template_url"):
                results.append({
                    "entity": "Multiple",
                    "template_name": template["name"],
                    "direct_download": template["official_template_url"],
                    "portal_page": template.get("portal_download_page"),
                    "alternate_sources": template.get("alternate_sources", []),
                    "last_updated": template.get("last_updated"),
                    "version": template.get("version")
                })
    
    return {
        "query": query,
        "results": results,
        "total_found": len(results)
    }


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
    document.status = DocumentStatusEnum.ARCHIVIATO
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
                "Content-Disposition": f"attachment; filename={document.name}"
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
            "version": version.version,
            "changes": version.changes,
            "modified_by": version.modified_by,
            "created_at": version.created_at
        })
    
    return versions