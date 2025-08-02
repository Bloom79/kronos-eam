"""
External integration models
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, JSON, Enum, Text, ForeignKey
from sqlalchemy.orm import relationship
import enum

from app.models.base import BaseModel


class IntegrationTypeEnum(str, enum.Enum):
    GSE = "GSE"
    TERNA = "Terna"
    DOGANE = "Dogane"
    DSO = "E-Distribuzione"
    PEC = "PEC"
    API = "API"
    EDI = "EDI"
    FTP = "FTP"


class IntegrationStatusEnum(str, enum.Enum):
    CONNESSO = "Connesso"
    DISCONNESSO = "Disconnesso"
    ERRORE = "Errore"
    IN_MANUTENZIONE = "In Maintenance"
    CONFIGURAZIONE = "In Configurazione"


class Integration(BaseModel):
    """External service integrations"""
    __tablename__ = "integrations"
    
    nome = Column(String(100), nullable=False)
    tipo = Column(Enum(IntegrationTypeEnum), nullable=False)
    stato = Column(Enum(IntegrationStatusEnum), default=IntegrationStatusEnum.DISCONNESSO)
    
    # Connection details
    tipoConnessione = Column(String(50))  # API, RPA, EDI, PEC
    endpoint = Column(String(500))
    configurazione = Column(JSON, default=dict)
    
    # Status
    ultimaSincronizzazione = Column(DateTime)
    prossimaSincronizzazione = Column(DateTime)
    
    # Metrics
    messaggiInCoda = Column(Integer, default=0)
    messaggiProcessati = Column(Integer, default=0)
    errori = Column(Integer, default=0)
    ultimoErrore = Column(Text)
    
    # Scheduling
    abilitato = Column(Boolean, default=True)
    scheduleConfig = Column(JSON, default=dict)  # Cron expression or interval
    
    # Relationships
    logs = relationship("IntegrationLog", back_populates="integration", cascade="all, delete-orphan")
    credentials = relationship("IntegrationCredential", back_populates="integration", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Integration {self.nome} - {self.stato}>"


class IntegrationLog(BaseModel):
    """Integration activity logs"""
    __tablename__ = "integration_logs"
    
    integration_id = Column(Integer, ForeignKey("integrations.id"), nullable=False)
    
    # Log details
    tipo = Column(String(50))  # sync, error, warning, info
    azione = Column(String(100))  # login, download, upload, process
    
    messaggio = Column(Text)
    dettagli = Column(JSON, default=dict)
    
    # Metrics
    durata_ms = Column(Integer)  # Duration in milliseconds
    record_processati = Column(Integer)
    record_errori = Column(Integer)
    
    # Status
    successo = Column(Boolean, default=True)
    errore = Column(Text)
    
    # Timestamps handled by BaseModel
    
    # Relationship
    integration = relationship("Integration", back_populates="logs")
    
    def __repr__(self):
        return f"<IntegrationLog {self.integration_id} - {self.tipo}>"


class IntegrationCredential(BaseModel):
    """Secure credential storage for integrations"""
    __tablename__ = "integration_credentials"
    
    integration_id = Column(Integer, ForeignKey("integrations.id"), nullable=False)
    
    # Credential info
    nome = Column(String(100), nullable=False)
    tipo = Column(String(50))  # username_password, certificate, api_key, oauth
    
    # Encrypted storage
    valore_criptato = Column(Text, nullable=False)
    
    # Validity
    valido_dal = Column(DateTime, default=datetime.utcnow)
    valido_fino = Column(DateTime)
    
    # Metadata
    model_metadata = Column(JSON, default=dict)
    
    # Relationship
    integration = relationship("Integration", back_populates="credentials")
    
    def __repr__(self):
        return f"<IntegrationCredential {self.nome}>"


class IntegrationMapping(BaseModel):
    """Field mappings for data synchronization"""
    __tablename__ = "integration_mappings"
    
    integration_id = Column(Integer, ForeignKey("integrations.id"), nullable=False)
    
    # Mapping details
    entita = Column(String(50))  # impianto, documento, workflow
    
    # Field mappings
    campi_origine = Column(JSON, nullable=False)  # External field names
    campi_destinazione = Column(JSON, nullable=False)  # Internal field names
    trasformazioni = Column(JSON, default=dict)  # Transformation rules
    
    # Validation
    validazioni = Column(JSON, default=dict)
    
    attivo = Column(Boolean, default=True)
    
    def __repr__(self):
        return f"<IntegrationMapping {self.integration_id} - {self.entita}>"


class EDIMessage(BaseModel):
    """EDI message tracking"""
    __tablename__ = "edi_messages"
    
    integration_id = Column(Integer, ForeignKey("integrations.id"), nullable=False)
    
    # Message details
    tipo_messaggio = Column(String(50))  # ORDERS, INVOIC, DESADV
    numero_messaggio = Column(String(100), unique=True)
    
    direzione = Column(String(10))  # IN, OUT
    
    # Content
    contenuto = Column(Text)
    formato = Column(String(20))  # EDIFACT, XML, X12
    
    # Status
    stato = Column(String(50))  # pending, sent, received, processed, error
    data_invio = Column(DateTime)
    data_ricezione = Column(DateTime)
    data_elaborazione = Column(DateTime)
    
    # Error handling
    errore = Column(Text)
    tentativi = Column(Integer, default=0)
    
    # References
    riferimento_interno = Column(String(100))  # Order ID, Invoice ID, etc.
    
    def __repr__(self):
        return f"<EDIMessage {self.numero_messaggio} - {self.stato}>"