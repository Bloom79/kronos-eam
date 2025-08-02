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
            "nome": "Attivazione Plant Fotovoltaico Standard",
            "descrizione": "Processo completo per l'attivazione di un impianto fotovoltaico standard con tutte le pratiche necessarie",
            "categoria": WorkflowCategoryEnum.ATTIVAZIONE,
            "workflow_purpose": WorkflowPurposeEnum.ACTIVATION_COMPLETE,
            "is_complete_workflow": True,
            "tipo_impianto": "Fotovoltaico",
            "potenza_minima": 0,
            "potenza_massima": 50,
            "durata_stimata_giorni": 180,
            "ricorrenza": "Una tantum",
            "enti_richiesti": ["DSO", "Terna", "GSE", "Comune"],
            "documenti_base": [
                "Documento identità titolare",
                "Visura camerale",
                "Titolo disponibilità sito",
                "Progetto definitivo impianto",
                "Schema unifilare"
            ],
            "stages": [
                {
                    "nome": "Connessione DSO",
                    "ordine": 1,
                    "durata_giorni": 60,
                    "tasks": [
                        {
                            "nome": "Richiesta preventivo TICA",
                            "descrizione": "Presentazione richiesta di connessione al DSO",
                            "responsabile": "Asset Manager",
                            "durata_giorni": 7,
                            "priorita": "Alta",
                            "ente_responsabile": "DSO",
                            "tipo_pratica": "TICA"
                        },
                        {
                            "nome": "Accettazione preventivo",
                            "descrizione": "Valutazione e accettazione del preventivo di connessione",
                            "responsabile": "Asset Manager",
                            "durata_giorni": 30,
                            "priorita": "Alta",
                            "ente_responsabile": "DSO"
                        }
                    ]
                },
                {
                    "nome": "Registrazione GAUDÌ",
                    "ordine": 2,
                    "durata_giorni": 30,
                    "tasks": [
                        {
                            "nome": "Registrazione impianto",
                            "descrizione": "Registrazione dell'impianto nel sistema GAUDÌ di Terna",
                            "responsabile": "Tecnico",
                            "durata_giorni": 7,
                            "priorita": "Media",
                            "ente_responsabile": "Terna",
                            "tipo_pratica": "GAUDÌ"
                        }
                    ]
                },
                {
                    "nome": "Convenzione GSE",
                    "ordine": 3,
                    "durata_giorni": 45,
                    "tasks": [
                        {
                            "nome": "Richiesta convenzione RID",
                            "descrizione": "Richiesta convenzione Ritiro Dedicato con GSE",
                            "responsabile": "Asset Manager",
                            "durata_giorni": 15,
                            "priorita": "Media",
                            "ente_responsabile": "GSE",
                            "tipo_pratica": "RID"
                        }
                    ]
                }
            ],
            "tasks": []  # Will be populated from stages
        },
        {
            "nome": "Dichiarazione Consumo Annuale",
            "descrizione": "Processo per la dichiarazione annuale dei consumi alle Dogane",
            "categoria": WorkflowCategoryEnum.FISCALE,
            "workflow_purpose": WorkflowPurposeEnum.RECURRING_COMPLIANCE,
            "is_complete_workflow": True,
            "tipo_impianto": "Tutti",
            "potenza_minima": 20,
            "potenza_massima": None,
            "durata_stimata_giorni": 30,
            "ricorrenza": "Annuale",
            "enti_richiesti": ["Dogane"],
            "documenti_base": [
                "Letture contatori",
                "Registro UTF",
                "Dichiarazione sostitutiva"
            ],
            "stages": [
                {
                    "nome": "Preparazione documenti",
                    "ordine": 1,
                    "durata_giorni": 14,
                    "tasks": [
                        {
                            "nome": "Raccolta letture contatori",
                            "descrizione": "Raccolta delle letture dei contatori di produzione e consumo",
                            "responsabile": "O&M Manager",
                            "durata_giorni": 7,
                            "priorita": "Alta",
                            "ente_responsabile": "Interno"
                        }
                    ]
                },
                {
                    "nome": "Invio dichiarazione",
                    "ordine": 2,
                    "durata_giorni": 7,
                    "tasks": [
                        {
                            "nome": "Compilazione e invio dichiarazione",
                            "descrizione": "Compilazione e invio telematico della dichiarazione",
                            "responsabile": "Amministrazione",
                            "durata_giorni": 3,
                            "priorita": "Alta",
                            "ente_responsabile": "Dogane",
                            "tipo_pratica": "Dichiarazione consumo"
                        }
                    ]
                }
            ],
            "tasks": []
        },
        {
            "nome": "Richiesta Incentivi FER",
            "descrizione": "Processo per la richiesta di incentivi per fonti rinnovabili",
            "categoria": WorkflowCategoryEnum.INCENTIVI,
            "workflow_purpose": WorkflowPurposeEnum.SPECIFIC_PROCESS,
            "is_complete_workflow": True,
            "tipo_impianto": "Fotovoltaico",
            "potenza_minima": 20,
            "potenza_massima": 1000,
            "durata_stimata_giorni": 90,
            "ricorrenza": "Una tantum",
            "enti_richiesti": ["GSE"],
            "documenti_base": [
                "Progetto definitivo",
                "Certificato antimafia",
                "Polizza fideiussoria",
                "Dichiarazione sostitutiva atto notorio"
            ],
            "stages": [
                {
                    "nome": "Preparazione documentazione",
                    "ordine": 1,
                    "durata_giorni": 30,
                    "tasks": [
                        {
                            "nome": "Raccolta documentazione tecnica",
                            "descrizione": "Preparazione di tutta la documentazione tecnica richiesta",
                            "responsabile": "Progettista",
                            "durata_giorni": 21,
                            "priorita": "Alta",
                            "ente_responsabile": "Interno"
                        }
                    ]
                },
                {
                    "nome": "Presentazione istanza",
                    "ordine": 2,
                    "durata_giorni": 60,
                    "tasks": [
                        {
                            "nome": "Caricamento documentazione portale GSE",
                            "descrizione": "Caricamento di tutta la documentazione sul portale GSE",
                            "responsabile": "Asset Manager",
                            "durata_giorni": 7,
                            "priorita": "Alta",
                            "ente_responsabile": "GSE",
                            "tipo_pratica": "FER"
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
            WorkflowTemplate.nome == template_data["nome"],
            WorkflowTemplate.tenant_id == tenant_id
        ).first()
        
        if existing:
            print(f"Template '{template_data['nome']}' already exists for tenant {tenant_id}")
            continue
        
        # Extract stages to populate tasks
        stages = template_data.pop("stages", [])
        all_tasks = []
        
        for stage in stages:
            stage_tasks = stage.get("tasks", [])
            for task in stage_tasks:
                task["stage_nome"] = stage["nome"]
                task["stage_ordine"] = stage["ordine"]
                all_tasks.append(task)
        
        # Create template without audit fields (they will be auto-set)
        template = WorkflowTemplate(
            tenant_id=tenant_id,
            nome=template_data["nome"],
            descrizione=template_data["descrizione"],
            categoria=template_data["categoria"],
            workflow_purpose=template_data["workflow_purpose"],
            is_complete_workflow=template_data["is_complete_workflow"],
            tipo_impianto=template_data["tipo_impianto"],
            potenza_minima=template_data["potenza_minima"],
            potenza_massima=template_data["potenza_massima"],
            durata_stimata_giorni=template_data["durata_stimata_giorni"],
            ricorrenza=template_data["ricorrenza"],
            enti_richiesti=template_data["enti_richiesti"],
            documenti_base=template_data["documenti_base"],
            stages=stages,
            tasks=all_tasks,
            attivo=True
        )
        
        db.add(template)
        print(f"Created template: {template_data['nome']}")
    
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