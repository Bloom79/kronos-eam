"""
File storage backend for document management
"""

from pathlib import Path
from datetime import datetime
import hashlib
import os

from app.core.config import settings


class StorageBackend:
    """File storage backend implementation"""
    
    def __init__(self):
        self.base_path = Path(settings.UPLOAD_PATH)
        self.base_path.mkdir(parents=True, exist_ok=True)
    
    def store_file(
        self,
        content: bytes,
        filename: str,
        tenant_id: int,
        subfolder: str = ""
    ) -> str:
        """Store file and return path"""
        # Create tenant directory
        tenant_path = self.base_path / str(tenant_id) / subfolder
        tenant_path.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        unique_filename = f"{timestamp}_{filename}"
        
        file_path = tenant_path / unique_filename
        
        # Write file
        with open(file_path, 'wb') as f:
            f.write(content)
        
        # Return relative path
        return str(file_path.relative_to(self.base_path))
    
    def retrieve_file(self, file_path: str) -> bytes:
        """Retrieve file content"""
        full_path = self.base_path / file_path
        
        if not full_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        with open(full_path, 'rb') as f:
            return f.read()
    
    def delete_file(self, file_path: str):
        """Delete file"""
        full_path = self.base_path / file_path
        
        if full_path.exists():
            full_path.unlink()
    
    def get_file_url(self, file_path: str) -> str:
        """Get URL for file access"""
        # In production, this would return a signed URL from cloud storage
        return f"/api/v1/documents/download/{file_path}"
    
    def file_exists(self, file_path: str) -> bool:
        """Check if file exists"""
        full_path = self.base_path / file_path
        return full_path.exists()