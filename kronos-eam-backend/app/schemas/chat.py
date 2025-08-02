"""
Chat schemas for API
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field

from app.services.agent_service import AgentType


class ChatRequest(BaseModel):
    """Chat request model"""
    message: str = Field(..., description="User's message")
    agent_type: Optional[AgentType] = Field(None, description="Specific agent to use")
    session_id: Optional[int] = Field(None, description="Existing session ID")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "When is the next maintenance for Plant Roma 1?",
                "agent_type": "maintenance",
                "context": {"impianto_id": 1}
            }
        }


class ChatMessage(BaseModel):
    """Chat message model"""
    role: str = Field(..., description="Message role (user/assistant)")
    content: str = Field(..., description="Message content")
    timestamp: datetime = Field(..., description="Message timestamp")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")


class ChatResponse(BaseModel):
    """Chat response model"""
    session_id: int = Field(..., description="Chat session ID")
    message: ChatMessage = Field(..., description="Assistant's response")
    agent_type: AgentType = Field(..., description="Agent that handled the request")
    success: bool = Field(..., description="Whether request was successful")
    context: Optional[Dict[str, Any]] = Field(None, description="Response context")
    
    class Config:
        json_schema_extra = {
            "example": {
                "session_id": 123,
                "message": {
                    "role": "assistant",
                    "content": "The next scheduled maintenance for Plant Roma 1 is on March 15, 2024.",
                    "timestamp": "2024-01-15T10:30:00",
                    "metadata": {}
                },
                "agent_type": "maintenance",
                "success": True,
                "context": {
                    "next_maintenance": {
                        "date": "2024-03-15",
                        "type": "Preventive",
                        "description": "Quarterly inspection"
                    }
                }
            }
        }


class ChatSession(BaseModel):
    """Chat session model"""
    id: int = Field(..., description="Session ID")
    title: str = Field(..., description="Session title")
    agent_type: AgentType = Field(..., description="Primary agent type")
    created_at: datetime = Field(..., description="Creation timestamp")
    last_activity: datetime = Field(..., description="Last activity timestamp")
    message_count: int = Field(0, description="Number of messages")


class ChatSessionList(BaseModel):
    """List of chat sessions"""
    sessions: List[ChatSession] = Field(..., description="Chat sessions")
    total: int = Field(..., description="Total sessions")
    limit: int = Field(..., description="Page limit")
    offset: int = Field(..., description="Page offset")


class AgentCapability(BaseModel):
    """Agent capability description"""
    name: str = Field(..., description="Agent name")
    description: str = Field(..., description="Agent description")
    capabilities: List[str] = Field(..., description="List of capabilities")
    example_queries: List[str] = Field(..., description="Example queries")


class AgentCapabilities(BaseModel):
    """Agent capabilities response"""
    agents: Dict[str, AgentCapability] = Field(..., description="Available agents and their capabilities")