"""
Workflow Automation Agent for process orchestration
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging

from langchain_core.messages import HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

from app.agents.base import BaseAgent, AgentState
from app.agents.tools import (
    get_plant_info,
    get_active_workflows,
    update_task_status,
    search_documents
)

logger = logging.getLogger(__name__)


class WorkflowAutomationAgent(BaseAgent):
    """Agent specialized in workflow automation and process management"""
    
    def _get_system_prompt(self) -> str:
        return """You are a Workflow Automation Specialist AI for Kronos EAM system.

Your responsibilities:
1. Guide users through complex bureaucratic processes
2. Track workflow progress and identify bottlenecks
3. Automate task assignments and notifications
4. Ensure process compliance and deadlines
5. Optimize workflow efficiency

Key workflows you manage:
- New plant connection (DSO, Terna, GSE processes)
- Annual compliance submissions
- Maintenance planning and execution
- Document renewal processes
- Regulatory reporting

Always provide clear next steps and timeline estimates.
Help users navigate Italian energy sector bureaucracy efficiently.
"""
    
    def _get_tools(self) -> List[Any]:
        """Get workflow automation tools"""
        return [
            get_plant_info,
            get_active_workflows,
            update_task_status,
            search_documents
        ]
    
    def _build_graph(self) -> StateGraph:
        """Build the workflow automation agent graph"""
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("analyze", self._analyze_workflow_request)
        workflow.add_node("assess_status", self._assess_workflow_status)
        workflow.add_node("tools", ToolNode(self._get_tools()))
        workflow.add_node("plan_actions", self._plan_workflow_actions)
        workflow.add_node("execute", self._execute_workflow_steps)
        workflow.add_node("respond", self._generate_response)
        
        # Define edges
        workflow.set_entry_point("analyze")
        
        workflow.add_edge("analyze", "assess_status")
        workflow.add_edge("assess_status", "tools")
        workflow.add_edge("tools", "plan_actions")
        workflow.add_edge("plan_actions", "execute")
        workflow.add_edge("execute", "respond")
        workflow.add_edge("respond", END)
        
        return workflow
    
    async def _analyze_workflow_request(self, state: AgentState) -> AgentState:
        """Analyze the workflow automation request"""
        try:
            messages = state["messages"]
            last_message = messages[-1].content if messages else ""
            
            # Determine workflow type and intent
            response = await self.llm.ainvoke([
                {"role": "system", "content": "Identify the workflow type and what action the user wants to take."},
                {"role": "user", "content": f"Request: {last_message}"}
            ])
            
            state["context"]["workflow_intent"] = response.content
            
            # Extract workflow type
            workflow_type = self._identify_workflow_type(last_message)
            state["context"]["workflow_type"] = workflow_type
            
            state["current_step"] = "analysis_complete"
            
            return state
        except Exception as e:
            state["error"] = str(e)
            return state
    
    async def _assess_workflow_status(self, state: AgentState) -> AgentState:
        """Assess current workflow status"""
        try:
            context = state["context"]
            tool_calls = []
            
            # Get active workflows
            tool_calls.append({
                "tool": "get_active_workflows",
                "args": {
                    "tenant_id": state["tenant_id"],
                    "impianto_id": context.get("impianto_id")
                }
            })
            
            # Get relevant documents for the workflow
            if context.get("workflow_type"):
                tool_calls.append({
                    "tool": "search_documents",
                    "args": {
                        "query": self._get_workflow_document_query(context["workflow_type"]),
                        "tenant_id": state["tenant_id"]
                    }
                })
            
            state["context"]["tool_calls"] = tool_calls
            state["current_step"] = "assessing_status"
            
            return state
        except Exception as e:
            state["error"] = str(e)
            return state
    
    async def _plan_workflow_actions(self, state: AgentState) -> AgentState:
        """Plan workflow actions based on current status"""
        try:
            # Extract workflow data
            workflows = self._extract_workflow_data(state)
            workflow_type = state["context"].get("workflow_type", "")
            
            # Generate action plan
            action_plan = await self._generate_action_plan(workflows, workflow_type)
            
            state["context"]["action_plan"] = action_plan
            state["current_step"] = "planning_complete"
            
            return state
        except Exception as e:
            state["error"] = str(e)
            return state
    
    async def _execute_workflow_steps(self, state: AgentState) -> AgentState:
        """Execute or simulate workflow steps"""
        try:
            action_plan = state["context"].get("action_plan", {})
            
            # Generate detailed execution steps
            prompt = f"""Based on the workflow action plan:
{action_plan}

