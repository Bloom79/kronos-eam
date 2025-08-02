"""
Maintenance Agent for predictive maintenance and scheduling
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
    get_maintenance_schedule,
    get_performance_metrics,
    create_maintenance_task,
    search_documents
)

logger = logging.getLogger(__name__)


class MaintenanceAgent(BaseAgent):
    """Agent specialized in maintenance planning and predictive maintenance"""
    
    def _get_system_prompt(self) -> str:
        return """You are a Maintenance Specialist AI for Kronos EAM system.

Your responsibilities:
1. Analyze maintenance schedules and suggest optimizations
2. Predict potential failures based on performance data
3. Create and manage maintenance tasks
4. Ensure compliance with maintenance requirements
5. Minimize downtime and optimize maintenance windows

Always provide specific, actionable recommendations with dates and priorities.
Use the available tools to gather data and create tasks when needed.
"""
    
    def _get_tools(self) -> List[Any]:
        """Get maintenance-specific tools"""
        return [
            get_plant_info,
            get_maintenance_schedule,
            get_performance_metrics,
            create_maintenance_task,
            search_documents
        ]
    
    def _build_graph(self) -> StateGraph:
        """Build the maintenance agent graph"""
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("analyze", self._analyze_request)
        workflow.add_node("gather_data", self._gather_maintenance_data)
        workflow.add_node("tools", ToolNode(self._get_tools()))
        workflow.add_node("generate_plan", self._generate_maintenance_plan)
        workflow.add_node("respond", self._generate_response)
        
        # Define edges
        workflow.set_entry_point("analyze")
        
        workflow.add_edge("analyze", "gather_data")
        workflow.add_edge("gather_data", "tools")
        workflow.add_edge("tools", "generate_plan")
        workflow.add_edge("generate_plan", "respond")
        workflow.add_edge("respond", END)
        
        return workflow
    
    async def _analyze_request(self, state: AgentState) -> AgentState:
        """Analyze the user's maintenance request"""
        try:
            messages = state["messages"]
            last_message = messages[-1].content if messages else ""
            
            # Determine intent and extract entities
            response = await self.llm.ainvoke([
                {"role": "system", "content": "Extract the maintenance intent and any mentioned power plants or dates."},
                {"role": "user", "content": f"Request: {last_message}"}
            ])
            
            state["context"]["analysis"] = response.content
            state["current_step"] = "analysis_complete"
            
            return state
        except Exception as e:
            state["error"] = str(e)
            return state
    
    async def _gather_maintenance_data(self, state: AgentState) -> AgentState:
        """Determine what data needs to be gathered"""
        try:
            # Based on analysis, prepare tool calls
            context = state["context"]
            
            # This would normally analyze the request and determine which tools to call
            # For now, we'll prepare a basic maintenance query
            tool_calls = []
            
            # If specific impianto mentioned, get its info and schedule
            if "impianto_id" in context:
                tool_calls.extend([
                    {
                        "tool": "get_plant_info",
                        "description": "Recupera informazioni dettagliate su un impianto specifico, inclusa la sua anagrafica e lo stato delle manutenzioni."
                    },
                    {
                        "tool": "get_maintenance_schedule",
                        "args": {
                            "impianto_id": context["impianto_id"],
                            "tenant_id": state["tenant_id"],
                            "days_ahead": 90
                        }
                    },
                    {
                        "tool": "get_performance_metrics",
                        "args": {
                            "impianto_id": context["impianto_id"],
                            "tenant_id": state["tenant_id"],
                            "period_days": 30
                        }
                    }
                ])
            
            state["context"]["tool_calls"] = tool_calls
            state["current_step"] = "data_gathering"
            
            return state
        except Exception as e:
            state["error"] = str(e)
            return state
    
    async def _generate_maintenance_plan(self, state: AgentState) -> AgentState:
        """Generate maintenance recommendations based on gathered data"""
        try:
            # Extract tool results from messages
            tool_results = []
            for msg in state["messages"]:
                if hasattr(msg, "tool_calls_results"):
                    tool_results.extend(msg.tool_calls_results)
            
            # Generate maintenance plan based on data
            prompt = f"""Based on the following data, generate a maintenance plan:

Tool Results: {tool_results}

Provide:
1. Current maintenance status
2. Upcoming scheduled maintenance
3. Recommendations for preventive maintenance
4. Any urgent issues that need attention
5. Optimization suggestions
"""
            
            response = await self.llm.ainvoke([
                {"role": "system", "content": self._get_system_prompt()},
                {"role": "user", "content": prompt}
            ])
            
            state["context"]["maintenance_plan"] = response.content
            state["current_step"] = "plan_generated"
            
            return state
        except Exception as e:
            state["error"] = str(e)
            return state
    
    async def _generate_response(self, state: AgentState) -> AgentState:
        """Generate final response to user"""
        try:
            plan = state["context"].get("maintenance_plan", "No plan generated")
            
            # Create structured response
            result = {
                "plan": plan,
                "recommendations": self._extract_recommendations(plan),
                "next_actions": self._extract_actions(plan),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            state["result"] = result
            state["messages"].append(AIMessage(content=plan))
            state["current_step"] = "complete"
            
            return state
        except Exception as e:
            state["error"] = str(e)
            return state
    
    def _extract_recommendations(self, plan: str) -> List[str]:
        """Extract key recommendations from the plan"""
        # This is a simplified extraction - in production would use NLP
        recommendations = []
        lines = plan.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ['recommend', 'suggest', 'should', 'consider']):
                recommendations.append(line.strip())
        return recommendations[:5]  # Top 5 recommendations
    
    def _extract_actions(self, plan: str) -> List[Dict[str, Any]]:
        """Extract actionable items from the plan"""
        # Simplified extraction
        actions = []
        if "schedule" in plan.lower():
            actions.append({
                "type": "schedule_maintenance",
                "priority": "high",
                "description": "Review and update maintenance schedule"
            })
        if "urgent" in plan.lower() or "immediate" in plan.lower():
            actions.append({
                "type": "urgent_action",
                "priority": "critical",
                "description": "Address urgent maintenance issues"
            })
        return actions
    
    async def analyze_performance_trends(self, impianto_id: int) -> Dict[str, Any]:
        """Analyze performance trends to predict maintenance needs"""
        try:
            # Get historical performance data
            metrics = await self._get_performance_history(impianto_id)
            
            # Analyze trends
            analysis = {
                "efficiency_trend": self._calculate_trend(metrics.get("efficiency", [])),
                "production_trend": self._calculate_trend(metrics.get("production", [])),
                "anomalies": self._detect_anomalies(metrics),
                "predicted_issues": self._predict_issues(metrics)
            }
            
            return analysis
        except Exception as e:
            logger.error(f"Error analyzing trends: {e}")
            return {"error": str(e)}
    
    def _calculate_trend(self, data: List[float]) -> str:
        """Calculate trend from time series data"""
        if len(data) < 2:
            return "insufficient_data"
        
        # Simple trend calculation
        avg_first_half = sum(data[:len(data)//2]) / (len(data)//2)
        avg_second_half = sum(data[len(data)//2:]) / (len(data) - len(data)//2)
        
        if avg_second_half > avg_first_half * 1.05:
            return "improving"
        elif avg_second_half < avg_first_half * 0.95:
            return "declining"
        else:
            return "stable"
    
    def _detect_anomalies(self, metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detect anomalies in performance metrics"""
        anomalies = []
        
        # Check for sudden drops in efficiency
        efficiency = metrics.get("efficiency", [])
        if efficiency:
            avg_efficiency = sum(efficiency) / len(efficiency)
            for i, eff in enumerate(efficiency):
                if eff < avg_efficiency * 0.8:  # 20% below average
                    anomalies.append({
                        "type": "low_efficiency",
                        "value": eff,
                        "date_index": i,
                        "severity": "medium"
                    })
        
        return anomalies
    
    def _predict_issues(self, metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Predict potential issues based on metrics"""
        predictions = []
        
        # Check declining efficiency trend
        efficiency_trend = self._calculate_trend(metrics.get("efficiency", []))
        if efficiency_trend == "declining":
            predictions.append({
                "issue": "Potential component degradation",
                "probability": 0.7,
                "recommended_action": "Schedule preventive maintenance inspection",
                "timeframe": "Within 30 days"
            })
        
        return predictions
    
    async def _get_performance_history(self, impianto_id: int) -> Dict[str, Any]:
        """Get historical performance data"""
        # This would fetch from database
        # Simplified for now
        return {
            "efficiency": [95.2, 94.8, 93.5, 92.1, 91.8],
            "production": [1200, 1180, 1150, 1100, 1050]
        }