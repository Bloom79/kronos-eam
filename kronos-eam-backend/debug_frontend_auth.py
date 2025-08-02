#!/usr/bin/env python3
"""
Debug frontend authentication issue
"""

print("=== Frontend Authentication Debugging ===\n")

print("1. Make sure you're logged in at http://localhost:3000")
print("2. Open browser Developer Tools (F12)")
print("3. Go to Console tab")
print("4. Run these commands to check authentication:")
print()
print("// Check if tokens are stored:")
print("localStorage.getItem('access_token')")
print("localStorage.getItem('refresh_token')")
print("localStorage.getItem('user_data')")
print()
print("// Check API call directly:")
print("fetch('http://localhost:8000/api/v1/plants/', {")
print("  headers: {")
print("    'Authorization': 'Bearer ' + localStorage.getItem('access_token'),")
print("    'X-Tenant-ID': 'demo'")
print("  }")
print("}).then(r => r.json()).then(console.log)")
print()
print("5. Check Network tab to see if plants API calls are being made")
print("6. Look for any CORS errors in the console")
print()
print("Common issues:")
print("- If tokens are null, you need to login first")
print("- If you see CORS errors, the backend might need CORS configuration")
print("- If you see 401 errors, the token might be expired or invalid")