# GitHub Secrets Values

## Important: Add these secrets to your GitHub repository

### 1. GCP_PROJECT_ID
```
kronos-eam-prod-20250802
```

### 2. DB_PASSWORD
```
KronosAdmin2024!
```

### 3. GCP_SA_KEY
Copy the ENTIRE contents of the service account key file (including the curly braces).
The file is located at: ~/kronos-sa-key.json

You can view it with:
```bash
cat ~/kronos-sa-key.json
```

## How to add secrets:
1. Go to: https://github.com/Bloom79/kronos-eam/settings/secrets/actions
2. Click "New repository secret"
3. Add each secret with the exact names above

## Next Steps:
After creating the repository and adding secrets:
1. Push the code with: `git push -u origin main`
2. The deployment will start automatically
3. Monitor progress at: https://github.com/Bloom79/kronos-eam/actions