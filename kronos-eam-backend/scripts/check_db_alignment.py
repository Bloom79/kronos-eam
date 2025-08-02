#!/usr/bin/env python3
"""
Database Alignment Check Script
Verifies that the current database schema matches Alembic migrations
"""

import sys
import os
from pathlib import Path
from typing import Dict, List, Tuple
from sqlalchemy import create_engine, text
import logging
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseAlignmentChecker:
    """Check database alignment with Alembic migrations"""
    
    def __init__(self):
        self.engine = None
        self.issues = []
        
    def connect(self):
        """Connect to the database"""
        try:
            self.engine = create_engine(str(settings.DATABASE_URL))
            logger.info(f"Connected to database")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise
            
    def close(self):
        """Close database connection"""
        if self.engine:
            self.engine.dispose()
            
    def check_alembic_version(self) -> str:
        """Check current Alembic migration version"""
        with self.engine.connect() as conn:
            result = conn.execute(text("SELECT version_num FROM alembic_version")).fetchone()
            return result[0] if result else None
            
    def check_enum_types(self) -> Dict[str, List[str]]:
        """Get all enum types and their values"""
        with self.engine.connect() as conn:
            # Get all enum types
            result = conn.execute(text("""
                SELECT t.typname as enum_name, 
                       array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
                FROM pg_type t 
                JOIN pg_enum e ON t.oid = e.enumtypid  
                WHERE t.typname LIKE '%enum'
                GROUP BY t.typname
                ORDER BY t.typname
            """))
            
            enums = {}
            for row in result:
                enums[row[0]] = row[1]
            return enums
            
    def check_expected_enums(self) -> Dict[str, List[str]]:
        """Define expected enum values based on migrations"""
        return {
            'userroleenum': ['Admin', 'Asset Manager', 'Plant Owner', 'Operator', 'Viewer'],
            'plantstatusenum': ['In Operation', 'In Authorization', 'Under Construction', 'Decommissioned'],
            'planttypeenum': ['Photovoltaic', 'Wind', 'Hydroelectric', 'Biomass', 'Geothermal'],
            'workflowstatusenum': ['Draft', 'Active', 'Paused', 'Completed', 'Cancelled'],
            'taskstatusenum': ['To Start', 'In Progress', 'Completed', 'Delayed', 'Blocked'],
            'entityenum': ['DSO', 'Terna', 'GSE', 'Customs', 'Municipality', 'Region', 'Superintendence'],
        }
        
    def check_data_formats(self) -> List[Tuple[str, str, str]]:
        """Check for old data formats that need migration"""
        issues = []
        
        with self.engine.connect() as conn:
            # Check plant status values
            result = conn.execute(text("""
                SELECT id, name, status, type 
                FROM plants 
                WHERE status LIKE '%_%' OR type LIKE '%_%'
            """))
            
            for row in result:
                if '_' in row[2]:  # status
                    issues.append(('plants', f"id={row[0]}", f"status='{row[2]}' (should be space-separated)"))
                if '_' in row[3]:  # type
                    issues.append(('plants', f"id={row[0]}", f"type='{row[3]}' (should be space-separated)"))
                    
        return issues
        
    def check_tables(self) -> List[str]:
        """Get list of all tables"""
        with self.engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name
            """))
            return [row[0] for row in result]
            
    def generate_report(self):
        """Generate alignment report"""
        print("\n" + "="*60)
        print("DATABASE ALIGNMENT REPORT")
        print("="*60)
        print(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Check Alembic version
        version = self.check_alembic_version()
        print(f"\nCurrent Migration: {version}")
        
        # Check tables
        tables = self.check_tables()
        print(f"\nTotal Tables: {len(tables)}")
        
        # Check enums
        current_enums = self.check_enum_types()
        expected_enums = self.check_expected_enums()
        
        print("\n## ENUM ALIGNMENT")
        print("-" * 40)
        
        enum_issues = []
        for enum_name, expected_values in expected_enums.items():
            current_values = current_enums.get(enum_name, [])
            
            print(f"\n{enum_name}:")
            
            # Check for missing values
            missing = set(expected_values) - set(current_values)
            if missing:
                print(f"  ❌ Missing values: {', '.join(missing)}")
                enum_issues.append(f"{enum_name}: missing {missing}")
            
            # Check for extra values
            extra = set(current_values) - set(expected_values)
            if extra:
                print(f"  ⚠️  Extra values: {', '.join(extra)}")
                
            # Check order
            if set(current_values) == set(expected_values) and current_values != expected_values:
                print(f"  ⚠️  Different order")
                
            if not missing and not extra:
                print(f"  ✅ Aligned")
                
        # Check data formats
        print("\n## DATA FORMAT ISSUES")
        print("-" * 40)
        
        format_issues = self.check_data_formats()
        if format_issues:
            for table, identifier, issue in format_issues:
                print(f"  ❌ {table}.{identifier}: {issue}")
        else:
            print("  ✅ No format issues found")
            
        # Summary
        print("\n## SUMMARY")
        print("-" * 40)
        
        total_issues = len(enum_issues) + len(format_issues)
        if total_issues == 0:
            print("✅ Database is fully aligned with migrations")
        else:
            print(f"❌ Found {total_issues} alignment issues:")
            print(f"   - Enum issues: {len(enum_issues)}")
            print(f"   - Data format issues: {len(format_issues)}")
            
        return total_issues
        
def main():
    """Main function"""
    checker = DatabaseAlignmentChecker()
    
    try:
        checker.connect()
        issues_count = checker.generate_report()
        
        # Exit with error code if issues found
        sys.exit(0 if issues_count == 0 else 1)
        
    except Exception as e:
        logger.error(f"Alignment check failed: {e}")
        sys.exit(2)
    finally:
        checker.close()
        
if __name__ == "__main__":
    main()