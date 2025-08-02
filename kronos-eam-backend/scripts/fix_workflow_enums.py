#!/usr/bin/env python3
"""
Fix workflow template enum values in database
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.core.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fix_enums():
    """Fix enum values to be uppercase"""
    engine = create_engine(str(settings.DATABASE_URL))
    
    with engine.connect() as conn:
        try:
            # First, let's see what we have
            result = conn.execute(text("SELECT id, nome, categoria FROM workflow_templates"))
            templates = result.fetchall()
            
            logger.info(f"Found {len(templates)} templates")
            for t in templates:
                logger.info(f"Template {t[0]}: {t[1]} - Category: {t[2]}")
            
            # Update to uppercase
            updates = [
                ("Attivazione", "ATTIVAZIONE"),
                ("Fiscale", "FISCALE"),
                ("Incentivi", "INCENTIVI"),
                ("Variazioni", "VARIAZIONI"),
                ("Maintenance", "MANUTENZIONE"),
                ("Compliance", "COMPLIANCE")
            ]
            
            for old, new in updates:
                result = conn.execute(
                    text("UPDATE workflow_templates SET categoria = :new WHERE categoria = :old"),
                    {"old": old, "new": new}
                )
                if result.rowcount > 0:
                    logger.info(f"Updated {result.rowcount} templates from {old} to {new}")
            
            conn.commit()
            
            # Verify the fix
            result = conn.execute(text("SELECT id, nome, categoria FROM workflow_templates"))
            templates = result.fetchall()
            
            logger.info("\nAfter fix:")
            for t in templates:
                logger.info(f"Template {t[0]}: {t[1]} - Category: {t[2]}")
                
        except Exception as e:
            logger.error(f"Error fixing enums: {e}")
            conn.rollback()
            raise

if __name__ == "__main__":
    fix_enums()