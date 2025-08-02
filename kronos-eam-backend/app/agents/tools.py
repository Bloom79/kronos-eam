"""
Tools for LangGraph agents
"""

from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from langchain_core.tools import tool
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from app.core.database import get_db
from app.models.plant import (
    Plant, 
    PlantPerformance,
    Maintenance,
    MaintenanceStatusEnum,
    ComplianceChecklist
)
from app.models.document import Document, DocumentStatusEnum
from app.models.workflow import Workflow, WorkflowTask, TaskStatusEnum
from app.rag.factory import VectorStoreFactory
from app.rag.embeddings import EmbeddingService
import logging
import asyncio

logger = logging.getLogger(__name__)

# Initialize services
vector_store = None
embedding_service = None

def get_vector_store():
    global vector_store
    if not vector_store:
        vector_store = VectorStoreFactory.get_default()
        # Initialize in background
        asyncio.create_task(vector_store.initialize())
    return vector_store

def get_embedding_service():
    global embedding_service
    if not embedding_service:
        embedding_service = EmbeddingService()
    return embedding_service


@tool
def get_plant_info(plant_id: int, tenant_id: str) -> Dict[str, Any]:
    """Get detailed information about a power plant"""
    try:
        db = next(get_db(tenant_id))
        
        plant = db.query(Plant).filter(
            Plant.id == plant_id,
            Plant.tenant_id == tenant_id
        ).first()
        
        if not plant:
            return {"error": "Plant not found"}
        
        return {
            "id": plant.id,
            "name": plant.name,
            "type": plant.type,
            "installed_power": plant.power_kw,
            "status": plant.status,
            "municipality": plant.municipality,
            "province": plant.province,
            "activation_date": None,  # Field not available in model
            "registry": {
                "censimp_code": plant.registry.censimp if plant.registry else None,
                "pod": plant.registry.pod if plant.registry else None,
                "connection_voltage": plant.registry.connection_voltage if plant.registry else None
            }
        }
    except Exception as e:
        logger.error(f"Error getting plant info: {e}")
        return {"error": str(e)}
    finally:
        db.close()


@tool  
def get_maintenance_schedule(impianto_id: int, tenant_id: str, days_ahead: int = 30) -> List[Dict[str, Any]]:
    """Get upcoming maintenance schedule for a power plant"""
    try:
        db = next(get_db(tenant_id))
        
        end_date = datetime.utcnow() + timedelta(days=days_ahead)
        
        manutenzioni = db.query(Maintenance).filter(
            Maintenance.impianto_id == impianto_id,
            Maintenance.data_pianificata <= end_date,
            Maintenance.stato.in_([MaintenanceStatusEnum.PLANNED, MaintenanceStatusEnum.IN_PROGRESS])
        ).order_by(Maintenance.data_pianificata).all()
        
        return [
            {
                "id": m.id,
                "tipo": m.tipo,
                "descrizione": m.descrizione,
                "data_pianificata": m.data_pianificata.isoformat(),
                "stato": m.stato
            }
            for m in manutenzioni
        ]
    except Exception as e:
        logger.error(f"Error getting maintenance schedule: {e}")
        return []
    finally:
        db.close()


@tool
def get_compliance_status(impianto_id: int, tenant_id: str) -> Dict[str, Any]:
    """Get compliance status for a power plant"""
    try:
        db = next(get_db(tenant_id))
        
        # Get latest checklist
        checklist = db.query(ChecklistConformita).filter(
            ChecklistConformita.impianto_id == impianto_id
        ).order_by(ChecklistConformita.created_at.desc()).first()
        
        if not checklist:
            return {"compliant": False, "score": 0, "issues": ["No compliance checklist found"]}
        
        # Count expiring documents
        expiring_docs = db.query(func.count(Document.id)).filter(
            Document.impianto_id == impianto_id,
            Document.stato == DocumentStatusEnum.VALIDO,
            Document.data_scadenza <= datetime.utcnow() + timedelta(days=30)
        ).scalar()
        
        issues = []
        if not checklist.autorizzazione_unica:
            issues.append("Missing Autorizzazione Unica")
        if not checklist.connessione_rete:
            issues.append("Missing grid connection agreement")
        if expiring_docs > 0:
            issues.append(f"{expiring_docs} documents expiring soon")
        
        return {
            "compliant": checklist.conforme,
            "score": checklist.punteggio_conformita,
            "last_check": checklist.ultima_verifica.isoformat() if checklist.ultima_verifica else None,
            "issues": issues
        }
    except Exception as e:
        logger.error(f"Error getting compliance status: {e}")
        return {"error": str(e)}
    finally:
        db.close()


