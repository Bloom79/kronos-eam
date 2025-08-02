"""
Simple initialization of workflow templates using raw SQL
"""

from sqlalchemy import text
from app.core.database import SessionLocal
import json


def init_templates():
    db = SessionLocal()
    
    try:
        # Check if templates already exist
        result = db.execute(text("SELECT COUNT(*) FROM workflow_templates WHERE tenant_id = 'demo'"))
        count = result.scalar()
        
        if count > 0:
            print(f"Already have {count} templates for demo tenant")
            return
        
        # Insert templates directly
        templates = [
            {
                "tenant_id": "demo",
                "nome": "Attivazione Plant Fotovoltaico Standard",
                "descrizione": "Processo completo per l'attivazione di un impianto fotovoltaico standard",
                "categoria": "Attivazione",
                "workflow_purpose": "Attivazione Completa",
                "is_complete_workflow": True,
                "tipo_impianto": "Fotovoltaico",
                "potenza_minima": 0,
                "potenza_massima": 50,
                "durata_stimata_giorni": 180,
                "ricorrenza": "Una tantum",
                "enti_richiesti": json.dumps(["DSO", "Terna", "GSE", "Comune"]),
                "documenti_base": json.dumps(["Documento identità titolare", "Visura camerale"]),
                "stages": json.dumps([{
                    "nome": "Connessione DSO",
                    "ordine": 1,
                    "durata_giorni": 60
                }]),
                "tasks": json.dumps([{
                    "nome": "Richiesta preventivo TICA",
                    "descrizione": "Presentazione richiesta di connessione al DSO",
                    "responsabile": "Asset Manager",
                    "durata_giorni": 7,
                    "priorita": "Alta"
                }]),
                "attivo": True
            },
            {
                "tenant_id": "demo",
                "nome": "Dichiarazione Consumo Annuale",
                "descrizione": "Processo per la dichiarazione annuale dei consumi alle Dogane",
                "categoria": "Fiscale",
                "workflow_purpose": "Compliance Ricorrente",
                "is_complete_workflow": True,
                "tipo_impianto": "Tutti",
                "potenza_minima": 20,
                "potenza_massima": None,
                "durata_stimata_giorni": 30,
                "ricorrenza": "Annuale",
                "enti_richiesti": json.dumps(["Dogane"]),
                "documenti_base": json.dumps(["Letture contatori", "Registro UTF"]),
                "stages": json.dumps([{
                    "nome": "Preparazione documenti",
                    "ordine": 1,
                    "durata_giorni": 14
                }]),
                "tasks": json.dumps([{
                    "nome": "Raccolta letture contatori",
                    "descrizione": "Raccolta delle letture dei contatori",
                    "responsabile": "O&M Manager",
                    "durata_giorni": 7,
                    "priorita": "Alta"
                }]),
                "attivo": True
            },
            {
                "tenant_id": "demo",
                "nome": "Richiesta Incentivi FER",
                "descrizione": "Processo per la richiesta di incentivi per fonti rinnovabili",
                "categoria": "Incentivi",
                "workflow_purpose": "Processo Specifico",
                "is_complete_workflow": True,
                "tipo_impianto": "Fotovoltaico",
                "potenza_minima": 20,
                "potenza_massima": 1000,
                "durata_stimata_giorni": 90,
                "ricorrenza": "Una tantum",
                "enti_richiesti": json.dumps(["GSE"]),
                "documenti_base": json.dumps(["Progetto definitivo", "Certificato antimafia"]),
                "stages": json.dumps([{
                    "nome": "Preparazione documentazione",
                    "ordine": 1,
                    "durata_giorni": 30
                }]),
                "tasks": json.dumps([{
                    "nome": "Raccolta documentazione tecnica",
                    "descrizione": "Preparazione documentazione tecnica",
                    "responsabile": "Progettista",
                    "durata_giorni": 21,
                    "priorita": "Alta"
                }]),
                "attivo": True
            }
        ]
        
        for template in templates:
            # Insert without audit fields
            query = text("""
                INSERT INTO workflow_templates (
                    tenant_id, nome, descrizione, categoria, workflow_purpose,
                    is_complete_workflow, tipo_impianto, potenza_minima, potenza_massima,
                    durata_stimata_giorni, ricorrenza, enti_richiesti, documenti_base,
                    stages, tasks, attivo, condizioni_attivazione, scadenza_config
                ) VALUES (
                    :tenant_id, :nome, :descrizione, :categoria, :workflow_purpose,
                    :is_complete_workflow, :tipo_impianto, :potenza_minima, :potenza_massima,
                    :durata_stimata_giorni, :ricorrenza, :enti_richiesti, :documenti_base,
                    :stages, :tasks, :attivo, '{}', '{}'
                )
            """)
            
            db.execute(query, template)
            print(f"Created template: {template['nome']}")
        
        db.commit()
        print("Successfully created demo templates")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_templates()