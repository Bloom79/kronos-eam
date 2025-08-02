"""
Energy Optimization Agent for production analysis and efficiency
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
    get_performance_metrics,
    search_documents
)

logger = logging.getLogger(__name__)


class EnergyOptimizationAgent(BaseAgent):
    """Agent specialized in energy production optimization and analysis"""
    
    def _get_system_prompt(self) -> str:
        return """You are an Energy Optimization Specialist AI for Kronos EAM system.

Your responsibilities:
1. Analyze energy production patterns and efficiency
2. Identify optimization opportunities
3. Compare performance against benchmarks
4. Predict production based on weather and historical data
5. Recommend operational improvements

Focus on:
- Maximizing capacity factor
- Reducing performance degradation
- Optimizing maintenance windows
- Identifying underperforming assets

Always provide quantified recommendations with expected improvements.
"""
    
    def _get_tools(self) -> List[Any]:
        """Get energy optimization tools"""
        return [
            get_plant_info,
            get_performance_metrics,
            search_documents
        ]
    
    def _build_graph(self) -> StateGraph:
        """Build the energy optimization agent graph"""
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("analyze", self._analyze_energy_request)
        workflow.add_node("collect_data", self._collect_performance_data)
        workflow.add_node("tools", ToolNode(self._get_tools()))
        workflow.add_node("analyze_performance", self._analyze_performance)
        workflow.add_node("optimize", self._generate_optimizations)
        workflow.add_node("respond", self._generate_response)
        
        # Define edges
        workflow.set_entry_point("analyze")
        
        workflow.add_edge("analyze", "collect_data")
        workflow.add_edge("collect_data", "tools")
        workflow.add_edge("tools", "analyze_performance")
        workflow.add_edge("analyze_performance", "optimize")
        workflow.add_edge("optimize", "respond")
        workflow.add_edge("respond", END)
        
        return workflow
    
    async def _analyze_energy_request(self, state: AgentState) -> AgentState:
        """Analyze the energy optimization request"""
        try:
            messages = state["messages"]
            last_message = messages[-1].content if messages else ""
            
            # Extract energy-related intent
            response = await self.llm.ainvoke([
                {"role": "system", "content": "Identify the energy optimization goal and any specific metrics mentioned."},
                {"role": "user", "content": f"Request: {last_message}"}
            ])
            
            state["context"]["optimization_goal"] = response.content
            state["current_step"] = "analysis_complete"
            
            return state
        except Exception as e:
            state["error"] = str(e)
            return state
    
    async def _collect_performance_data(self, state: AgentState) -> AgentState:
        """Prepare performance data collection"""
        try:
            context = state["context"]
            tool_calls = []
            
            # Collect performance metrics for different periods
            if "impianto_id" in context:
                impianto_id = context["impianto_id"]
                
                # Get current week, month, and quarter data
                for period in [7, 30, 90]:
                    tool_calls.append({
                        "tool": "get_performance_metrics",
                        "args": {
                            "impianto_id": impianto_id,
                            "tenant_id": state["tenant_id"],
                            "period_days": period
                        }
                    })
                
                # Get impianto details
                tool_calls.append({
                    "tool": "get_plant_info",
                    "args": {
                        "id": impianto_id,
                        "tenant_id": state["tenant_id"]
                    }
                })
            
            state["context"]["tool_calls"] = tool_calls
            state["current_step"] = "collecting_data"
            
            return state
        except Exception as e:
            state["error"] = str(e)
            return state
    
    async def _analyze_performance(self, state: AgentState) -> AgentState:
        """Analyze collected performance data"""
        try:
            # Extract tool results
            tool_results = self._extract_tool_results(state)
            
            # Perform performance analysis
            analysis = await self._perform_energy_analysis(tool_results)
            
            state["context"]["performance_analysis"] = analysis
            state["current_step"] = "analysis_complete"
            
            return state
        except Exception as e:
            state["error"] = str(e)
            return state
    
    async def _generate_optimizations(self, state: AgentState) -> AgentState:
        """Generate optimization recommendations"""
        try:
            analysis = state["context"].get("performance_analysis", {})
            
            prompt = f"""Based on the performance analysis:
{analysis}

