#!/bin/bash
#
# Find and analyze existing service account keys
# This helps identify what keys you already have
#

echo "🔍 Finding Service Account Keys"
echo ""

# Common locations to search
SEARCH_PATHS=(
    ~
    ~/.config/gcloud
    ~/Downloads
    ~/Documents
    .
    ./deploy
    /tmp
)

echo "Searching for Google service account key files..."
echo "(Looking for .json files with typical GCP service account structure)"
echo ""

# Find potential key files
KEY_FILES=()
for path in "${SEARCH_PATHS[@]}"; do
    if [ -d "$path" ]; then
        while IFS= read -r file; do
            # Check if it's a service account key by looking for key fields
            if grep -q '"type".*:.*"service_account"' "$file" 2>/dev/null && \
               grep -q '"client_email"' "$file" 2>/dev/null && \
               grep -q '"private_key"' "$file" 2>/dev/null; then
                KEY_FILES+=("$file")
            fi
        done < <(find "$path" -maxdepth 2 -name "*.json" -type f 2>/dev/null)
    fi
done

# Remove duplicates
KEY_FILES=($(printf "%s\n" "${KEY_FILES[@]}" | sort -u))

if [ ${#KEY_FILES[@]} -eq 0 ]; then
    echo "❌ No service account key files found"
    echo ""
    echo "This means you'll need to:"
    echo "1. Create a new key from an existing service account, OR"
    echo "2. Get the key from whoever set up the project originally"
else
    echo "✅ Found ${#KEY_FILES[@]} service account key file(s):"
    echo ""
    
    for i in "${!KEY_FILES[@]}"; do
        file="${KEY_FILES[$i]}"
        echo "[$((i+1))] $file"
        
        # Extract key information
        if [ -r "$file" ]; then
            client_email=$(grep -o '"client_email"[[:space:]]*:[[:space:]]*"[^"]*"' "$file" | cut -d'"' -f4)
            project_id=$(grep -o '"project_id"[[:space:]]*:[[:space:]]*"[^"]*"' "$file" | cut -d'"' -f4)
            
            echo "    Service Account: $client_email"
            echo "    Project: $project_id"
            echo "    File modified: $(stat -c %y "$file" 2>/dev/null || stat -f %m "$file" 2>/dev/null || echo "unknown")"
        else
            echo "    (Cannot read file)"
        fi
        echo ""
    done
    
    echo "💡 To use one of these keys:"
    echo "1. Verify it's for the correct project (kronos-eam-prod)"
    echo "2. Check if it's for a deployment service account (e.g., kronos-deploy@...)"
    echo "3. Copy its content: cat <filename>"
    echo "4. Update GitHub secret GCP_SA_KEY with the content"
fi

echo ""
echo "📋 Checking environment variables for keys..."
if [ -n "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo "GOOGLE_APPLICATION_CREDENTIALS is set to: $GOOGLE_APPLICATION_CREDENTIALS"
    if [ -f "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
        echo "✅ File exists"
        client_email=$(grep -o '"client_email"[[:space:]]*:[[:space:]]*"[^"]*"' "$GOOGLE_APPLICATION_CREDENTIALS" | cut -d'"' -f4)
        echo "   Service Account: $client_email"
    else
        echo "❌ File does not exist"
    fi
else
    echo "GOOGLE_APPLICATION_CREDENTIALS is not set"
fi

echo ""
echo "🔐 Active gcloud credentials:"
gcloud auth list --format="table(account,status)" 2>/dev/null || echo "Cannot list gcloud credentials"

echo ""