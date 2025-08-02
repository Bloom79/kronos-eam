"""
Comprehensive notification service for multi-channel delivery
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import asyncio
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
import json

from app.models.notification import (
    Notification, NotificationPreference, NotificationTemplate,
    NotificationQueue, NotificationTypeEnum, NotificationPriorityEnum,
    NotificationChannelEnum
)
from app.models.user import User
from app.models.workflow import Workflow, WorkflowTask
from app.models.document import Document
from app.models.plant import Plant
from app.core.config import settings
from app.core.websocket import manager as ws_manager


logger = logging.getLogger(__name__)


class NotificationService:
    """Service for managing notifications across multiple channels"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def send_notification(
        self,
        user_id: int,
        tipo: NotificationTypeEnum,
        titolo: str,
        messaggio: str,
        tenant_id: int,
        priorita: NotificationPriorityEnum = NotificationPriorityEnum.MEDIA,
        impianto_id: Optional[int] = None,
        workflow_id: Optional[int] = None,
        documento_id: Optional[int] = None,
        link: Optional[str] = None,
        azione: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        force_channels: Optional[List[NotificationChannelEnum]] = None
    ) -> Notification:
        """
        Send a notification to a user across configured channels
        
        Args:
            user_id: Recipient user ID
            tipo: Notification type
            titolo: Notification title
            messaggio: Notification message
            tenant_id: Tenant ID
            priorita: Notification priority
            impianto_id: Related plant ID
            workflow_id: Related workflow ID
            documento_id: Related document ID
            link: Action link
            azione: Action identifier
            metadata: Additional metadata
            force_channels: Override user preferences for channels
            
        Returns:
            Created notification
        """
        # Get user preferences
        preferences = self.get_user_preferences(user_id)
        
        # Determine channels to use
        channels = force_channels or self._get_enabled_channels(preferences, tipo, priorita)
        
        # Create notification
        notification = Notification(
            user_id=user_id,
            tenant_id=tenant_id,
            tipo=tipo,
            titolo=titolo,
            messaggio=messaggio,
            priorita=priorita,
            impianto_id=impianto_id,
            workflow_id=workflow_id,
            documento_id=documento_id,
            link=link,
            azione=azione,
            canali=channels,
            model_metadata=metadata or {}
        )
        
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        
        # Queue for delivery
        await self._queue_notification(notification, channels)
        
        # Send immediate web notification
        if NotificationChannelEnum.WEB in channels:
            await self._send_web_notification(notification)
        
        return notification
    
    async def send_from_template(
        self,
        template_code: str,
        user_id: int,
        tenant_id: int,
        variables: Dict[str, Any],
        **kwargs
    ) -> Optional[Notification]:
        """
        Send notification using a template
        
        Args:
            template_code: Template identifier
            user_id: Recipient user ID
            tenant_id: Tenant ID
            variables: Variables to replace in template
            **kwargs: Additional notification parameters
            
        Returns:
            Created notification or None if template not found
        """
        template = self.db.query(NotificationTemplate).filter(
            NotificationTemplate.codice == template_code,
            NotificationTemplate.attivo == True
        ).first()
        
        if not template:
            logger.warning(f"Notification template {template_code} not found")
            return None
        
        # Process template
        titolo = self._process_template(template.titolo_template, variables)
        messaggio = self._process_template(template.messaggio_template, variables)
        
        # Merge template defaults with provided kwargs
        notification_params = {
            "tipo": template.tipo,
            "priorita": template.priorita_default,
            "force_channels": template.canali_default
        }
        notification_params.update(kwargs)
        
        return await self.send_notification(
            user_id=user_id,
            titolo=titolo,
            messaggio=messaggio,
            tenant_id=tenant_id,
            **notification_params
        )
    
    def get_user_preferences(self, user_id: int) -> NotificationPreference:
        """Get or create user notification preferences"""
        preferences = self.db.query(NotificationPreference).filter(
            NotificationPreference.user_id == user_id
        ).first()
        
        if not preferences:
            # Create default preferences
            preferences = NotificationPreference(
                user_id=user_id,
                tenant_id=self.db.query(User).filter(User.id == user_id).first().tenant_id
            )
            self.db.add(preferences)
            self.db.commit()
            self.db.refresh(preferences)
        
        return preferences
    
    def update_preferences(
        self,
        user_id: int,
        preferences_data: Dict[str, Any]
    ) -> NotificationPreference:
        """Update user notification preferences"""
        preferences = self.get_user_preferences(user_id)
        
        for key, value in preferences_data.items():
            if hasattr(preferences, key):
                setattr(preferences, key, value)
        
        self.db.commit()
        self.db.refresh(preferences)
        
        return preferences
    
    def get_unread_notifications(
        self,
        user_id: int,
        tenant_id: int,
        limit: int = 50,
        offset: int = 0
    ) -> List[Notification]:
        """Get unread notifications for a user"""
        return self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.tenant_id == tenant_id,
            Notification.letta == False
        ).order_by(
            Notification.created_at.desc()
        ).offset(offset).limit(limit).all()
    
    def mark_as_read(
        self,
        notification_id: int,
        user_id: int,
        tenant_id: int
    ) -> bool:
        """Mark a notification as read"""
        notification = self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id,
            Notification.tenant_id == tenant_id
        ).first()
        
        if notification:
            notification.letta = True
            notification.data_lettura = datetime.utcnow()
            self.db.commit()
            return True
        
        return False
    
    def mark_all_as_read(self, user_id: int, tenant_id: int) -> int:
        """Mark all notifications as read for a user"""
        count = self.db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.tenant_id == tenant_id,
            Notification.letta == False
        ).update({
            "letta": True,
            "data_lettura": datetime.utcnow()
        })
        
        self.db.commit()
        return count
    
    async def send_deadline_reminders(self, tenant_id: int):
        """Send reminders for upcoming deadlines"""
        # Find tasks with upcoming due dates
        tomorrow = datetime.utcnow() + timedelta(days=1)
        week_ahead = datetime.utcnow() + timedelta(days=7)
        
        # Tasks due tomorrow
        urgent_tasks = self.db.query(WorkflowTask).join(
            Workflow
        ).filter(
            Workflow.tenant_id == tenant_id,
            WorkflowTask.dueDate >= datetime.utcnow(),
            WorkflowTask.dueDate <= tomorrow,
            WorkflowTask.status != "Completato"
        ).all()
        
        for task in urgent_tasks:
            if task.assignee:
                user = self.db.query(User).filter(
                    User.email == task.assignee,
                    User.tenant_id == tenant_id
                ).first()
                
                if user:
                    await self.send_from_template(
                        "task_deadline_urgent",
                        user_id=user.id,
                        tenant_id=tenant_id,
                        variables={
                            "task_title": task.title,
                            "workflow_name": task.workflow.nome,
                            "due_date": task.dueDate.strftime("%d/%m/%Y %H:%M"),
                            "impianto_name": task.workflow.impianto.nome if task.workflow.impianto else ""
                        },
                        workflow_id=task.workflow_id,
                        priorita=NotificationPriorityEnum.ALTA,
                        link=f"/workflows/{task.workflow_id}/tasks/{task.id}"
                    )
        
        # Tasks due within a week
        upcoming_tasks = self.db.query(WorkflowTask).join(
            Workflow
        ).filter(
            Workflow.tenant_id == tenant_id,
            WorkflowTask.dueDate > tomorrow,
            WorkflowTask.dueDate <= week_ahead,
            WorkflowTask.status != "Completato"
        ).all()
        
        for task in upcoming_tasks:
            if task.assignee:
                user = self.db.query(User).filter(
                    User.email == task.assignee,
                    User.tenant_id == tenant_id
                ).first()
                
                if user:
                    await self.send_from_template(
                        "task_deadline_reminder",
                        user_id=user.id,
                        tenant_id=tenant_id,
                        variables={
                            "task_title": task.title,
                            "workflow_name": task.workflow.nome,
                            "due_date": task.dueDate.strftime("%d/%m/%Y"),
                            "days_remaining": (task.dueDate - datetime.utcnow()).days
                        },
                        workflow_id=task.workflow_id,
                        link=f"/workflows/{task.workflow_id}/tasks/{task.id}"
                    )
    
    async def process_notification_queue(self):
        """Process queued notifications for delivery"""
        pending_notifications = self.db.query(NotificationQueue).filter(
            NotificationQueue.stato == "pending",
            NotificationQueue.programmata_per <= datetime.utcnow(),
            NotificationQueue.tentativi < NotificationQueue.max_tentativi
        ).all()
        
        for queue_item in pending_notifications:
            try:
                await self._deliver_notification(queue_item)
            except Exception as e:
                logger.error(f"Failed to deliver notification {queue_item.id}: {e}")
                queue_item.tentativi += 1
                queue_item.ultimo_errore = str(e)
                
                if queue_item.tentativi >= queue_item.max_tentativi:
                    queue_item.stato = "failed"
                else:
                    # Retry with exponential backoff
                    queue_item.programmata_per = datetime.utcnow() + timedelta(
                        minutes=5 * (2 ** queue_item.tentativi)
                    )
        
        self.db.commit()
    
    def _get_enabled_channels(
        self,
        preferences: NotificationPreference,
        tipo: NotificationTypeEnum,
        priorita: NotificationPriorityEnum
    ) -> List[NotificationChannelEnum]:
        """Determine which channels to use based on preferences"""
        channels = [NotificationChannelEnum.WEB]  # Always include web
        
        # Check if notification type is enabled
        type_enabled_map = {
            NotificationTypeEnum.SCADENZA: preferences.scadenze_enabled,
            NotificationTypeEnum.TASK: preferences.task_enabled,
            NotificationTypeEnum.SISTEMA: preferences.sistema_enabled,
            NotificationTypeEnum.WORKFLOW: preferences.workflow_enabled
        }
        
        if not type_enabled_map.get(tipo, True):
            return channels  # Only web notification
        
        # Check priority threshold
        priority_values = {
            NotificationPriorityEnum.BASSA: 1,
            NotificationPriorityEnum.MEDIA: 2,
            NotificationPriorityEnum.ALTA: 3
        }
        
        if priority_values.get(priorita, 2) < priority_values.get(preferences.min_priority, 1):
            return channels  # Only web notification
        
        # Add enabled channels
        if preferences.email_enabled:
            channels.append(NotificationChannelEnum.EMAIL)
        if preferences.sms_enabled:
            channels.append(NotificationChannelEnum.SMS)
        if preferences.push_enabled:
            channels.append(NotificationChannelEnum.PUSH)
        
        return channels
    
    async def _queue_notification(
        self,
        notification: Notification,
        channels: List[NotificationChannelEnum]
    ):
        """Queue notification for delivery across channels"""
        user = self.db.query(User).filter(User.id == notification.user_id).first()
        
        for channel in channels:
            if channel == NotificationChannelEnum.WEB:
                continue  # Handled separately
            
            destinatario = None
            if channel == NotificationChannelEnum.EMAIL:
                destinatario = user.email
            elif channel == NotificationChannelEnum.SMS and hasattr(user, 'telefono'):
                destinatario = user.telefono
            elif channel == NotificationChannelEnum.PUSH and hasattr(user, 'push_token'):
                destinatario = user.push_token
            
            if destinatario:
                queue_item = NotificationQueue(
                    notification_id=notification.id,
                    canale=channel,
                    destinatario=destinatario,
                    tenant_id=notification.tenant_id
                )
                self.db.add(queue_item)
        
        notification.inviata = True
        notification.data_invio = datetime.utcnow()
        self.db.commit()
    
    async def _send_web_notification(self, notification: Notification):
        """Send real-time web notification via WebSocket"""
        try:
            await ws_manager.send_personal_message(
                message={
                    "type": "notification",
                    "data": {
                        "id": notification.id,
                        "tipo": notification.tipo.value,
                        "titolo": notification.titolo,
                        "messaggio": notification.messaggio,
                        "priorita": notification.priorita.value,
                        "link": notification.link,
                        "created_at": notification.created_at.isoformat()
                    }
                },
                user_id=str(notification.user_id)
            )
        except Exception as e:
            logger.error(f"Failed to send web notification: {e}")
    
    async def _deliver_notification(self, queue_item: NotificationQueue):
        """Deliver a queued notification"""
        queue_item.stato = "sending"
        self.db.commit()
        
        try:
            if queue_item.canale == NotificationChannelEnum.EMAIL:
                await self._send_email_notification(queue_item)
            elif queue_item.canale == NotificationChannelEnum.SMS:
                await self._send_sms_notification(queue_item)
            elif queue_item.canale == NotificationChannelEnum.PUSH:
                await self._send_push_notification(queue_item)
            
            queue_item.stato = "sent"
            queue_item.inviata_il = datetime.utcnow()
            
        except Exception as e:
            raise e
        finally:
            self.db.commit()
    
    async def _send_email_notification(self, queue_item: NotificationQueue):
        """Send email notification"""
        notification = queue_item.notification
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_FROM
        msg['To'] = queue_item.destinatario
        msg['Subject'] = notification.titolo
        
        # Create HTML body
        html_body = f"""
        <html>
            <body>
                <h2>{notification.titolo}</h2>
                <p>{notification.messaggio}</p>
                {f'<p><a href="{settings.APP_URL}{notification.link}">Visualizza dettagli</a></p>' if notification.link else ''}
                <hr>
                <p style="font-size: 12px; color: #666;">
                    Questa email è stata inviata da Kronos EAM. 
                    Per modificare le preferenze di notifica, accedi al tuo profilo.
                </p>
            </body>
        </html>
        """
        
        msg.attach(MIMEText(html_body, 'html'))
        
        # Send email
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
    
    async def _send_sms_notification(self, queue_item: NotificationQueue):
        """Send SMS notification (placeholder for actual implementation)"""
        # This would integrate with an SMS provider like Twilio
        logger.info(f"SMS notification to {queue_item.destinatario}: {queue_item.notification.messaggio}")
    
    async def _send_push_notification(self, queue_item: NotificationQueue):
        """Send push notification (placeholder for actual implementation)"""
        # This would integrate with FCM or APNs
        logger.info(f"Push notification to {queue_item.destinatario}: {queue_item.notification.titolo}")
    
    def _process_template(self, template: str, variables: Dict[str, Any]) -> str:
        """Process template with variables"""
        result = template
        for key, value in variables.items():
            result = result.replace(f"{{{{{key}}}}}", str(value))
        return result
    
    def get_notification_stats(
        self,
        tenant_id: int,
        user_id: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Get notification statistics"""
        query = self.db.query(Notification).filter(
            Notification.tenant_id == tenant_id
        )
        
        if user_id:
            query = query.filter(Notification.user_id == user_id)
        if start_date:
            query = query.filter(Notification.created_at >= start_date)
        if end_date:
            query = query.filter(Notification.created_at <= end_date)
        
        total = query.count()
        unread = query.filter(Notification.letta == False).count()
        
        # By type
        by_type = {}
        for tipo in NotificationTypeEnum:
            count = query.filter(Notification.tipo == tipo).count()
            by_type[tipo.value] = count
        
        # By priority
        by_priority = {}
        for priorita in NotificationPriorityEnum:
            count = query.filter(Notification.priorita == priorita).count()
            by_priority[priorita.value] = count
        
        # Delivery stats
        queue_query = self.db.query(NotificationQueue).join(
            Notification
        ).filter(
            Notification.tenant_id == tenant_id
        )
        
        if user_id:
            queue_query = queue_query.filter(Notification.user_id == user_id)
        
        delivery_stats = {
            "pending": queue_query.filter(NotificationQueue.stato == "pending").count(),
            "sent": queue_query.filter(NotificationQueue.stato == "sent").count(),
            "failed": queue_query.filter(NotificationQueue.stato == "failed").count()
        }
        
        return {
            "total": total,
            "unread": unread,
            "read": total - unread,
            "by_type": by_type,
            "by_priority": by_priority,
            "delivery": delivery_stats
        }


# Notification builders for common scenarios
class NotificationBuilder:
    """Helper class for building notifications"""
    
    @staticmethod
    async def task_assigned(
        service: NotificationService,
        task: WorkflowTask,
        assigned_by: User,
        tenant_id: int
    ):
        """Notify user of task assignment"""
        assignee = service.db.query(User).filter(
            User.email == task.assignee,
            User.tenant_id == tenant_id
        ).first()
        
        if assignee:
            await service.send_from_template(
                "task_assigned",
                user_id=assignee.id,
                tenant_id=tenant_id,
                variables={
                    "task_title": task.title,
                    "workflow_name": task.workflow.nome,
                    "assigned_by": assigned_by.nome_completo,
                    "due_date": task.dueDate.strftime("%d/%m/%Y") if task.dueDate else "Non specificata"
                },
                workflow_id=task.workflow_id,
                link=f"/workflows/{task.workflow_id}/tasks/{task.id}",
                azione="view_task"
            )
    
    @staticmethod
    async def workflow_completed(
        service: NotificationService,
        workflow: Workflow,
        tenant_id: int
    ):
        """Notify stakeholders of workflow completion"""
        # Notify workflow creator
        creator = service.db.query(User).filter(
            User.id == workflow.created_by
        ).first()
        
        if creator:
            await service.send_from_template(
                "workflow_completed",
                user_id=creator.id,
                tenant_id=tenant_id,
                variables={
                    "workflow_name": workflow.nome,
                    "impianto_name": workflow.impianto.nome if workflow.impianto else "",
                    "completion_date": workflow.data_completamento.strftime("%d/%m/%Y")
                },
                workflow_id=workflow.id,
                link=f"/workflows/{workflow.id}",
                priorita=NotificationPriorityEnum.ALTA
            )
    
    @staticmethod
    async def document_expiring(
        service: NotificationService,
        document: Document,
        days_until_expiry: int,
        tenant_id: int
    ):
        """Notify about document expiration"""
        # Find document owner or plant manager
        if document.impianto_id:
            # Notify plant managers
            managers = service.db.query(User).filter(
                User.tenant_id == tenant_id,
                User.ruolo.in_(["Admin", "Asset Manager"])
            ).all()
            
            for manager in managers:
                await service.send_from_template(
                    "document_expiring",
                    user_id=manager.id,
                    tenant_id=tenant_id,
                    variables={
                        "document_name": document.nome,
                        "impianto_name": document.impianto.nome if document.impianto else "",
                        "expiry_date": document.data_scadenza.strftime("%d/%m/%Y"),
                        "days_remaining": days_until_expiry
                    },
                    documento_id=document.id,
                    impianto_id=document.impianto_id,
                    link=f"/documents/{document.id}",
                    priorita=NotificationPriorityEnum.ALTA if days_until_expiry <= 7 else NotificationPriorityEnum.MEDIA
                )