Provide:
1. Step-by-step execution guide
2. Required documents for each step
3. Estimated timeline for completion
4. Potential blockers and solutions
5. Automation opportunities
"""
            
            response = await self.llm.ainvoke([
                {"role": "system", "content": self._get_system_prompt()},
                {"role": "user", "content": prompt}
            ])
            
            state["context"]["execution_guide"] = response.content
            state["current_step"] = "execution_planned"
            
            return state
        except Exception as e:
            state["error"] = str(e)
            return state
    
    async def _generate_response(self, state: AgentState) -> AgentState:
        """Generate final workflow automation response"""
        try:
            execution_guide = state["context"].get("execution_guide", "")
            action_plan = state["context"].get("action_plan", {})
            
            result = {
                "workflow_type": state["context"].get("workflow_type", "unknown"),
                "current_status": action_plan.get("current_status", "unknown"),
                "execution_guide": execution_guide,
                "next_steps": self._extract_next_steps(execution_guide),
                "timeline": self._extract_timeline(execution_guide),
                "required_documents": self._extract_required_documents(execution_guide),
                "automation_suggestions": self._extract_automation_suggestions(execution_guide)
            }
            
            state["result"] = result
            state["messages"].append(AIMessage(content=execution_guide))
            state["current_step"] = "complete"
            
            return state
        except Exception as e:
            state["error"] = str(e)
            return state
    
    def _identify_workflow_type(self, message: str) -> str:
        """Identify the type of workflow from the message"""
        message_lower = message.lower()
        
        workflow_mapping = {
            "connection": ["connessione", "allacciamento", "tica", "connection"],
            "gse_registration": ["gse", "rid", "ssp", "convenzione"],
            "maintenance": ["manutenzione", "maintenance", "intervento"],
            "compliance": ["conformità", "compliance", "dichiarazione"],
            "license": ["licenza", "utf", "dogana", "customs"],
            "annual_submission": ["annuale", "annual", "dichiarazione consumi"]
        }
        
        for workflow_type, keywords in workflow_mapping.items():
            if any(keyword in message_lower for keyword in keywords):
                return workflow_type
        
        return "general"
    
    def _get_workflow_document_query(self, workflow_type: str) -> str:
        """Get document search query based on workflow type"""
        queries = {
            "connection": "tica stmg connessione preventivo",
            "gse_registration": "gse convenzione rid ssp",
            "maintenance": "contratto manutenzione intervento",
            "compliance": "autorizzazione certificato conformità",
            "license": "licenza utf dogana",
            "annual_submission": "dichiarazione consumi annuale"
        }
        
        return queries.get(workflow_type, "documento workflow")
    
    def _extract_workflow_data(self, state: AgentState) -> Dict[str, Any]:
        """Extract workflow data from tool results"""
        workflows = []
        documents = []
        
        for msg in state["messages"]:
            if hasattr(msg, "tool_calls_results"):
                for result in msg.tool_calls_results:
                    if result.get("tool_name") == "get_active_workflows":
                        workflows = result.get("output", [])
                    elif result.get("tool_name") == "search_documents":
                        documents = result.get("output", [])
        
        return {
            "active_workflows": workflows,
            "related_documents": documents
        }
    
    async def _generate_action_plan(self, workflow_data: Dict[str, Any], workflow_type: str) -> Dict[str, Any]:
        """Generate action plan based on workflow data"""
        active_workflows = workflow_data.get("active_workflows", [])
        
        # Determine current status
        if not active_workflows:
            current_status = "No active workflow"
        else:
            # Find most relevant workflow
            relevant_workflow = active_workflows[0]  # Simplified
            current_status = f"{relevant_workflow.get('stato', 'Unknown')} - {relevant_workflow.get('progresso', 0)}% complete"
        
        # Generate workflow-specific actions
        actions = self._get_workflow_actions(workflow_type, current_status)
        
        return {
            "current_status": current_status,
            "workflow_type": workflow_type,
            "recommended_actions": actions,
            "priority": self._determine_priority(workflow_type, active_workflows)
        }
    
    def _get_workflow_actions(self, workflow_type: str, current_status: str) -> List[Dict[str, str]]:
        """Get specific actions for workflow type"""
        workflow_actions = {
            "connection": [
                {"step": "Submit TICA request to DSO", "responsible": "DSO Portal"},
                {"step": "Review and accept TICA preventive", "responsible": "Owner"},
                {"step": "Complete connection works", "responsible": "Contractor"},
                {"step": "Request activation", "responsible": "DSO Portal"}
            ],
            "gse_registration": [
                {"step": "Register on GSE portal", "responsible": "Owner"},
                {"step": "Submit RID request", "responsible": "GSE Portal"},
                {"step": "Upload required documents", "responsible": "Owner"},
                {"step": "Await GSE approval", "responsible": "GSE"}
            ],
            "license": [
                {"step": "Prepare UTF license application", "responsible": "Owner"},
                {"step": "Generate EDI file", "responsible": "System"},
                {"step": "Submit via telematic service", "responsible": "ADM Portal"},
                {"step": "Pay license fees", "responsible": "Owner"}
            ]
        }
        
        return workflow_actions.get(workflow_type, [
            {"step": "Identify specific workflow requirements", "responsible": "User"},
            {"step": "Gather necessary documents", "responsible": "User"},
            {"step": "Submit to relevant authority", "responsible": "User"}
        ])
    
    def _determine_priority(self, workflow_type: str, active_workflows: List[Dict[str, Any]]) -> str:
        """Determine workflow priority"""
        # Check for approaching deadlines
        for workflow in active_workflows:
            if workflow.get("data_scadenza"):
                days_until = self._calculate_days_until(workflow["data_scadenza"])
                if days_until < 7:
                    return "critical"
                elif days_until < 30:
                    return "high"
        
        # Workflow type priorities
        high_priority_types = ["license", "compliance", "annual_submission"]
        if workflow_type in high_priority_types:
            return "high"
        
        return "medium"
    
    def _calculate_days_until(self, date_str: str) -> int:
        """Calculate days until deadline"""
        try:
            deadline = datetime.fromisoformat(date_str)
            return (deadline - datetime.utcnow()).days
        except:
            return 999
    
    def _extract_next_steps(self, execution_guide: str) -> List[str]:
        """Extract next steps from execution guide"""
        steps = []
        lines = execution_guide.split('\n')
        
        in_steps_section = False
        for line in lines:
            if "step" in line.lower() or "next" in line.lower():
                in_steps_section = True
            elif in_steps_section and line.strip() and not line.startswith(' '):
                in_steps_section = False
            
            if in_steps_section and line.strip():
                steps.append(line.strip())
        
        return steps[:5]  # Top 5 next steps
    
    def _extract_timeline(self, execution_guide: str) -> Dict[str, Any]:
        """Extract timeline information"""
        timeline = {
            "total_duration": "Not specified",
            "milestones": []
        }
        
        # Look for time-related keywords
        time_keywords = ["days", "weeks", "months", "deadline", "entro", "giorni"]
        
        lines = execution_guide.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in time_keywords):
                timeline["milestones"].append(line.strip())
        
        return timeline
    
    def _extract_required_documents(self, execution_guide: str) -> List[str]:
        """Extract required documents"""
        documents = []
        doc_keywords = ["document", "certificat", "autorizzazion", "dichiarazion", "modulo"]
        
        lines = execution_guide.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in doc_keywords):
                documents.append(line.strip())
        
        return list(set(documents))[:10]  # Unique documents, max 10
    
    def _extract_automation_suggestions(self, execution_guide: str) -> List[Dict[str, str]]:
        """Extract automation suggestions"""
        suggestions = []
        
        automation_keywords = ["automat", "RPA", "integrat", "API"]
        
        lines = execution_guide.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in automation_keywords):
                suggestions.append({
                    "suggestion": line.strip(),
                    "type": "process_automation"
                })
        
        # Add default suggestions based on workflow
        suggestions.extend([
            {
                "suggestion": "Implement automated document expiry notifications",
                "type": "notification_automation"
            },
            {
                "suggestion": "Create RPA bot for portal data entry",
                "type": "rpa_automation"
            }
        ])
        
        return suggestions[:5]