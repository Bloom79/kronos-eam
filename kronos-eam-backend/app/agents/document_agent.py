"""
Document Analysis Agent for intelligent document processing
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging

from langchain_core.messages import HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

from app.agents.base import BaseAgent, AgentState
from app.agents.tools import search_documents, get_plant_info
from app.agents.rag_tools import (
    semantic_document_search,
    hybrid_document_search,
    extract_document_insights,
    index_document
)

logger = logging.getLogger(__name__)


class DocumentAnalysisAgent(BaseAgent):
    """Agent specialized in document analysis and information extraction"""
    
    def _get_system_prompt(self) -> str:
        return """You are a Document Analysis Specialist AI for Kronos EAM system.

Your responsibilities:
1. Extract key information from energy plant documents
2. Identify document types and categorize them correctly
3. Extract dates, deadlines, and compliance requirements
4. Find relevant clauses and technical specifications
5. Cross-reference information across multiple documents

Document types you handle:
- Autorizzazione Unica (Single Authorization)
- TICA (Connection cost estimate)
- Convenzioni GSE (GSE agreements)
- Licenze UTF (Customs licenses)
- Contratti di manutenzione (Maintenance contracts)
- Certificati di collaudo (Testing certificates)

Always extract specific dates, reference numbers, and key obligations.
"""
    
    def _get_tools(self) -> List[Any]:
        """Get document analysis tools"""
        return [
            search_documents,
            get_plant_info,
            semantic_document_search,
            hybrid_document_search,
            extract_document_insights,
            index_document
        ]
    
    def _build_graph(self) -> StateGraph:
        """Build the document analysis agent graph"""
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("analyze", self._analyze_document_request)
        workflow.add_node("search", self._search_documents)
        workflow.add_node("tools", ToolNode(self._get_tools()))
        workflow.add_node("extract", self._extract_information)
        workflow.add_node("synthesize", self._synthesize_findings)
        workflow.add_node("respond", self._generate_response)
        
        # Define edges
        workflow.set_entry_point("analyze")
        
        workflow.add_edge("analyze", "search")
        workflow.add_edge("search", "tools")
        workflow.add_edge("tools", "extract")
        workflow.add_edge("extract", "synthesize")
        workflow.add_edge("synthesize", "respond")
        workflow.add_edge("respond", END)
        
        return workflow
    
    async def _analyze_document_request(self, state: AgentState) -> AgentState:
        """Analyze the document-related request"""
        try:
            messages = state["messages"]
            last_message = messages[-1].content if messages else ""
            
            # Determine document analysis intent
            response = await self.llm.ainvoke([
                {"role": "system", "content": "Identify what document information is being requested and any specific document types mentioned."},
                {"role": "user", "content": f"Request: {last_message}"}
            ])
            
            state["context"]["document_query"] = response.content
            state["current_step"] = "analysis_complete"
            
            return state
        except Exception as e:
            state["error"] = str(e)
            return state
    
    async def _search_documents(self, state: AgentState) -> AgentState:
        """Prepare document search"""
        try:
            context = state["context"]
            query = context.get("document_query", "")
            
            # Build search queries based on request
            tool_calls = []
            
            # Search for relevant documents
            search_terms = self._extract_search_terms(query)
            for term in search_terms:
                tool_calls.append({
                    "tool": "search_documents",
                    "args": {
                        "query": term,
                        "tenant_id": state["tenant_id"],
                        "impianto_id": context.get("impianto_id")
                    }
                })
            
            state["context"]["tool_calls"] = tool_calls
            state["current_step"] = "searching_documents"
            
            return state
        except Exception as e:
            state["error"] = str(e)
            return state
    
    async def _extract_information(self, state: AgentState) -> AgentState:
        """Extract key information from found documents"""
        try:
            # Get search results
            documents = self._extract_document_results(state)
            
            # Analyze document contents
            extracted_info = await self._analyze_document_contents(documents)
            
            state["context"]["extracted_information"] = extracted_info
            state["current_step"] = "extraction_complete"
            
            return state
        except Exception as e:
            state["error"] = str(e)
            return state
    
    async def _synthesize_findings(self, state: AgentState) -> AgentState:
        """Synthesize findings from document analysis"""
        try:
            extracted_info = state["context"].get("extracted_information", {})
            original_query = state["messages"][-1].content if state["messages"] else ""
            
            prompt = f"""Based on the extracted document information:
{extracted_info}

Original request: {original_query}

