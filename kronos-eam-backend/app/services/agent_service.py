"""
Agent Service for managing LangGraph agents
"""

from typing import Dict, Any, Optional, List
from enum import Enum
import logging
from datetime import datetime

from app.agents import (
    MaintenanceAgent,
    ComplianceAgent,
    EnergyOptimizationAgent,
    DocumentAnalysisAgent,
    WorkflowAutomationAgent
)
from app.core.config import get_settings

logger = logging.getLogger(__name__)


class AgentType(str, Enum):
    """Available agent types"""
    MAINTENANCE = "maintenance"
    COMPLIANCE = "compliance"
    ENERGY = "energy"
    DOCUMENT = "document"
    WORKFLOW = "workflow"
    GENERAL = "general"


class AgentService:
    """Service for managing and routing to specialized agents"""
    
    def __init__(self):
        self.settings = get_settings()
        self._agents_cache: Dict[str, Any] = {}
    
    def get_agent(self, agent_type: AgentType, tenant_id: str, user_id: Optional[str] = None):
        """Get or create an agent instance"""
        cache_key = f"{tenant_id}:{user_id}:{agent_type}"
        
        if cache_key in self._agents_cache:
            return self._agents_cache[cache_key]
        
        # Create new agent based on type
        agent_class_map = {
            AgentType.MAINTENANCE: MaintenanceAgent,
            AgentType.COMPLIANCE: ComplianceAgent,
            AgentType.ENERGY: EnergyOptimizationAgent,
            AgentType.DOCUMENT: DocumentAnalysisAgent,
            AgentType.WORKFLOW: WorkflowAutomationAgent
        }
        
        agent_class = agent_class_map.get(agent_type)
        if not agent_class:
            raise ValueError(f"Unknown agent type: {agent_type}")
        
        agent = agent_class(tenant_id=tenant_id, user_id=user_id)
        self._agents_cache[cache_key] = agent
        
        return agent
    
    async def process_message(
        self,
        message: str,
        tenant_id: str,
        user_id: Optional[str] = None,
        agent_type: Optional[AgentType] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Process a message with the appropriate agent"""
        try:
            # Auto-detect agent type if not specified
            if not agent_type:
                agent_type = self._detect_agent_type(message)
            
            # Get the appropriate agent
            agent = self.get_agent(agent_type, tenant_id, user_id)
            
            # Process the message
            result = await agent.invoke(message, context)
            
            # Add metadata
            result["agent_type"] = agent_type
            result["timestamp"] = datetime.utcnow().isoformat()
            
            return result
            
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": str(e),
                "agent_type": agent_type,
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def _detect_agent_type(self, message: str) -> AgentType:
        """Detect the most appropriate agent type based on message content"""
        message_lower = message.lower()
        
        # Keywords for each agent type
        agent_keywords = {
            AgentType.MAINTENANCE: [
                "manutenzione", "maintenance", "guasto", "failure", "preventiva",
                "repair", "schedule", "pianifica", "intervento"
            ],
            AgentType.COMPLIANCE: [
                "conformità", "compliance", "normativa", "regulation", "autorizzazione",
                "license", "certificato", "scadenza", "deadline", "gse", "terna"
            ],
            AgentType.ENERGY: [
                "produzione", "production", "efficienza", "efficiency", "performance",
                "ottimizzazione", "optimization", "energia", "kwh", "capacity"
            ],
            AgentType.DOCUMENT: [
                "documento", "document", "pdf", "contratto", "contract", "estrai",
                "extract", "cerca", "find", "allegato"
            ],
            AgentType.WORKFLOW: [
                "processo", "process", "workflow", "attivazione", "connection",
                "procedura", "step", "fase", "avanzamento", "status"
            ]
        }
        
        # Count keyword matches for each agent type
        scores = {}
        for agent_type, keywords in agent_keywords.items():
            score = sum(1 for keyword in keywords if keyword in message_lower)
            scores[agent_type] = score
        
        # Return agent type with highest score, or GENERAL if no matches
        if max(scores.values()) > 0:
            return max(scores, key=scores.get)
        
        return AgentType.WORKFLOW  # Default to workflow for general questions
    
    async def get_agent_capabilities(self, agent_type: Optional[AgentType] = None) -> Dict[str, Any]:
        """Get capabilities of available agents"""
        if agent_type:
            return self._get_single_agent_capabilities(agent_type)
        
        # Return all agent capabilities
        capabilities = {}
        for agent_type in AgentType:
            if agent_type != AgentType.GENERAL:
                capabilities[agent_type] = self._get_single_agent_capabilities(agent_type)
        
        return capabilities
    
    def _get_single_agent_capabilities(self, agent_type: AgentType) -> Dict[str, Any]:
        """Get capabilities of a specific agent"""
        capabilities_map = {
            AgentType.MAINTENANCE: {
                "name": "Maintenance Specialist",
                "description": "Handles predictive maintenance, scheduling, and failure analysis",
                "capabilities": [
                    "Analyze maintenance schedules",
                    "Predict potential failures",
                    "Create maintenance tasks",
                    "Optimize maintenance windows",
                    "Track maintenance history"
                ],
                "example_queries": [
                    "When is the next maintenance for plant XYZ?",
                    "Show me overdue maintenance tasks",
                    "Analyze failure patterns for inverters"
                ]
            },
            AgentType.COMPLIANCE: {
                "name": "Compliance Specialist",
                "description": "Manages regulatory compliance and documentation",
                "capabilities": [
                    "Track compliance status",
                    "Monitor document expiration",
                    "Identify regulatory requirements",
                    "Generate compliance reports",
                    "Alert on compliance risks"
                ],
                "example_queries": [
                    "What documents are expiring soon?",
                    "Check GSE compliance for all plants",
                    "What are the requirements for UTF license?"
                ]
            },
            AgentType.ENERGY: {
                "name": "Energy Optimization Specialist",
                "description": "Optimizes energy production and efficiency",
                "capabilities": [
                    "Analyze production patterns",
                    "Identify optimization opportunities",
                    "Compare with benchmarks",
                    "Calculate ROI for improvements",
                    "Predict production"
                ],
                "example_queries": [
                    "Analyze efficiency trends for last month",
                    "How can we improve capacity factor?",
                    "Compare our performance to industry standards"
                ]
            },
            AgentType.DOCUMENT: {
                "name": "Document Analysis Specialist",
                "description": "Extracts and analyzes information from documents",
                "capabilities": [
                    "Search across documents",
                    "Extract key information",
                    "Identify document types",
                    "Find specific clauses",
                    "Track document versions"
                ],
                "example_queries": [
                    "Find all maintenance contracts",
                    "Extract key dates from authorization documents",
                    "What are our obligations in the GSE agreement?"
                ]
            },
            AgentType.WORKFLOW: {
                "name": "Workflow Automation Specialist",
                "description": "Guides through bureaucratic processes and workflows",
                "capabilities": [
                    "Guide through procedures",
                    "Track workflow progress",
                    "Identify process bottlenecks",
                    "Suggest automation opportunities",
                    "Manage deadlines"
                ],
                "example_queries": [
                    "How do I activate a new plant?",
                    "What's the status of our TICA request?",
                    "Guide me through GSE registration"
                ]
            }
        }
        
        return capabilities_map.get(agent_type, {})
    
    def clear_cache(self, tenant_id: Optional[str] = None):
        """Clear agent cache"""
        if tenant_id:
            # Clear only for specific tenant
            keys_to_remove = [k for k in self._agents_cache.keys() if k.startswith(f"{tenant_id}:")]
            for key in keys_to_remove:
                del self._agents_cache[key]
        else:
            # Clear all
            self._agents_cache.clear()


# Singleton instance
agent_service = AgentService()