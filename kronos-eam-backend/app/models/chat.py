"""
Chat models for database
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class ChatSession(Base):
    """Chat session model"""
    __tablename__ = "chat_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(String, nullable=False, index=True)
    user_id = Column(String, nullable=False, index=True)
    title = Column(String(200), nullable=False)
    agent_type = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_activity = Column(DateTime, default=datetime.utcnow, nullable=False)
    message_count = Column(Integer, default=0)
    model_metadata = Column(JSON, nullable=True)
    
    # Relationships
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")


class ChatMessage(Base):
    """Chat message model"""
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False, index=True)
    tenant_id = Column(String, nullable=False, index=True)
    role = Column(String(20), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    model_metadata = Column(JSON, nullable=True)
    
    # Relationships
    session = relationship("ChatSession", back_populates="messages")