@tool
def get_performance_metrics(impianto_id: int, tenant_id: str, period_days: int = 7) -> Dict[str, Any]:
    """Get performance metrics for a power plant"""
    try:
        db = next(get_db(tenant_id))
        
        start_date = datetime.utcnow() - timedelta(days=period_days)
        
        # Get performance data
        # Calculate year and month from start_date
        start_year = start_date.year
        start_month = start_date.month
        
        performance_data = db.query(
            func.avg(PlantPerformance.produzione_effettiva_kwh).label('avg_production'),
            func.sum(PlantPerformance.produzione_effettiva_kwh).label('total_production'),
            func.avg(PlantPerformance.performance_ratio).label('avg_efficiency'),
            func.count(PlantPerformance.id).label('data_points')
        ).filter(
            PlantPerformance.impianto_id == impianto_id,
            or_(
                PlantPerformance.anno > start_year,
                and_(
                    PlantPerformance.anno == start_year,
                    PlantPerformance.mese >= start_month
                )
            )
        ).first()
        
        # Get impianto capacity
        impianto = db.query(Plant).filter(Plant.id == impianto_id).first()
        capacity_factor = None
        if impianto and impianto.potenza_installata and performance_data.avg_production:
            # Calculate capacity factor
            theoretical_max = impianto.potenza_installata * 24 * period_days
            capacity_factor = (performance_data.total_production / theoretical_max) * 100
        
        return {
            "period_days": period_days,
            "average_daily_production_kwh": float(performance_data.avg_production or 0),
            "total_production_kwh": float(performance_data.total_production or 0),
            "average_efficiency": float(performance_data.avg_efficiency or 0),
            "capacity_factor": capacity_factor,
            "data_points": performance_data.data_points
        }
    except Exception as e:
        logger.error(f"Error getting performance metrics: {e}")
        return {"error": str(e)}
    finally:
        db.close()


@tool
def search_documents(query: str, tenant_id: str, impianto_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """Search for documents related to power plants"""
    try:
        db = next(get_db(tenant_id))
        
        # Build query
        q = db.query(Document).filter(
            Document.tenant_id == tenant_id
        )
        
        if impianto_id:
            q = q.filter(Document.impianto_id == impianto_id)
        
        # Search in nome and descrizione
        search_filter = or_(
            Document.nome.ilike(f"%{query}%"),
            Document.descrizione.ilike(f"%{query}%")
        )
        q = q.filter(search_filter)
        
        documents = q.limit(10).all()
        
        return [
            {
                "id": doc.id,
                "nome": doc.nome,
                "tipo": doc.tipo,
                "categoria": doc.categoria,
                "stato": doc.stato,
                "data_scadenza": doc.data_scadenza.isoformat() if doc.data_scadenza else None,
                "impianto_id": doc.impianto_id
            }
            for doc in documents
        ]
    except Exception as e:
        logger.error(f"Error searching documents: {e}")
        return []
    finally:
        db.close()


@tool
def get_active_workflows(tenant_id: str, impianto_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """Get active workflows"""
    try:
        db = next(get_db(tenant_id))
        
        q = db.query(Workflow).filter(
            Workflow.tenant_id == tenant_id,
            Workflow.stato_corrente.in_(["Attivo", "In Corso"])
        )
        
        if impianto_id:
            q = q.filter(Workflow.impianto_id == impianto_id)
        
        workflows = q.all()
        
        return [
            {
                "id": w.id,
                "nome": w.nome,
                "tipo": w.tipo,
                "stato": w.stato_corrente,
                "progresso": w.progresso,
                "data_scadenza": w.data_scadenza.isoformat() if w.data_scadenza else None,
                "impianto_nome": w.impiantoNome
            }
            for w in workflows
        ]
    except Exception as e:
        logger.error(f"Error getting workflows: {e}")
        return []
    finally:
        db.close()


@tool
def create_maintenance_task(
    impianto_id: int,
    tenant_id: str,
    tipo: str,
    descrizione: str,
    data_pianificata: str,
) -> Dict[str, Any]:
    """Create a new maintenance task"""
    try:
        db = next(get_db(tenant_id))
        
        # Verify impianto exists
        impianto = db.query(Plant).filter(
            Plant.id == impianto_id,
            Plant.tenant_id == tenant_id
        ).first()
        
        if not impianto:
            return {"error": "Plant not found"}
        
        # Create maintenance
        manutenzione = Maintenance(
            impianto_id=impianto_id,
            tenant_id=tenant_id,
            tipo=tipo,
            descrizione=descrizione,
            data_pianificata=datetime.fromisoformat(data_pianificata),
            stato=MaintenanceStatusEnum.PLANNED
        )
        
        db.add(manutenzione)
        db.commit()
        db.refresh(manutenzione)
        
        return {
            "success": True,
            "id": manutenzione.id,
            "message": f"Maintenance task created for {impianto.nome}"
        }
    except Exception as e:
        logger.error(f"Error creating maintenance task: {e}")
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()


@tool
def update_task_status(task_id: int, tenant_id: str, new_status: str, notes: Optional[str] = None) -> Dict[str, Any]:
    """Update the status of a workflow task"""
    try:
        db = next(get_db(tenant_id))
        
        # Get task with tenant check through workflow
        task = db.query(WorkflowTask).join(Workflow).filter(
            WorkflowTask.id == task_id,
            Workflow.tenant_id == tenant_id
        ).first()
        
        if not task:
            return {"error": "Task not found"}
        
        # Update status
        task.status = TaskStatusEnum[new_status.upper()]
        
        if task.status == TaskStatusEnum.COMPLETED:
            task.completato_data = datetime.utcnow()
        
        # Add comment if notes provided
        if notes:
            from app.models.workflow import TaskComment
            comment = TaskComment(
                task_id=task_id,
                user_id=1,  # System user
                testo=f"Status updated to {new_status}: {notes}",
                tenant_id=tenant_id
            )
            db.add(comment)
        
        db.commit()
        
        return {
            "success": True,
            "task_id": task_id,
            "new_status": new_status,
            "message": f"Task status updated to {new_status}"
        }
    except Exception as e:
        logger.error(f"Error updating task status: {e}")
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()