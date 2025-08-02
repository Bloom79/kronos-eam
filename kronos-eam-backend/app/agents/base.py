"""
Base Agent class for LangGraph agents
"""

from typing import Dict, Any, Optional, List, TypedDict, Annotated
from abc import ABC, abstractmethod
import logging
from datetime import datetime
from enum import Enum

from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.memory import MemorySaver

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class AgentState(TypedDict):
    """Base state for all agents"""
    messages: List[BaseMessage]
    tenant_id: str
    user_id: Optional[str]
    context: Dict[str, Any]
    current_step: str
    error: Optional[str]
    result: Optional[Dict[str, Any]]


class BaseAgent(ABC):
    """Base class for all LangGraph agents"""
    
    def __init__(self, tenant_id: str, user_id: Optional[str] = None):
        self.tenant_id = tenant_id
        self.user_id = user_id
        self.settings = get_settings()
        
        # Initialize Gemini model
        self.llm = self._create_llm()
        
        # Initialize memory
        self.memory = MemorySaver()
        
        # Build the graph
        self.graph = self._build_graph()
        self.app = self.graph.compile(checkpointer=self.memory)
        
    def _create_llm(self):
        """Create Gemini LLM instance"""
        model_name = self.settings.GEMINI_MODEL or "gemini-1.5-pro"
        
        return ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=self.settings.GOOGLE_API_KEY,
            temperature=0.7,
            max_output_tokens=2048,
            top_p=0.8,
            top_k=40
        )
    
    @abstractmethod
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph state graph - must be implemented by subclasses"""
        pass
    
    @abstractmethod
    def _get_tools(self) -> List[Any]:
        """Get tools available to this agent"""
        pass
    
    def _get_system_prompt(self) -> str:
        """Get system prompt for the agent"""
        return f"""You are an AI assistant for Kronos EAM system.
Tenant ID: {self.tenant_id}
Current time: {datetime.utcnow().isoformat()}

Your role is to help users with energy asset management tasks.
Always be helpful, accurate, and provide actionable insights.
"""
    
    async def invoke(self, message: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Main entry point for agent invocation"""
        try:
            # Prepare initial state
            initial_state: AgentState = {
                "messages": [
                    SystemMessage(content=self._get_system_prompt()),
                    HumanMessage(content=message)
                ],
                "tenant_id": self.tenant_id,
                "user_id": self.user_id,
                "context": context or {},
                "current_step": "start",
                "error": None,
                "result": None
            }
            
            # Create config with thread ID for memory
            config = {
                "configurable": {
                    "thread_id": f"{self.tenant_id}_{self.user_id}_{datetime.utcnow().timestamp()}"
                }
            }
            
            # Run the graph
            final_state = await self.app.ainvoke(initial_state, config)
            
            # Extract result
            if final_state.get("error"):
                return {
                    "success": False,
                    "error": final_state["error"],
                    "messages": final_state.get("messages", [])
                }
            
            return {
                "success": True,
                "result": final_state.get("result", {}),
                "messages": final_state.get("messages", [])
            }
            
        except Exception as e:
            logger.error(f"Agent error: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": str(e),
                "messages": []
            }
    
    def _should_continue(self, state: AgentState) -> str:
        """Determine if processing should continue"""
        if state.get("error"):
            return "error"
        if state.get("result"):
            return "end"
        return "continue"