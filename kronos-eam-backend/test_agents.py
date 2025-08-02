#!/usr/bin/env python3
"""
Test script for LangGraph agents
"""

import asyncio
import os
from datetime import datetime

# Add project root to path
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.agent_service import agent_service, AgentType


async def test_agents():
    """Test all agent types with sample queries"""
    
    # Test data
    tenant_id = "demo_tenant"
    user_id = "test_user"
    
    test_cases = [
        {
            "agent_type": AgentType.MAINTENANCE,
            "message": "What maintenance is scheduled for Plant Roma 1 in the next month?",
            "context": {"impianto_id": 1}
        },
        {
            "agent_type": AgentType.COMPLIANCE,
            "message": "Check compliance status for all my power plants and identify any expiring documents",
            "context": {}
        },
        {
            "agent_type": AgentType.ENERGY,
            "message": "Analyze the production efficiency trends for the last quarter and suggest optimizations",
            "context": {"impianto_id": 1}
        },
        {
            "agent_type": AgentType.DOCUMENT,
            "message": "Find all authorization documents that are expiring in the next 30 days",
            "context": {}
        },
        {
            "agent_type": AgentType.WORKFLOW,
            "message": "Guide me through the process of activating a new solar plant with GSE",
            "context": {}
        }
    ]
    
    print(f"\n{'='*60}")
    print(f"Testing LangGraph Agents - {datetime.now()}")
    print(f"{'='*60}\n")
    
    # First test agent type detection
    print("Testing automatic agent type detection...")
    test_messages = [
        "I need to schedule maintenance for next week",
        "Show me compliance requirements for GSE",
        "How can I improve energy production?",
        "Extract information from my authorization documents",
        "What's the workflow for connecting to the grid?"
    ]
    
    for msg in test_messages:
        detected_type = agent_service._detect_agent_type(msg)
        print(f"  Message: '{msg[:50]}...'")
        print(f"  Detected: {detected_type}")
        print()
    
    print(f"\n{'='*60}")
    print("Testing agent invocations...")
    print(f"{'='*60}\n")
    
    # Test each agent
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{'-'*50}")
        print(f"Test {i}: {test_case['agent_type'].value.title()} Agent")
        print(f"{'-'*50}")
        print(f"Query: {test_case['message']}")
        print(f"Context: {test_case['context']}")
        
        try:
            # Process message
            result = await agent_service.process_message(
                message=test_case['message'],
                tenant_id=tenant_id,
                user_id=user_id,
                agent_type=test_case['agent_type'],
                context=test_case['context']
            )
            
            print(f"\nResult:")
            print(f"  Success: {result.get('success', False)}")
            print(f"  Agent Type: {result.get('agent_type', 'unknown')}")
            
            if result.get('success'):
                response_data = result.get('result', {})
                if isinstance(response_data, dict):
                    for key, value in response_data.items():
                        print(f"  {key}: {str(value)[:100]}...")
                else:
                    print(f"  Response: {str(response_data)[:200]}...")
            else:
                print(f"  Error: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"\nError testing {test_case['agent_type']}: {str(e)}")
            import traceback
            traceback.print_exc()
    
    # Test agent capabilities
    print(f"\n{'='*60}")
    print("Agent Capabilities")
    print(f"{'='*60}\n")
    
    capabilities = await agent_service.get_agent_capabilities()
    for agent_type, caps in capabilities.items():
        print(f"\n{agent_type}: {caps.get('name', 'Unknown')}")
        print(f"Description: {caps.get('description', 'No description')}")
        print("Capabilities:")
        for cap in caps.get('capabilities', []):
            print(f"  - {cap}")
        print("Example queries:")
        for query in caps.get('example_queries', [])[:2]:
            print(f"  - {query}")


if __name__ == "__main__":
    # Check for required environment variables
    required_vars = ["GOOGLE_API_KEY", "DATABASE_URL"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"Error: Missing required environment variables: {', '.join(missing_vars)}")
        print("\nPlease set:")
        for var in missing_vars:
            print(f"  export {var}='your-value-here'")
        sys.exit(1)
    
    # Run tests
    asyncio.run(test_agents())