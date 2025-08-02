"""
Seed notification templates
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.notification import NotificationTemplate, NotificationTypeEnum, NotificationPriorityEnum


def create_notification_templates(db: Session):
    """Create default notification templates"""
    
    templates = [
        # Task notifications
        {
            "codice": "task_assigned",
            "nome": "Task Assegnato",
            "tipo": NotificationTypeEnum.TASK,
            "titolo_template": "Nuovo task assegnato: {{task_title}}",
            "messaggio_template": "Ti è stato assegnato il task '{{task_title}}' nel workflow '{{workflow_name}}' da {{assigned_by}}. Scadenza: {{due_date}}",
            "email_subject": "Kronos EAM - Nuovo task assegnato",
            "email_template": """
                <h3>Nuovo task assegnato</h3>
                <p>Ciao,</p>
                <p>Ti è stato assegnato un nuovo task:</p>
                <ul>
                    <li><strong>Task:</strong> {{task_title}}</li>
                    <li><strong>Workflow:</strong> {{workflow_name}}</li>
                    <li><strong>Assegnato da:</strong> {{assigned_by}}</li>
                    <li><strong>Scadenza:</strong> {{due_date}}</li>
                </ul>
                <p>Accedi a Kronos EAM per maggiori dettagli.</p>
            """,
            "variabili": ["task_title", "workflow_name", "assigned_by", "due_date"],
            "priorita_default": NotificationPriorityEnum.MEDIA,
            "canali_default": ["web", "email"]
        },
        {
            "codice": "task_deadline_urgent",
            "nome": "Scadenza Task Urgente",
            "tipo": NotificationTypeEnum.SCADENZA,
            "titolo_template": "⚠️ Task in scadenza domani: {{task_title}}",
            "messaggio_template": "Il task '{{task_title}}' del workflow '{{workflow_name}}' scade domani ({{due_date}}). Plant: {{impianto_name}}",
            "email_subject": "URGENTE - Task in scadenza domani",
            "variabili": ["task_title", "workflow_name", "due_date", "impianto_name"],
            "priorita_default": NotificationPriorityEnum.ALTA,
            "canali_default": ["web", "email", "push"]
        },
        {
            "codice": "task_deadline_reminder",
            "nome": "Promemoria Scadenza Task",
            "tipo": NotificationTypeEnum.SCADENZA,
            "titolo_template": "Promemoria: {{task_title}} scade tra {{days_remaining}} giorni",
            "messaggio_template": "Il task '{{task_title}}' del workflow '{{workflow_name}}' scade il {{due_date}} (tra {{days_remaining}} giorni).",
            "variabili": ["task_title", "workflow_name", "due_date", "days_remaining"],
            "priorita_default": NotificationPriorityEnum.MEDIA,
            "canali_default": ["web", "email"]
        },
        
        # Workflow notifications
        {
            "codice": "workflow_completed",
            "nome": "Workflow Completato",
            "tipo": NotificationTypeEnum.WORKFLOW,
            "titolo_template": "✅ Workflow completato: {{workflow_name}}",
            "messaggio_template": "Il workflow '{{workflow_name}}' per l'impianto '{{impianto_name}}' è stato completato con successo il {{completion_date}}.",
            "email_subject": "Workflow completato con successo",
            "variabili": ["workflow_name", "impianto_name", "completion_date"],
            "priorita_default": NotificationPriorityEnum.ALTA,
            "canali_default": ["web", "email"]
        },
        {
            "codice": "workflow_blocked",
            "nome": "Workflow Bloccato",
            "tipo": NotificationTypeEnum.WORKFLOW,
            "titolo_template": "⛔ Workflow bloccato: {{workflow_name}}",
            "messaggio_template": "Il workflow '{{workflow_name}}' è bloccato. Motivo: {{block_reason}}. È richiesto un intervento.",
            "variabili": ["workflow_name", "block_reason"],
            "priorita_default": NotificationPriorityEnum.ALTA,
            "canali_default": ["web", "email", "push"]
        },
        
        # Document notifications
        {
            "codice": "document_expiring",
            "nome": "Documento in Scadenza",
            "tipo": NotificationTypeEnum.DOCUMENTO,
            "titolo_template": "📄 Documento in scadenza: {{document_name}}",
            "messaggio_template": "Il documento '{{document_name}}' dell'impianto '{{impianto_name}}' scade il {{expiry_date}} (tra {{days_remaining}} giorni).",
            "email_subject": "Documento in scadenza - Azione richiesta",
            "variabili": ["document_name", "impianto_name", "expiry_date", "days_remaining"],
            "priorita_default": NotificationPriorityEnum.ALTA,
            "canali_default": ["web", "email"]
        },
        {
            "codice": "document_uploaded",
            "nome": "Documento Caricato",
            "tipo": NotificationTypeEnum.DOCUMENTO,
            "titolo_template": "Nuovo documento caricato: {{document_name}}",
            "messaggio_template": "È stato caricato il documento '{{document_name}}' per l'impianto '{{impianto_name}}' da {{uploaded_by}}.",
            "variabili": ["document_name", "impianto_name", "uploaded_by"],
            "priorita_default": NotificationPriorityEnum.BASSA,
            "canali_default": ["web"]
        },
        
        # System notifications
        {
            "codice": "system_maintenance",
            "nome": "Maintenance Sistema",
            "tipo": NotificationTypeEnum.SISTEMA,
            "titolo_template": "🔧 Maintenance programmata: {{maintenance_date}}",
            "messaggio_template": "È prevista una manutenzione del sistema il {{maintenance_date}} dalle {{start_time}} alle {{end_time}}. Il servizio potrebbe non essere disponibile.",
            "email_subject": "Maintenance programmata Kronos EAM",
            "variabili": ["maintenance_date", "start_time", "end_time"],
            "priorita_default": NotificationPriorityEnum.ALTA,
            "canali_default": ["web", "email"]
        },
        {
            "codice": "integration_error",
            "nome": "Errore Integrazione",
            "tipo": NotificationTypeEnum.INTEGRAZIONE,
            "titolo_template": "❌ Errore integrazione: {{integration_name}}",
            "messaggio_template": "Si è verificato un errore nell'integrazione con {{integration_name}}. Dettagli: {{error_details}}",
            "variabili": ["integration_name", "error_details"],
            "priorita_default": NotificationPriorityEnum.ALTA,
            "canali_default": ["web", "email", "push"]
        },
        
        # Maintenance notifications
        {
            "codice": "maintenance_scheduled",
            "nome": "Maintenance Programmata",
            "tipo": NotificationTypeEnum.MANUTENZIONE,
            "titolo_template": "🔧 Maintenance programmata: {{maintenance_type}}",
            "messaggio_template": "È stata programmata la manutenzione '{{maintenance_type}}' per l'impianto '{{impianto_name}}' il {{scheduled_date}}.",
            "variabili": ["maintenance_type", "impianto_name", "scheduled_date"],
            "priorita_default": NotificationPriorityEnum.MEDIA,
            "canali_default": ["web", "email"]
        },
        
        # Alert notifications
        {
            "codice": "compliance_alert",
            "nome": "Alert Conformità",
            "tipo": NotificationTypeEnum.ALERT,
            "titolo_template": "⚠️ Alert conformità: {{compliance_issue}}",
            "messaggio_template": "Rilevato problema di conformità: {{compliance_issue}} per l'impianto '{{impianto_name}}'. Azione richiesta entro {{deadline}}.",
            "variabili": ["compliance_issue", "impianto_name", "deadline"],
            "priorita_default": NotificationPriorityEnum.ALTA,
            "canali_default": ["web", "email", "push", "sms"]
        }
    ]
    
    for template_data in templates:
        # Check if template already exists
        existing = db.query(NotificationTemplate).filter(
            NotificationTemplate.codice == template_data["codice"]
        ).first()
        
        if not existing:
            template = NotificationTemplate(**template_data, tenant_id=1)  # Demo tenant
            db.add(template)
    
    db.commit()
    print(f"✅ Created {len(templates)} notification templates")


def main():
    """Run the seed script"""
    db = SessionLocal()
    try:
        create_notification_templates(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()