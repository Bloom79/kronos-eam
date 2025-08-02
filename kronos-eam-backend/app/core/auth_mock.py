"""
Mock authentication for local development
"""

from typing import Optional

class TokenData:
    """Mock token data"""
    def __init__(self, user_id: str = "local_user", tenant_id: str = "demo"):
        self.user_id = user_id
        self.tenant_id = tenant_id
        self.email = f"{user_id}@local.test"
        self.is_active = True

async def get_current_active_user() -> TokenData:
    """Mock authentication dependency"""
    return TokenData()

def get_current_user_flexible():
    """Mock flexible user getter"""
    return TokenData()