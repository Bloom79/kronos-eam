#!/usr/bin/env python3
"""
Fix Italian field names in document_templates.py
"""
import re

# Read the file
with open('/home/bloom/sentrics/kronos-eam-backend/app/data/document_templates.py', 'r') as f:
    content = f.read()

# Replace Italian field names with English
replacements = {
    '"nome":': '"name":',
    '"descrizione":': '"description":',
    '"categoria":': '"category":',
    '"tipo":': '"type":',
}

for italian, english in replacements.items():
    content = content.replace(italian, english)

# Write back
with open('/home/bloom/sentrics/kronos-eam-backend/app/data/document_templates.py', 'w') as f:
    f.write(content)

print("Fixed document_templates.py")