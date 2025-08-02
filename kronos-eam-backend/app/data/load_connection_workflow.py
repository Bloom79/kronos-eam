"""
Load connection request workflow templates into the database
"""

from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.workflow import WorkflowTemplate, WorkflowCategoryEnum, WorkflowPhaseEnum
from sqlalchemy import text
from app.data.connection_request_workflow import CONNECTION_REQUEST_WORKFLOW
from app.data.phase_based_templates import CONNESSIONE_EDIST_FASE1, CONNESSIONE_EDIST_FASE2
import json


def load_connection_templates():
    """Load connection request workflow templates"""
    
    db = SessionLocal()
    
    try:
        # Check if templates already exist
        existing = db.query(WorkflowTemplate).filter(
            WorkflowTemplate.nome.in_([
                "Domanda di Connessione E-Distribuzione",
                "Accettazione Preventivo E-Distribuzione"
            ])
        ).all()
        
        if existing:
            print(f"ℹ️ Found {len(existing)} existing connection templates")
            for t in existing:
                print(f"  - {t.nome}")
        
        # Load FASE 1 template
        fase1_exists = db.query(WorkflowTemplate).filter(
            WorkflowTemplate.nome == "Domanda di Connessione E-Distribuzione"
        ).first()
        
        if not fase1_exists:
            # Extract tasks from stages for phase templates
            fase1_tasks = []
            for stage in CONNESSIONE_EDIST_FASE1["stages"]:
                if "tasks" in stage:
                    fase1_tasks.extend(stage["tasks"])
            
            # Use raw SQL to bypass enum conversion issue
            db.execute(text("""
                INSERT INTO workflow_templates (
                    nome, descrizione, categoria, phase, tipo_impianto,
                    potenza_minima, potenza_massima, durata_stimata_giorni,
                    ricorrenza, stages, tasks, enti_richiesti, documenti_base,
                    condizioni_attivazione, scadenza_config, attivo, tenant_id
                ) VALUES (
                    :nome, :descrizione, :categoria, :phase, :tipo_impianto,
                    :potenza_minima, :potenza_massima, :durata_stimata_giorni,
                    :ricorrenza, :stages, :tasks, :enti_richiesti, :documenti_base,
                    :condizioni_attivazione, :scadenza_config, :attivo, :tenant_id
                )
            """), {
                'nome': CONNESSIONE_EDIST_FASE1["nome"],
                'descrizione': CONNESSIONE_EDIST_FASE1["descrizione"],
                'categoria': 'Attivazione',
                'phase': 'Connessione',
                'tipo_impianto': 'Tutti',
                'potenza_minima': 0,
                'potenza_massima': None,
                'durata_stimata_giorni': CONNESSIONE_EDIST_FASE1["durata_stimata_giorni"],
                'ricorrenza': 'Una tantum',
                'stages': json.dumps(CONNESSIONE_EDIST_FASE1["stages"]),
                'tasks': json.dumps(fase1_tasks),
                'enti_richiesti': json.dumps(CONNESSIONE_EDIST_FASE1["enti_richiesti"]),
                'documenti_base': json.dumps(CONNESSIONE_EDIST_FASE1["documenti_base"]),
                'condizioni_attivazione': json.dumps({}),
                'scadenza_config': json.dumps({}),
                'attivo': True,
                'tenant_id': 1
            })
            db.commit()
            print("✅ Created workflow template: Domanda di Connessione E-Distribuzione")
        
        # Load FASE 2 template
        fase2_exists = db.query(WorkflowTemplate).filter(
            WorkflowTemplate.nome == "Accettazione Preventivo E-Distribuzione"
        ).first()
        
        if not fase2_exists:
            # Extract tasks from stages for phase templates
            fase2_tasks = []
            for stage in CONNESSIONE_EDIST_FASE2["stages"]:
                if "tasks" in stage:
                    fase2_tasks.extend(stage["tasks"])
            
            # Use raw SQL to bypass enum conversion issue
            db.execute(text("""
                INSERT INTO workflow_templates (
                    nome, descrizione, categoria, phase, tipo_impianto,
                    potenza_minima, potenza_massima, durata_stimata_giorni,
                    ricorrenza, stages, tasks, enti_richiesti, documenti_base,
                    condizioni_attivazione, scadenza_config, attivo, tenant_id
                ) VALUES (
                    :nome, :descrizione, :categoria, :phase, :tipo_impianto,
                    :potenza_minima, :potenza_massima, :durata_stimata_giorni,
                    :ricorrenza, :stages, :tasks, :enti_richiesti, :documenti_base,
                    :condizioni_attivazione, :scadenza_config, :attivo, :tenant_id
                )
            """), {
                'nome': CONNESSIONE_EDIST_FASE2["nome"],
                'descrizione': CONNESSIONE_EDIST_FASE2["descrizione"],
                'categoria': 'Attivazione',
                'phase': 'Connessione',
                'tipo_impianto': 'Tutti',
                'potenza_minima': 0,
                'potenza_massima': None,
                'durata_stimata_giorni': CONNESSIONE_EDIST_FASE2["durata_stimata_giorni"],
                'ricorrenza': 'Una tantum',
                'stages': json.dumps(CONNESSIONE_EDIST_FASE2["stages"]),
                'tasks': json.dumps(fase2_tasks),
                'enti_richiesti': json.dumps(CONNESSIONE_EDIST_FASE2["enti_richiesti"]),
                'documenti_base': json.dumps(CONNESSIONE_EDIST_FASE2["documenti_base"]),
                'condizioni_attivazione': json.dumps({}),
                'scadenza_config': json.dumps({}),
                'attivo': True,
                'tenant_id': 1
            })
            db.commit()
            print("✅ Created workflow template: Accettazione Preventivo E-Distribuzione")
        
        # Also load the complete connection workflow
        complete_exists = db.query(WorkflowTemplate).filter(
            WorkflowTemplate.nome == "Richiesta Connessione E-Distribuzione"
        ).first()
        
        if not complete_exists:
            # Extract tasks from stages for complete workflow
            complete_tasks = []
            for stage in CONNECTION_REQUEST_WORKFLOW["stages"]:
                if "tasks" in stage:
                    complete_tasks.extend(stage["tasks"])
            
            # Use raw SQL to bypass enum conversion issue
            db.execute(text("""
                INSERT INTO workflow_templates (
                    nome, descrizione, categoria, phase, tipo_impianto,
                    potenza_minima, potenza_massima, durata_stimata_giorni,
                    ricorrenza, stages, tasks, enti_richiesti, documenti_base,
                    condizioni_attivazione, scadenza_config, attivo, tenant_id
                ) VALUES (
                    :nome, :descrizione, :categoria, :phase, :tipo_impianto,
                    :potenza_minima, :potenza_massima, :durata_stimata_giorni,
                    :ricorrenza, :stages, :tasks, :enti_richiesti, :documenti_base,
                    :condizioni_attivazione, :scadenza_config, :attivo, :tenant_id
                )
            """), {
                'nome': CONNECTION_REQUEST_WORKFLOW["nome"],
                'descrizione': CONNECTION_REQUEST_WORKFLOW["descrizione"],
                'categoria': 'Attivazione',
                'phase': None,
                'tipo_impianto': 'Tutti',
                'potenza_minima': 0,
                'potenza_massima': None,
                'durata_stimata_giorni': CONNECTION_REQUEST_WORKFLOW["durata_stimata_giorni"],
                'ricorrenza': 'Una tantum',
                'stages': json.dumps(CONNECTION_REQUEST_WORKFLOW["stages"]),
                'tasks': json.dumps(complete_tasks),
                'enti_richiesti': json.dumps(CONNECTION_REQUEST_WORKFLOW["enti_richiesti"]),
                'documenti_base': json.dumps(CONNECTION_REQUEST_WORKFLOW["documenti_base"]),
                'condizioni_attivazione': json.dumps({}),
                'scadenza_config': json.dumps({}),
                'attivo': True,
                'tenant_id': 1
            })
            db.commit()
            print("✅ Created workflow template: Richiesta Connessione E-Distribuzione (Complete)")
        
        print("\n✅ Connection workflow templates loaded successfully!")
        
    except Exception as e:
        print(f"❌ Error loading connection templates: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    load_connection_templates()