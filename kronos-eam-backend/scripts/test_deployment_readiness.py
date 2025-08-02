#!/usr/bin/env python3
"""
Test Deployment Readiness
Verifies that all components are ready for deployment
"""

import os
import sys
import json
from pathlib import Path

# Color codes for output
GREEN = '\033[0;32m'
RED = '\033[0;31m'
YELLOW = '\033[1;33m'
NC = '\033[0m'  # No Color

def check_file_exists(filepath, description):
    """Check if a required file exists"""
    if Path(filepath).exists():
        print(f"{GREEN}✓{NC} {description}: {filepath}")
        return True
    else:
        print(f"{RED}✗{NC} {description}: {filepath} - NOT FOUND")
        return False

def check_json_valid(filepath, description):
    """Check if JSON file is valid"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            json.load(f)
        print(f"{GREEN}✓{NC} {description}: Valid JSON")
        return True
    except Exception as e:
        print(f"{RED}✗{NC} {description}: Invalid JSON - {str(e)}")
        return False

def main():
    """Run deployment readiness checks"""
    print("\n" + "="*60)
    print("DEPLOYMENT READINESS CHECK")
    print("="*60)
    
    checks_passed = True
    
    # Check backend files
    print("\n## Backend Checks")
    print("-" * 40)
    
    backend_files = [
        ("requirements.txt", "Python dependencies"),
        ("Dockerfile", "Backend Dockerfile"),
        ("entrypoint.sh", "Backend entrypoint script"),
        ("alembic/versions/001_complete_initial_schema.py", "Database migration"),
        ("scripts/init_data.py", "Data initialization script"),
    ]
    
    for filepath, desc in backend_files:
        full_path = f"/home/bloom/sentrics/kronos-eam-backend/{filepath}"
        if not check_file_exists(full_path, desc):
            checks_passed = False
    
    # Check frontend files
    print("\n## Frontend Checks")
    print("-" * 40)
    
    frontend_files = [
        ("package.json", "NPM dependencies"),
        ("Dockerfile", "Frontend Dockerfile"),
        ("nginx.conf", "Nginx configuration"),
        ("src/config/portalUrls.ts", "Portal URLs configuration"),
    ]
    
    for filepath, desc in frontend_files:
        full_path = f"/home/bloom/sentrics/kronos-eam-react/{filepath}"
        if not check_file_exists(full_path, desc):
            checks_passed = False
    
    # Check translation files
    print("\n## Translation Checks")
    print("-" * 40)
    
    translation_files = [
        "kronos-eam-react/src/i18n/locales/it/plants.json",
        "kronos-eam-react/src/i18n/locales/en/plants.json",
        "kronos-eam-react/src/i18n/locales/it/common.json",
        "kronos-eam-react/src/i18n/locales/en/common.json",
    ]
    
    for filepath in translation_files:
        full_path = f"/home/bloom/sentrics/{filepath}"
        if Path(full_path).exists():
            if not check_json_valid(full_path, f"Translation file {Path(filepath).name}"):
                checks_passed = False
        else:
            print(f"{RED}✗{NC} Translation file missing: {filepath}")
            checks_passed = False
    
    # Check deployment files
    print("\n## Deployment Configuration")
    print("-" * 40)
    
    deployment_files = [
        (".github/workflows/deploy.yml", "GitHub Actions workflow"),
        ("deploy/gcp-setup.sh", "GCP setup script"),
        ("DEPLOYMENT_GUIDE.md", "Deployment guide"),
        ("DEPLOYMENT_CHECKLIST.md", "Deployment checklist"),
    ]
    
    for filepath, desc in deployment_files:
        full_path = f"/home/bloom/sentrics/{filepath}"
        if not check_file_exists(full_path, desc):
            checks_passed = False
    
    # Summary
    print("\n## Summary")
    print("-" * 40)
    
    if checks_passed:
        print(f"{GREEN}✓ All deployment checks passed!{NC}")
        print("\nNext steps:")
        print("1. Initialize git repository")
        print("2. Commit all changes")
        print("3. Push to GitHub")
        print("4. Set up GitHub secrets")
        print("5. Run deployment")
        return 0
    else:
        print(f"{RED}✗ Some checks failed. Please fix the issues above.{NC}")
        return 1

if __name__ == "__main__":
    sys.exit(main())