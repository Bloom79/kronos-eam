"""
Initialize document templates for workflows
"""

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.document import DocumentTemplate, WorkflowDocumentTemplate, DocumentTypeEnum, DocumentCategoryEnum
from app.models.workflow import WorkflowTemplate
from app.core.config import settings
import json


def init_document_templates():
    """Initialize document templates and associate them with workflows"""
    
    db = SessionLocal()
    
    try:
        # Find the connection request workflow template
        conn_workflow = db.query(WorkflowTemplate).filter(
            WorkflowTemplate.nome == "Domanda di Connessione E-Distribuzione"
        ).first()
        
        if not conn_workflow:
            print("❌ Connection request workflow template not found!")
            return
        
        # Check if document template already exists
        existing_template = db.query(DocumentTemplate).filter(
            DocumentTemplate.nome == "Richiesta Connessione E-Distribuzione"
        ).first()
        
        if existing_template:
            print("ℹ️ Document template already exists")
            doc_template = existing_template
        else:
            # Create document template
            doc_template = DocumentTemplate(
                nome="Richiesta Connessione E-Distribuzione",
                descrizione="Modulo per la richiesta di connessione alla rete E-Distribuzione",
                template_type="jinja2",
                categoria=DocumentCategoryEnum.AMMINISTRATIVO,
                template_path="documents/connection_request.jinja2",
                tenant_id=1,  # Demo tenant
                variables=json.dumps({
                    "richiedente.nome": "Nome richiedente",
                    "richiedente.cognome": "Cognome richiedente",
                    "richiedente.data_nascita": "Data di nascita",
                    "richiedente.luogo_nascita": "Luogo di nascita",
                    "richiedente.provincia_nascita": "Provincia di nascita",
                    "richiedente.indirizzo_residenza": "Indirizzo residenza",
                    "richiedente.comune_residenza": "Comune residenza",
                    "richiedente.provincia_residenza": "Provincia residenza",
                    "richiedente.email": "Email",
                    "richiedente.telefono": "Telefono",
                    "richiedente.iban": "IBAN",
                    "impianto.potenza_kw": "Potenza impianto (kW)",
                    "impianto.tipo": "Tipo impianto",
                    "impianto.comune": "Comune impianto",
                    "impianto.provincia": "Provincia impianto"
                }),
                attivo=True
            )
            db.add(doc_template)
            db.commit()
            print("✅ Created document template: Richiesta Connessione E-Distribuzione")
        
        # Check if association already exists
        existing_assoc = db.query(WorkflowDocumentTemplate).filter(
            WorkflowDocumentTemplate.workflow_template_id == conn_workflow.id,
            WorkflowDocumentTemplate.document_template_id == doc_template.id
        ).first()
        
        if existing_assoc:
            print("ℹ️ Workflow-document association already exists")
        else:
            # Associate document template with workflow template
            workflow_doc = WorkflowDocumentTemplate(
                workflow_template_id=conn_workflow.id,
                document_template_id=doc_template.id,
                task_nome="Preparazione documentazione",
                is_required=True,
                ordine=1,
                placeholders=json.dumps({
                    "genera_al_task": "Preparazione documentazione",
                    "formato_default": "pdf"
                }),
                output_formats=json.dumps(["pdf", "docx"]),
                auto_generate=False,
                condizioni=json.dumps({
                    "sempre": True
                }),
                tenant_id=1  # Demo tenant
            )
            db.add(workflow_doc)
            db.commit()
            print("✅ Associated document template with workflow")
        
        # Create additional templates for other phases
        
        # Template for acceptance
        acceptance_template = db.query(DocumentTemplate).filter(
            DocumentTemplate.nome == "Accettazione Preventivo E-Distribuzione"
        ).first()
        
        if not acceptance_template:
            acceptance_template = DocumentTemplate(
                nome="Accettazione Preventivo E-Distribuzione",
                descrizione="Modulo per l'accettazione del preventivo di connessione",
                template_type="jinja2",
                categoria=DocumentCategoryEnum.CONTRATTUALE,
                template_path="documents/accettazione_preventivo.jinja2",
                tenant_id=1,
                variables=json.dumps({
                    "numero_preventivo": "Numero preventivo",
                    "data_preventivo": "Data preventivo",
                    "importo_preventivo": "Importo preventivo",
                    "modalita_pagamento": "Modalità pagamento"
                }),
                attivo=True
            )
            db.add(acceptance_template)
            db.commit()
            print("✅ Created document template: Accettazione Preventivo E-Distribuzione")
        
        # Find the acceptance phase workflow
        acceptance_workflow = db.query(WorkflowTemplate).filter(
            WorkflowTemplate.nome == "Accettazione Preventivo E-Distribuzione"
        ).first()
        
        if acceptance_workflow and not db.query(WorkflowDocumentTemplate).filter(
            WorkflowDocumentTemplate.workflow_template_id == acceptance_workflow.id,
            WorkflowDocumentTemplate.document_template_id == acceptance_template.id
        ).first():
            workflow_doc2 = WorkflowDocumentTemplate(
                workflow_template_id=acceptance_workflow.id,
                document_template_id=acceptance_template.id,
                task_nome="Firma accettazione preventivo",
                is_required=True,
                ordine=1,
                placeholders=json.dumps({
                    "genera_al_task": "Firma accettazione preventivo"
                }),
                output_formats=json.dumps(["pdf", "docx"]),
                auto_generate=False,
                condizioni=json.dumps({
                    "dopo_ricezione_preventivo": True
                }),
                tenant_id=1
            )
            db.add(workflow_doc2)
            db.commit()
            print("✅ Associated acceptance template with workflow")
        
        print("\n✅ Document templates initialization complete!")
        
    except Exception as e:
        print(f"❌ Error initializing document templates: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_document_templates()