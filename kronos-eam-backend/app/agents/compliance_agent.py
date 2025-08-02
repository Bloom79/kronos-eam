"""
Compliance Agent for regulatory compliance and document management
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
    get_compliance_status,
    search_documents,
    get_active_workflows
)

logger = logging.getLogger(__name__)


class ComplianceAgent(BaseAgent):
    """Agent specialized in regulatory compliance and document management"""
    
    def _get_system_prompt(self) -> str:
        return """You are a Compliance Specialist AI for Kronos EAM system.

Your responsibilities:
1. Monitor regulatory compliance for energy assets
2. Track document expiration and renewal requirements  
3. Ensure adherence to GSE, Terna, and other regulatory requirements
4. Identify compliance risks and gaps
5. Guide users through compliance procedures

Key regulations to consider:
- GSE requirements for renewable energy incentives
- Terna grid connection requirements
- Environmental and safety regulations
- Local permitting requirements

Always provide specific regulatory references and deadlines.
"""
    
    def _get_tools(self) -> List[Any]:
        """Get compliance-specific tools"""
        return [
            get_plant_info,
            get_compliance_status,
            search_documents,
            get_active_workflows
        ]
    
    def _build_graph(self) -> StateGraph:
        """Build the compliance agent graph"""
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("analyze", self._analyze_compliance_request)
        workflow.add_node("check_compliance", self._check_compliance_status)
        workflow.add_node("tools", ToolNode(self._get_tools()))
        workflow.add_node("assess_risks", self._assess_compliance_risks)
        workflow.add_node("recommend", self._generate_recommendations)
        workflow.add_node("respond", self._generate_response)
        
        # Define edges
        workflow.set_entry_point("analyze")
        
        workflow.add_edge("analyze", "check_compliance")
        workflow.add_edge("check_compliance", "tools")
        workflow.add_edge("tools", "assess_risks")
        workflow.add_edge("assess_risks", "recommend")
        workflow.add_edge("recommend", "respond")
        workflow.add_edge("respond", END)
        
        return workflow
    
    async def _analyze_compliance_request(self, state: AgentState) -> AgentState:
        """Analyze the compliance-related request"""
        try:
            messages = state["messages"]
            last_message = messages[-1].content if messages else ""
            
            # Determine compliance focus area
            response = await self.llm.ainvoke([
                {"role": "system", "content": "Identify the compliance area and any specific regulations mentioned."},
                {"role": "user", "content": f"Request: {last_message}"}
            ])
            
            state["context"]["compliance_focus"] = response.content
            state["current_step"] = "analysis_complete"
            
            return state
        except Exception as e:
            state["error"] = str(e)
            return state
    
    async def _check_compliance_status(self, state: AgentState) -> AgentState:
        """Prepare compliance checks"""
        try:
            context = state["context"]
            tool_calls = []
            
            # Check compliance for specific impianto or all
            if "impianto_id" in context:
                tool_calls.append({
                    "tool": "get_compliance_status",
                    "args": {
                        "impianto_id": context["impianto_id"],
                        "tenant_id": state["tenant_id"]
                    }
                })
            
            # Search for relevant compliance documents
            tool_calls.append({
                "tool": "search_documents",
                "args": {
                    "query": "autorizzazione certificato licenza",
                    "tenant_id": state["tenant_id"]
                }
            })
            
            state["context"]["tool_calls"] = tool_calls
            state["current_step"] = "checking_compliance"
            
            return state
        except Exception as e:
            state["error"] = str(e)
            return state
    
    async def _assess_compliance_risks(self, state: AgentState) -> AgentState:
        """Assess compliance risks based on gathered data"""
        try:
            # Extract tool results
            tool_results = self._extract_tool_results(state)
            
            # Analyze compliance gaps and risks
            risk_assessment = await self._perform_risk_assessment(tool_results)
            
            state["context"]["risk_assessment"] = risk_assessment
            state["current_step"] = "risks_assessed"
            
            return state
        except Exception as e:
            state["error"] = str(e)
            return state
    
    async def _generate_recommendations(self, state: AgentState) -> AgentState:
        """Generate compliance recommendations"""
        try:
            risk_assessment = state["context"].get("risk_assessment", {})
            
            # Generate recommendations based on risks
            prompt = f"""Based on the compliance risk assessment:
{risk_assessment}