Provide:
1. Specific optimization opportunities with quantified improvements
2. Operational adjustments to improve efficiency
3. Comparison with industry benchmarks
4. ROI for recommended improvements
5. Implementation timeline
"""
            
            response = await self.llm.ainvoke([
                {"role": "system", "content": self._get_system_prompt()},
                {"role": "user", "content": prompt}
            ])
            
            state["context"]["optimizations"] = response.content
            state["current_step"] = "optimizations_generated"
            
            return state
        except Exception as e:
            state["error"] = str(e)
            return state
    
    async def _generate_response(self, state: AgentState) -> AgentState:
        """Generate final energy optimization response"""
        try:
            optimizations = state["context"].get("optimizations", "")
            analysis = state["context"].get("performance_analysis", {})
            
            result = {
                "current_performance": {
                    "capacity_factor": analysis.get("capacity_factor", 0),
                    "efficiency": analysis.get("average_efficiency", 0),
                    "production_trend": analysis.get("production_trend", "unknown")
                },
                "optimizations": optimizations,
                "potential_improvements": self._calculate_improvements(analysis),
                "priority_actions": self._extract_priority_actions(optimizations),
                "estimated_roi": self._estimate_roi(analysis, optimizations)
            }
            
            state["result"] = result
            state["messages"].append(AIMessage(content=optimizations))
            state["current_step"] = "complete"
            
            return state
        except Exception as e:
            state["error"] = str(e)
            return state
    
    def _extract_tool_results(self, state: AgentState) -> Dict[str, Any]:
        """Extract and organize tool results"""
        results = {
            "weekly_metrics": {},
            "monthly_metrics": {},
            "quarterly_metrics": {},
            "impianto_info": {}
        }
        
        # Parse tool results from messages
        for msg in state["messages"]:
            if hasattr(msg, "tool_calls_results"):
                for result in msg.tool_calls_results:
                    if "period_days" in result.get("args", {}):
                        period = result["args"]["period_days"]
                        if period == 7:
                            results["weekly_metrics"] = result.get("output", {})
                        elif period == 30:
                            results["monthly_metrics"] = result.get("output", {})
                        elif period == 90:
                            results["quarterly_metrics"] = result.get("output", {})
                    elif result.get("tool_name") == "get_plant_info":
                        results["impianto_info"] = result.get("output", {})
        
        return results
    
    async def _perform_energy_analysis(self, tool_results: Dict[str, Any]) -> Dict[str, Any]:
        """Perform detailed energy analysis"""
        weekly = tool_results.get("weekly_metrics", {})
        monthly = tool_results.get("monthly_metrics", {})
        quarterly = tool_results.get("quarterly_metrics", {})
        impianto = tool_results.get("impianto_info", {})
        
        # Calculate trends
        production_trend = "stable"
        if monthly.get("average_daily_production_kwh", 0) > weekly.get("average_daily_production_kwh", 0) * 1.05:
            production_trend = "declining"
        elif monthly.get("average_daily_production_kwh", 0) < weekly.get("average_daily_production_kwh", 0) * 0.95:
            production_trend = "improving"
        
        # Calculate performance ratio
        theoretical_capacity = impianto.get("potenza_installata", 0) * 24
        actual_production = weekly.get("average_daily_production_kwh", 0)
        performance_ratio = (actual_production / theoretical_capacity * 100) if theoretical_capacity > 0 else 0
        
        # Industry benchmark comparison
        benchmark_pr = 75  # Industry standard performance ratio
        performance_gap = benchmark_pr - performance_ratio
        
        return {
            "capacity_factor": monthly.get("capacity_factor", 0),
            "average_efficiency": monthly.get("average_efficiency", 0),
            "production_trend": production_trend,
            "performance_ratio": performance_ratio,
            "benchmark_gap": performance_gap,
            "weekly_production": weekly.get("total_production_kwh", 0),
            "monthly_production": monthly.get("total_production_kwh", 0),
            "quarterly_production": quarterly.get("total_production_kwh", 0)
        }
    
    def _calculate_improvements(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate potential improvements"""
        current_pr = analysis.get("performance_ratio", 0)
        benchmark_pr = 75
        
        # Calculate improvement potential
        improvement_potential = max(0, benchmark_pr - current_pr)
        
        # Estimate production increase
        current_monthly = analysis.get("monthly_production", 0)
        potential_increase = current_monthly * (improvement_potential / 100)
        
        return {
            "performance_ratio_improvement": f"{improvement_potential:.1f}%",
            "monthly_production_increase": f"{potential_increase:.0f} kWh",
            "annual_revenue_increase": f"€{potential_increase * 12 * 0.15:.0f}"  # Assuming €0.15/kWh
        }
    
    def _extract_priority_actions(self, optimizations: str) -> List[Dict[str, Any]]:
        """Extract priority actions from optimization recommendations"""
        actions = []
        
        # Parse optimization text for actions
        if "cleaning" in optimizations.lower():
            actions.append({
                "action": "Implement regular panel cleaning schedule",
                "impact": "2-5% production increase",
                "effort": "low"
            })
        
        if "inverter" in optimizations.lower():
            actions.append({
                "action": "Optimize inverter settings",
                "impact": "1-3% efficiency improvement",
                "effort": "medium"
            })
        
        if "shading" in optimizations.lower():
            actions.append({
                "action": "Address shading issues",
                "impact": "5-15% production increase",
                "effort": "high"
            })
        
        return actions[:3]
    
    def _estimate_roi(self, analysis: Dict[str, Any], optimizations: str) -> Dict[str, Any]:
        """Estimate ROI for optimizations"""
        # Simplified ROI calculation
        monthly_production = analysis.get("monthly_production", 0)
        improvement_percent = analysis.get("benchmark_gap", 0) * 0.5  # Assume 50% of gap can be closed
        
        monthly_increase = monthly_production * (improvement_percent / 100)
        annual_revenue_increase = monthly_increase * 12 * 0.15  # €0.15/kWh
        
        # Estimate implementation cost based on keywords
        implementation_cost = 5000  # Base cost
        if "hardware" in optimizations.lower():
            implementation_cost += 10000
        if "software" in optimizations.lower():
            implementation_cost += 3000
        
        payback_months = implementation_cost / (annual_revenue_increase / 12) if annual_revenue_increase > 0 else 999
        
        return {
            "implementation_cost": f"€{implementation_cost:,.0f}",
            "annual_revenue_increase": f"€{annual_revenue_increase:,.0f}",
            "payback_period": f"{payback_months:.1f} months",
            "5_year_net_benefit": f"€{(annual_revenue_increase * 5 - implementation_cost):,.0f}"
        }