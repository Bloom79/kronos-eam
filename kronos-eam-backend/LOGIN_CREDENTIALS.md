# Kronos EAM Login Credentials

## Available Users

### User 1: Demo Admin
- **Email**: `demo@kronos-eam.local`
- **Password**: `Demo123!`
- **Role**: Admin
- **Tenant**: demo

### User 2: Mario Rossi
- **Email**: `mario.rossi@energysolutions.it`
- **Password**: `Demo123!`
- **Role**: Admin
- **Tenant**: demo

## How to Login

### Via API (cURL)
```bash
# Login with Mario Rossi
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=mario.rossi@energysolutions.it&password=Demo123!"

# Login with Demo Admin
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=demo@kronos-eam.local&password=Demo123!"
```

### Via Frontend
1. Navigate to http://localhost:3000
2. Click on "Login" or go to http://localhost:3000/login
3. Enter one of the email/password combinations above
4. Click "Sign In"

## Important Notes

1. **Multi-Tenant System**: This is a multi-tenant system. The backend uses "demo" as the default tenant ID.

2. **Password Security**: The password "Demo123!" was set for testing purposes. In production, use strong, unique passwords.

3. **Token Expiry**: Access tokens expire after 30 minutes. Use the refresh token to get a new access token.

4. **Frontend Storage**: The frontend stores tokens in localStorage under these keys:
   - `kronos_access_token`
   - `kronos_refresh_token`
   - `kronos_user_data`

## Troubleshooting

### Login Fails with "Incorrect email or password"
1. Check that the backend is running: `curl http://localhost:8000/health`
2. Verify the user exists: Run the `check_users.py` script
3. Reset password if needed: Run the `update_all_passwords.py` script

### Frontend Can't Connect
1. Ensure backend is running on port 8000
2. Check CORS is configured for http://localhost:3000
3. Clear browser localStorage and try again

## Scripts for User Management

Located in `/home/bloom/sentrics/kronos-eam-backend/`:
- `check_users.py` - List all users in the database
- `update_all_passwords.py` - Reset all demo tenant passwords to "Demo123!"
- `ensure_demo_user.py` - Ensure Mario Rossi user exists with correct password