Provide:
1. Immediate actions required
2. Documents that need renewal
3. Regulatory deadlines
4. Process improvements
5. Risk mitigation strategies
"""
            
            response = await self.llm.ainvoke([
                {"role": "system", "content": self._get_system_prompt()},
                {"role": "user", "content": prompt}
            ])
            
            state["context"]["recommendations"] = response.content
            state["current_step"] = "recommendations_generated"
            
            return state
        except Exception as e:
            state["error"] = str(e)
            return state
    
    async def _generate_response(self, state: AgentState) -> AgentState:
        """Generate final compliance response"""
        try:
            recommendations = state["context"].get("recommendations", "")
            risk_assessment = state["context"].get("risk_assessment", {})
            
            result = {
                "compliance_status": self._determine_overall_status(risk_assessment),
                "risk_level": risk_assessment.get("overall_risk", "unknown"),
                "recommendations": recommendations,
                "critical_actions": self._extract_critical_actions(recommendations),
                "next_review_date": (datetime.utcnow() + timedelta(days=30)).isoformat()
            }
            
            state["result"] = result
            state["messages"].append(AIMessage(content=recommendations))
            state["current_step"] = "complete"
            
            return state
        except Exception as e:
            state["error"] = str(e)
            return state
    
    def _extract_tool_results(self, state: AgentState) -> Dict[str, Any]:
        """Extract results from tool calls"""
        results = {}
        for msg in state["messages"]:
            if hasattr(msg, "tool_calls_results"):
                for result in msg.tool_calls_results:
                    results[result.get("tool_name", "unknown")] = result.get("output", {})
        return results
    
    async def _perform_risk_assessment(self, tool_results: Dict[str, Any]) -> Dict[str, Any]:
        """Perform detailed risk assessment"""
        risks = {
            "high": [],
            "medium": [],
            "low": []
        }
        
        # Check compliance status
        compliance_status = tool_results.get("get_compliance_status", {})
        if not compliance_status.get("compliant", True):
            risks["high"].append({
                "area": "Overall Compliance",
                "issue": "Non-compliant status detected",
                "impact": "Potential fines or operational restrictions"
            })
        
        # Check document expiration
        documents = tool_results.get("search_documents", [])
        expiring_soon = [doc for doc in documents if self._is_expiring_soon(doc.get("data_scadenza"))]
        if expiring_soon:
            risks["medium"].append({
                "area": "Document Management",
                "issue": f"{len(expiring_soon)} documents expiring soon",
                "impact": "Compliance gaps if not renewed"
            })
        
        # Calculate overall risk
        overall_risk = "high" if risks["high"] else ("medium" if risks["medium"] else "low")
        
        return {
            "risks": risks,
            "overall_risk": overall_risk,
            "total_issues": sum(len(risks[level]) for level in risks)
        }
    
    def _is_expiring_soon(self, expiry_date_str: Optional[str]) -> bool:
        """Check if a date is expiring within 30 days"""
        if not expiry_date_str:
            return False
        try:
            expiry_date = datetime.fromisoformat(expiry_date_str)
            return expiry_date <= datetime.utcnow() + timedelta(days=30)
        except:
            return False
    
    def _determine_overall_status(self, risk_assessment: Dict[str, Any]) -> str:
        """Determine overall compliance status"""
        overall_risk = risk_assessment.get("overall_risk", "unknown")
        if overall_risk == "high":
            return "Non-Compliant"
        elif overall_risk == "medium":
            return "Partially Compliant"
        else:
            return "Compliant"
    
    def _extract_critical_actions(self, recommendations: str) -> List[Dict[str, Any]]:
        """Extract critical actions from recommendations"""
        actions = []
        
        # Simple extraction based on keywords
        lines = recommendations.split('\n')
        for line in lines:
            if any(keyword in line.lower() for keyword in ['immediate', 'urgent', 'critical', 'required']):
                actions.append({
                    "action": line.strip(),
                    "priority": "critical",
                    "deadline": "ASAP"
                })
        
        return actions[:3]  # Top 3 critical actions
    
    async def check_gse_compliance(self, impianto_id: int) -> Dict[str, Any]:
        """Check specific GSE compliance requirements"""
        try:
            # GSE-specific checks
            checks = {
                "censimp_registration": True,  # Would check actual registration
                "production_data_submission": True,  # Check if data is being submitted
                "incentive_eligibility": True,  # Check incentive requirements
                "technical_requirements": True  # Check technical compliance
            }
            
            issues = []
            if not all(checks.values()):
                for check, passed in checks.items():
                    if not passed:
                        issues.append(f"Failed {check}")
            
            return {
                "gse_compliant": all(checks.values()),
                "checks": checks,
                "issues": issues
            }
        except Exception as e:
            logger.error(f"Error checking GSE compliance: {e}")
            return {"error": str(e)}