Provide:
1. Key findings relevant to the request
2. Important dates and deadlines found
3. Compliance requirements identified
4. Any missing documents or information gaps
5. Recommendations for document management
"""
            
            response = await self.llm.ainvoke([
                {"role": "system", "content": self._get_system_prompt()},
                {"role": "user", "content": prompt}
            ])
            
            state["context"]["synthesis"] = response.content
            state["current_step"] = "synthesis_complete"
            
            return state
        except Exception as e:
            state["error"] = str(e)
            return state
    
    async def _generate_response(self, state: AgentState) -> AgentState:
        """Generate final document analysis response"""
        try:
            synthesis = state["context"].get("synthesis", "")
            extracted_info = state["context"].get("extracted_information", {})
            
            result = {
                "summary": synthesis,
                "documents_analyzed": len(extracted_info.get("documents", [])),
                "key_dates": extracted_info.get("key_dates", []),
                "compliance_items": extracted_info.get("compliance_items", []),
                "missing_documents": extracted_info.get("missing_documents", []),
                "action_items": self._extract_action_items(synthesis)
            }
            
            state["result"] = result
            state["messages"].append(AIMessage(content=synthesis))
            state["current_step"] = "complete"
            
            return state
        except Exception as e:
            state["error"] = str(e)
            return state
    
    def _extract_search_terms(self, query: str) -> List[str]:
        """Extract search terms from the query"""
        # Key document-related terms
        document_keywords = [
            "autorizzazione", "tica", "convenzione", "contratto",
            "licenza", "certificato", "collaudo", "gse", "terna"
        ]
        
        search_terms = []
        query_lower = query.lower()
        
        # Add matching keywords
        for keyword in document_keywords:
            if keyword in query_lower:
                search_terms.append(keyword)
        
        # If no specific keywords, use general terms
        if not search_terms:
            search_terms = ["documento", "autorizzazione", "contratto"]
        
        return search_terms[:3]  # Limit to 3 searches
    
    def _extract_document_results(self, state: AgentState) -> List[Dict[str, Any]]:
        """Extract document search results from state"""
        documents = []
        
        for msg in state["messages"]:
            if hasattr(msg, "tool_calls_results"):
                for result in msg.tool_calls_results:
                    if result.get("tool_name") == "search_documents":
                        docs = result.get("output", [])
                        if isinstance(docs, list):
                            documents.extend(docs)
        
        # Remove duplicates based on document ID
        seen = set()
        unique_docs = []
        for doc in documents:
            if doc.get("id") not in seen:
                seen.add(doc.get("id"))
                unique_docs.append(doc)
        
        return unique_docs
    
    async def _analyze_document_contents(self, documents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze document contents to extract key information"""
        extracted = {
            "documents": documents,
            "key_dates": [],
            "compliance_items": [],
            "technical_specs": [],
            "missing_documents": []
        }
        
        # Extract dates from documents
        for doc in documents:
            if doc.get("data_scadenza"):
                extracted["key_dates"].append({
                    "document": doc.get("nome"),
                    "type": "expiration",
                    "date": doc.get("data_scadenza"),
                    "days_until": self._calculate_days_until(doc.get("data_scadenza"))
                })
        
        # Identify compliance-related documents
        compliance_types = ["autorizzazione", "licenza", "certificato", "convenzione"]
        for doc in documents:
            doc_name_lower = doc.get("nome", "").lower()
            if any(comp_type in doc_name_lower for comp_type in compliance_types):
                extracted["compliance_items"].append({
                    "document": doc.get("nome"),
                    "type": doc.get("tipo"),
                    "status": doc.get("stato"),
                    "category": doc.get("categoria")
                })
        
        # Check for missing critical documents
        critical_docs = {
            "autorizzazione_unica": "Autorizzazione Unica",
            "tica": "TICA",
            "convenzione_gse": "Convenzione GSE",
            "licenza_utf": "Licenza UTF"
        }
        
        found_types = {doc.get("tipo", "").lower() for doc in documents}
        for doc_type, doc_name in critical_docs.items():
            if doc_type not in found_types:
                extracted["missing_documents"].append(doc_name)
        
        return extracted
    
    def _calculate_days_until(self, date_str: Optional[str]) -> int:
        """Calculate days until a date"""
        if not date_str:
            return -1
        try:
            target_date = datetime.fromisoformat(date_str)
            days = (target_date - datetime.utcnow()).days
            return days
        except:
            return -1
    
    def _extract_action_items(self, synthesis: str) -> List[Dict[str, Any]]:
        """Extract action items from synthesis"""
        actions = []
        
        # Look for action keywords in synthesis
        action_keywords = ["renew", "update", "submit", "obtain", "verify", "check"]
        
        lines = synthesis.split('\n')
        for line in lines:
            line_lower = line.lower()
            if any(keyword in line_lower for keyword in action_keywords):
                actions.append({
                    "action": line.strip(),
                    "type": "document_management"
                })
        
        return actions[:5]  # Top 5 actions
    
    async def extract_from_pdf(self, document_id: int, extraction_type: str = "full") -> Dict[str, Any]:
        """Extract information from a PDF document (placeholder for OCR integration)"""
        try:
            # This would integrate with OCR/document processing services
            # For now, return structured placeholder
            return {
                "document_id": document_id,
                "extraction_type": extraction_type,
                "extracted_data": {
                    "parties": ["Example Energy Company", "Distribution Operator"],
                    "dates": {
                        "signature": "2024-01-15",
                        "validity_start": "2024-02-01",
                        "validity_end": "2034-02-01"
                    },
                    "technical_data": {
                        "connection_point": "POD IT001E12345678",
                        "voltage": "20 kV",
                        "power": "999 kW"
                    },
                    "obligations": [
                        "Annual production data submission",
                        "Maintain grid code compliance",
                        "Insurance coverage requirements"
                    ]
                },
                "confidence_score": 0.95
            }
        except Exception as e:
            logger.error(f"Error extracting from PDF: {e}")
            return {"error": str(e)}