"""
Chat endpoints for AI agent interactions
"""

from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_tenant_db
from app.schemas.auth import TokenData
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ChatMessage,
    ChatSession,
    ChatSessionList,
    AgentCapabilities
)
from app.services.agent_service import agent_service, AgentType
from app.models.chat import ChatSession as ChatSessionModel, ChatMessage as ChatMessageModel
from app.core.database import get_db

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(
    request: ChatRequest,
    current_user: TokenData = Depends(get_current_active_user),
    db: Session = Depends(get_tenant_db)
):
    """
    Chat with an AI agent
    
    - **message**: The user's message
    - **agent_type**: Optional agent type (maintenance, compliance, energy, document, workflow)
    - **session_id**: Optional session ID to continue a conversation
    - **context**: Optional context data (e.g., impianto_id)
    """
    try:
        # Create or get session
        if request.session_id:
            session = db.query(ChatSessionModel).filter(
                ChatSessionModel.id == request.session_id,
                ChatSessionModel.tenant_id == current_user.tenant_id
            ).first()
            if not session:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Session not found"
                )
        else:
            # Create new session
            session = ChatSessionModel(
                tenant_id=current_user.tenant_id,
                user_id=current_user.sub,
                agent_type=request.agent_type or AgentType.GENERAL,
                title=request.message[:50] + "..." if len(request.message) > 50 else request.message
            )
            db.add(session)
            db.commit()
            db.refresh(session)
        
        # Store user message
        user_message = ChatMessageModel(
            session_id=session.id,
            tenant_id=current_user.tenant_id,
            role="user",
            content=request.message,
            timestamp=datetime.utcnow()
        )
        db.add(user_message)
        
        # Process with agent
        result = await agent_service.process_message(
            message=request.message,
            tenant_id=current_user.tenant_id,
            user_id=current_user.sub,
            agent_type=request.agent_type or session.agent_type,
            context=request.context
        )
        
        # Store assistant response
        assistant_content = result.get("result", {}).get("summary", "I couldn't process your request.")
        if not result.get("success", False):
            assistant_content = f"I encountered an error: {result.get('error', 'Unknown error')}"
        
        assistant_message = ChatMessageModel(
            session_id=session.id,
            tenant_id=current_user.tenant_id,
            role="assistant",
            content=assistant_content,
            metadata=result,
            timestamp=datetime.utcnow()
        )
        db.add(assistant_message)
        
        # Update session
        session.last_activity = datetime.utcnow()
        session.message_count = (session.message_count or 0) + 2
        
        db.commit()
        
        # Prepare response
        response = ChatResponse(
            session_id=session.id,
            message=ChatMessage(
                role="assistant",
                content=assistant_content,
                timestamp=assistant_message.timestamp,
                metadata=result
            ),
            agent_type=result.get("agent_type", session.agent_type),
            success=result.get("success", False),
            context=result.get("result", {})
        )
        
        return response
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat processing failed: {str(e)}"
        )


@router.get("/chat/sessions", response_model=ChatSessionList)
async def list_chat_sessions(
    limit: int = 20,
    offset: int = 0,
    current_user: TokenData = Depends(get_current_active_user),
    db: Session = Depends(get_tenant_db)
):
    """Get user's chat sessions"""
    sessions = db.query(ChatSessionModel).filter(
        ChatSessionModel.tenant_id == current_user.tenant_id,
        ChatSessionModel.user_id == current_user.sub
    ).order_by(ChatSessionModel.last_activity.desc()).offset(offset).limit(limit).all()
    
    total = db.query(ChatSessionModel).filter(
        ChatSessionModel.tenant_id == current_user.tenant_id,
        ChatSessionModel.user_id == current_user.sub
    ).count()
    
    return ChatSessionList(
        sessions=[
            ChatSession(
                id=s.id,
                title=s.title,
                agent_type=s.agent_type,
                created_at=s.created_at,
                last_activity=s.last_activity,
                message_count=s.message_count or 0
            )
            for s in sessions
        ],
        total=total,
        limit=limit,
        offset=offset
    )


@router.get("/chat/sessions/{session_id}", response_model=List[ChatMessage])
async def get_chat_history(
    session_id: int,
    current_user: TokenData = Depends(get_current_active_user),
    db: Session = Depends(get_tenant_db)
):
    """Get chat history for a session"""
    # Verify session belongs to user
    session = db.query(ChatSessionModel).filter(
        ChatSessionModel.id == session_id,
        ChatSessionModel.tenant_id == current_user.tenant_id,
        ChatSessionModel.user_id == current_user.sub
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    # Get messages
    messages = db.query(ChatMessageModel).filter(
        ChatMessageModel.session_id == session_id
    ).order_by(ChatMessageModel.timestamp).all()
    
    return [
        ChatMessage(
            role=m.role,
            content=m.content,
            timestamp=m.timestamp,
            metadata=m.metadata
        )
        for m in messages
    ]


@router.delete("/chat/sessions/{session_id}")
async def delete_chat_session(
    session_id: int,
    current_user: TokenData = Depends(get_current_active_user),
    db: Session = Depends(get_tenant_db)
):
    """Delete a chat session"""
    session = db.query(ChatSessionModel).filter(
        ChatSessionModel.id == session_id,
        ChatSessionModel.tenant_id == current_user.tenant_id,
        ChatSessionModel.user_id == current_user.sub
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    # Delete messages first
    db.query(ChatMessageModel).filter(
        ChatMessageModel.session_id == session_id
    ).delete()
    
    # Delete session
    db.delete(session)
    db.commit()
    
    return {"message": "Session deleted successfully"}


@router.get("/chat/agents", response_model=AgentCapabilities)
async def get_agent_capabilities(
    agent_type: Optional[AgentType] = None,
    current_user: TokenData = Depends(get_current_active_user)
):
    """Get capabilities of available agents"""
    capabilities = await agent_service.get_agent_capabilities(agent_type)
    
    return AgentCapabilities(
        agents=capabilities if not agent_type else {agent_type: capabilities}
    )


@router.post("/chat/feedback")
async def submit_chat_feedback(
    session_id: int,
    message_index: int,
    feedback: str,  # "helpful" or "not_helpful"
    comment: Optional[str] = None,
    current_user: TokenData = Depends(get_current_active_user),
    db: Session = Depends(get_tenant_db)
):
    """Submit feedback for a chat message"""
    # Verify session
    session = db.query(ChatSessionModel).filter(
        ChatSessionModel.id == session_id,
        ChatSessionModel.tenant_id == current_user.tenant_id,
        ChatSessionModel.user_id == current_user.sub
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    # Get the specific message
    messages = db.query(ChatMessageModel).filter(
        ChatMessageModel.session_id == session_id
    ).order_by(ChatMessageModel.timestamp).offset(message_index).limit(1).all()
    
    if not messages:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    message = messages[0]
    
    # Update message metadata with feedback
    if not message.metadata:
        message.metadata = {}
    
    message.metadata["feedback"] = {
        "type": feedback,
        "comment": comment,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    db.commit()
    
    return {"message": "Feedback submitted successfully"}