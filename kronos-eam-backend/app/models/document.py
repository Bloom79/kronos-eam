"""
Document management models
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, JSON, ForeignKey, Text, Enum, Float
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class DocumentTypeEnum(str, enum.Enum):
    PDF = "PDF"
    DOC = "DOC"
    DOCX = "DOCX"
    XLS = "XLS"
    XLSX = "XLSX"
    IMG = "IMG"
    XML = "XML"
    P7M = "P7M"  # Signed documents


class DocumentCategoryEnum(str, enum.Enum):
    AUTORIZZATIVO = "Autorizzativo"
    TECNICO = "Tecnico"
    AMMINISTRATIVO = "Amministrativo"
    FISCALE = "Fiscale"
    CONTRATTUALE = "Contrattuale"
    OPERATIVO = "Operativo"


class DocumentStatusEnum(str, enum.Enum):
    VALIDO = "Valido"
    SCADUTO = "Scaduto"
    IN_ELABORAZIONE = "In Elaborazione"
    DA_APPROVARE = "Da Approvare"
    ARCHIVIATO = "Archiviato"


class Document(BaseModel):
    """Main document model"""
    __tablename__ = "documents"
    
    # Basic info
    nome = Column(String(255), nullable=False)
    descrizione = Column(Text)
    
    tipo = Column(Enum(DocumentTypeEnum), nullable=False)
    categoria = Column(Enum(DocumentCategoryEnum), nullable=False)
    stato = Column(Enum(DocumentStatusEnum), default=DocumentStatusEnum.VALIDO)
    
    # File info
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer)  # Bytes
    mime_type = Column(String(100))
    checksum = Column(String(64))  # SHA256
    
    # Associations
    impianto_id = Column(Integer, ForeignKey("plants.id"))
    workflow_id = Column(Integer, ForeignKey("workflows.id"))
    task_id = Column(Integer, ForeignKey("workflow_tasks.id"))
    
    # Metadata
    data_caricamento = Column(DateTime, default=datetime.utcnow)
    data_scadenza = Column(DateTime)
    data_ultima_modifica = Column(DateTime, default=datetime.utcnow)
    
    versione = Column(Integer, default=1)
    tags = Column(JSON, default=list)
    model_metadata = Column(JSON, default=dict)
    
    # Enhanced document support
    is_standard = Column(Boolean, default=False)
    riferimenti_normativi = Column(JSON, default=list)  # List of normative references
    link_esterni = Column(JSON, default=list)  # List of external links
    abilita_notifiche = Column(Boolean, default=True)
    
    # Security
    encrypted = Column(Boolean, default=False)
    signed = Column(Boolean, default=False)
    
    # AI Processing
    ai_processed = Column(Boolean, default=False)
    ai_extraction_id = Column(Integer, ForeignKey("document_extractions.id"))
    
    # Relationships
    plant = relationship("Plant", back_populates="documents")
    versions = relationship("DocumentVersion", back_populates="document", cascade="all, delete-orphan")
    copies = relationship("DocumentCopy", back_populates="documento_originale", cascade="all, delete-orphan")
    # extraction = relationship("DocumentExtraction", back_populates="document", uselist=False, foreign_keys=[ai_extraction_id])
    
    def __repr__(self):
        return f"<Document {self.nome}>"
    
    @property
    def dimensione(self):
        """Human readable file size"""
        if not self.file_size:
            return "0 B"
        
        for unit in ['B', 'KB', 'MB', 'GB']:
            if self.file_size < 1024.0:
                return f"{self.file_size:.1f} {unit}"
            self.file_size /= 1024.0
        
        return f"{self.file_size:.1f} TB"


class DocumentVersion(BaseModel):
    """Document version history"""
    __tablename__ = "document_versions"
    
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    versione = Column(Integer, nullable=False)
    
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer)
    checksum = Column(String(64))
    
    modifiche = Column(Text)
    modificato_da = Column(String(255))
    
    # Relationship
    document = relationship("Document", back_populates="versions")
    
    def __repr__(self):
        return f"<DocumentVersion {self.document_id} v{self.versione}>"


class DocumentExtraction(BaseModel):
    """AI extraction results for documents"""
    __tablename__ = "document_extractions"
    
    document_id = Column(Integer, ForeignKey("documents.id"), unique=True)
    
    # Processing status
    status = Column(String(50), default="pending")  # pending, processing, completed, error
    progress = Column(Integer, default=0)  # 0-100
    
    # Extraction results
    extracted_text = Column(Text)
    extracted_data = Column(JSON, default=dict)
    
    # Metadata
    confidence_score = Column(Float)
    extraction_model = Column(String(100))
    extraction_time = Column(Float)  # Seconds
    
    # Error handling
    error_message = Column(Text)
    retry_count = Column(Integer, default=0)
    
    # Timestamps
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    
    # Relationship
    # document = relationship("Document", back_populates="extraction", foreign_keys=[document_id])
    
    def __repr__(self):
        return f"<DocumentExtraction {self.document_id} - {self.status}>"


class DocumentCopy(BaseModel):
    """User-customized copy of standard document"""
    __tablename__ = "document_copies"
    
    # References
    documento_originale_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    utente_creazione_id = Column(Integer, ForeignKey("users.id"))
    
    # Customization
    nome_copia = Column(String(255))
    contenuto_customizzato = Column(Text)  # Modified content if applicable
    
    # Timestamps
    data_copia = Column(DateTime, default=datetime.utcnow)
    ultima_modifica_copia = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Metadata
    modifiche_applicate = Column(JSON, default=dict)  # Track what was changed
    note_personalizzazione = Column(Text)
    
    # Relationships
    documento_originale = relationship("Document", back_populates="copies")
    # utente_creazione = relationship("User")  # Will be set from User side to avoid circular imports
    
    def __repr__(self):
        return f"<DocumentCopy {self.nome_copia or f'Copy of {self.documento_originale_id}'}>"


class DocumentTemplate(BaseModel):
    """Templates for document generation"""
    __tablename__ = "document_templates"
    
    nome = Column(String(200), nullable=False)
    descrizione = Column(Text)
    categoria = Column(Enum(DocumentCategoryEnum))
    
    # Template content
    template_type = Column(String(50))  # docx, html, pdf
    template_path = Column(String(500))
    
    # Variables that can be filled
    variables = Column(JSON, default=dict)
    
    # Usage
    uso = Column(String(100))  # Contratto, Report, Dichiarazione, etc.
    attivo = Column(Boolean, default=True)
    
    # Relationships
    workflow_templates = relationship("WorkflowDocumentTemplate", back_populates="document_template")
    
    def __repr__(self):
        return f"<DocumentTemplate {self.nome}>"


class WorkflowDocumentTemplate(BaseModel):
    """Association between workflow templates and document templates"""
    __tablename__ = "workflow_document_templates"
    
    # References
    workflow_template_id = Column(Integer, ForeignKey("workflow_templates.id"), nullable=False)
    document_template_id = Column(Integer, ForeignKey("document_templates.id"), nullable=False)
    task_nome = Column(String(255))  # Optional: associate with specific task
    
    # Configuration
    is_required = Column(Boolean, default=True)
    ordine = Column(Integer, default=0)
    
    # Placeholders mapping
    placeholders = Column(JSON, default=dict)  # Maps template vars to workflow/plant data
    
    # Output settings
    output_formats = Column(JSON, default=list)  # ["pdf", "docx"]
    auto_generate = Column(Boolean, default=False)  # Generate automatically when task completes
    
    # Conditions
    condizioni = Column(JSON, default=dict)  # When this template should be used
    
    # Relationships
    workflow_template = relationship("WorkflowTemplate", back_populates="document_templates")
    document_template = relationship("DocumentTemplate", back_populates="workflow_templates")
    
    def __repr__(self):
        return f"<WorkflowDocumentTemplate workflow:{self.workflow_template_id} doc:{self.document_template_id}>"