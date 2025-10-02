"""
Initialize workflow templates for demo tenant
"""

from datetime import datetime
from sqlalchemy.orm import Session
from app.models.workflow import WorkflowTemplate, WorkflowCategoryEnum, WorkflowPhaseEnum, WorkflowPurposeEnum
from app.core.database import SessionLocal
import json


def create_demo_templates(db: Session, tenant_id: str = "demo"):
    """Create demo workflow templates"""
    
    templates = [
        {
            "name": "Installazione Completa Impianto Fotovoltaico",
            "description": "Processo completo dall'analisi iniziale all'attivazione finale, conforme alle normative italiane 2025",
            "category": WorkflowCategoryEnum.ACTIVATION,
            "workflow_purpose": WorkflowPurposeEnum.COMPLETE_ACTIVATION,
            "is_complete_workflow": True,
            "plant_type": "Fotovoltaico",
            "min_power": 0,
            "max_power": 50,
            "estimated_duration_days": 180,
            "recurrence": "Una tantum",
            "required_entities": ["DSO", "Terna", "GSE", "Comune"],
            "base_documents": [
                "Documento identità titolare",
                "Visura camerale",
                "Titolo disponibilità sito",
                "Progetto definitivo impianto",
                "Schema unifilare"
            ],
            "stages": [
                {
                    "name": "Connessione DSO",
                    "order": 1,
                    "duration_days": 60,
                    "tasks": [
                        {
                            "name": "Richiesta preventivo TICA",
                            "description": "Presentazione richiesta di connessione al DSO",
                            "assignee": "Asset Manager",
                            "duration_days": 7,
                            "priority": "Alta",
                            "responsible_entity": "DSO",
                            "practice_type": "TICA"
                        },
                        {
                            "name": "Accettazione preventivo",
                            "description": "Valutazione e accettazione del preventivo di connessione",
                            "assignee": "Asset Manager",
                            "duration_days": 30,
                            "priority": "Alta",
                            "responsible_entity": "DSO"
                        }
                    ]
                },
                {
                    "name": "Registrazione GAUDÌ",
                    "order": 2,
                    "duration_days": 30,
                    "tasks": [
                        {
                            "name": "Registrazione impianto",
                            "description": "Registrazione dell'impianto nel sistema GAUDÌ di Terna",
                            "assignee": "Tecnico",
                            "duration_days": 7,
                            "priority": "Media",
                            "responsible_entity": "Terna",
                            "practice_type": "GAUDÌ"
                        }
                    ]
                },
                {
                    "name": "Convenzione GSE",
                    "order": 3,
                    "duration_days": 45,
                    "tasks": [
                        {
                            "name": "Richiesta convenzione RID",
                            "description": "Richiesta convenzione Ritiro Dedicato con GSE",
                            "assignee": "Asset Manager",
                            "duration_days": 15,
                            "priority": "Media",
                            "responsible_entity": "GSE",
                            "practice_type": "RID"
                        }
                    ]
                }
            ],
            "tasks": []  # Will be populated from stages
        },
        {
            "name": "Dichiarazione Consumo Annuale",
            "description": "Processo per la dichiarazione annuale dei consumi alle Dogane",
            "category": WorkflowCategoryEnum.FISCAL,
            "workflow_purpose": WorkflowPurposeEnum.RECURRING_COMPLIANCE,
            "is_complete_workflow": True,
            "plant_type": "Tutti",
            "min_power": 20,
            "max_power": None,
            "estimated_duration_days": 30,
            "recurrence": "Annuale",
            "required_entities": ["Dogane"],
            "base_documents": [
                "Letture contatori",
                "Registro UTF",
                "Dichiarazione sostitutiva"
            ],
            "stages": [
                {
                    "name": "Preparazione documenti",
                    "order": 1,
                    "duration_days": 14,
                    "tasks": [
                        {
                            "name": "Raccolta letture contatori",
                            "description": "Raccolta delle letture dei contatori di produzione e consumo",
                            "assignee": "O&M Manager",
                            "duration_days": 7,
                            "priority": "Alta",
                            "responsible_entity": "Interno"
                        }
                    ]
                },
                {
                    "name": "Invio dichiarazione",
                    "order": 2,
                    "duration_days": 7,
                    "tasks": [
                        {
                            "name": "Compilazione e invio dichiarazione",
                            "description": "Compilazione e invio telematico della dichiarazione",
                            "assignee": "Amministrazione",
                            "duration_days": 3,
                            "priority": "Alta",
                            "responsible_entity": "Dogane",
                            "practice_type": "Dichiarazione consumo"
                        }
                    ]
                }
            ],
            "tasks": []
        },
        {
            "name": "Richiesta Incentivi FER",
            "description": "Processo per la richiesta di incentivi per fonti rinnovabili",
            "category": WorkflowCategoryEnum.INCENTIVES,
            "workflow_purpose": WorkflowPurposeEnum.SPECIFIC_PROCESS,
            "is_complete_workflow": True,
            "plant_type": "Fotovoltaico",
            "min_power": 20,
            "max_power": 1000,
            "estimated_duration_days": 90,
            "recurrence": "Una tantum",
            "required_entities": ["GSE"],
            "base_documents": [
                "Progetto definitivo",
                "Certificato antimafia",
                "Polizza fideiussoria",
                "Dichiarazione sostitutiva atto notorio"
            ],
            "stages": [
                {
                    "name": "Preparazione documentazione",
                    "order": 1,
                    "duration_days": 30,
                    "tasks": [
                        {
                            "name": "Raccolta documentazione tecnica",
                            "description": "Preparazione di tutta la documentazione tecnica richiesta",
                            "assignee": "Progettista",
                            "duration_days": 21,
                            "priority": "Alta",
                            "responsible_entity": "Interno"
                        }
                    ]
                },
                {
                    "name": "Presentazione istanza",
                    "order": 2,
                    "duration_days": 60,
                    "tasks": [
                        {
                            "name": "Caricamento documentazione portale GSE",
                            "description": "Caricamento di tutta la documentazione sul portale GSE",
                            "assignee": "Asset Manager",
                            "duration_days": 7,
                            "priority": "Alta",
                            "responsible_entity": "GSE",
                            "practice_type": "FER"
                        }
                    ]
                }
            ],
            "tasks": []
        }
    ]
    
    # Create templates
    for template_data in templates:
        # Check if template already exists
        existing = db.query(WorkflowTemplate).filter(
            WorkflowTemplate.name == template_data["name"],
            WorkflowTemplate.tenant_id == tenant_id
        ).first()
        
        if existing:
            print(f"Template '{template_data['name']}' already exists for tenant {tenant_id}")
            continue
        
        # Extract stages to populate tasks
        stages = template_data.pop("stages", [])
        all_tasks = []
        
        for stage in stages:
            stage_tasks = stage.get("tasks", [])
            for task in stage_tasks:
                task["stage_name"] = stage["name"]
                task["stage_order"] = stage["order"]
                all_tasks.append(task)
        
        # Create template without audit fields (they will be auto-set)
        template = WorkflowTemplate(
            tenant_id=tenant_id,
            name=template_data["name"],
            description=template_data["description"],
            category=template_data["category"],
            workflow_purpose=template_data["workflow_purpose"],
            is_complete_workflow=template_data["is_complete_workflow"],
            plant_type=template_data["plant_type"],
            min_power=template_data["min_power"],
            max_power=template_data["max_power"],
            estimated_duration_days=template_data["estimated_duration_days"],
            recurrence=template_data["recurrence"],
            required_entities=template_data["required_entities"],
            base_documents=template_data["base_documents"],
            stages=stages,
            tasks=all_tasks,
            active=True
        )
        
        db.add(template)
        print(f"Created template: {template_data['name']}")
    
    db.commit()
    print(f"Successfully initialized workflow templates for tenant {tenant_id}")


def main():
    """Main function to run the initialization"""
    db = SessionLocal()
    try:
        create_demo_templates(db)
    except Exception as e:
        print(f"Error initializing templates: {str(e)}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()