"""
WebSocket connection manager for real-time notifications
"""

from typing import Dict, List
from fastapi import WebSocket
import json


class ConnectionManager:
    """Manages WebSocket connections for real-time updates"""
    
    def __init__(self):
        # Maps tenant_id to list of active connections
        self.active_connections: Dict[int, List[WebSocket]] = {}
        # Maps connection to user info
        self.connection_users: Dict[WebSocket, Dict] = {}
    
    async def connect(self, websocket: WebSocket, tenant_id: int, user_id: int):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        
        # Add to tenant connections
        if tenant_id not in self.active_connections:
            self.active_connections[tenant_id] = []
        self.active_connections[tenant_id].append(websocket)
        
        # Store user info
        self.connection_users[websocket] = {
            "tenant_id": tenant_id,
            "user_id": user_id
        }
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        # Get user info
        user_info = self.connection_users.get(websocket)
        if not user_info:
            return
        
        tenant_id = user_info["tenant_id"]
        
        # Remove from tenant connections
        if tenant_id in self.active_connections:
            self.active_connections[tenant_id].remove(websocket)
            if not self.active_connections[tenant_id]:
                del self.active_connections[tenant_id]
        
        # Remove user info
        del self.connection_users[websocket]
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        """Send a message to a specific connection"""
        await websocket.send_text(message)
    
    async def broadcast_to_tenant(self, tenant_id: int, message: dict):
        """Broadcast a message to all connections in a tenant"""
        if tenant_id not in self.active_connections:
            return
        
        message_text = json.dumps(message)
        
        # Send to all connections in tenant
        disconnected = []
        for connection in self.active_connections[tenant_id]:
            try:
                await connection.send_text(message_text)
            except:
                # Connection is closed
                disconnected.append(connection)
        
        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(connection)
    
    async def send_to_user(self, tenant_id: int, user_id: int, message: dict):
        """Send a message to a specific user"""
        if tenant_id not in self.active_connections:
            return
        
        message_text = json.dumps(message)
        
        # Find connections for this user
        for connection in self.active_connections[tenant_id]:
            user_info = self.connection_users.get(connection)
            if user_info and user_info["user_id"] == user_id:
                try:
                    await connection.send_text(message_text)
                except:
                    # Connection is closed
                    self.disconnect(connection)


# Global connection manager instance
manager = ConnectionManager()