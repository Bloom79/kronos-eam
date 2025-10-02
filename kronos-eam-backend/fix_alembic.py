#!/usr/bin/env python3
"""Fix alembic version in database"""

import os
import psycopg2
from urllib.parse import urlparse

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://kronos:kronos_password@localhost:5432/kronos_eam")

# Parse the URL
url = urlparse(DATABASE_URL)

# Connect to database
conn = psycopg2.connect(
    host=url.hostname,
    port=url.port or 5432,
    database=url.path[1:],
    user=url.username,
    password=url.password
)

try:
    with conn.cursor() as cur:
        # Check current version
        cur.execute("SELECT version_num FROM alembic_version")
        result = cur.fetchone()
        print(f"Current version: {result}")
        
        if result and result[0] == 'f2d81f9341a6':
            # Update to the correct version
            cur.execute("UPDATE alembic_version SET version_num = '001_complete_initial'")
            conn.commit()
            print("Updated alembic version to 001_complete_initial")
        else:
            print("No update needed")
            
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()