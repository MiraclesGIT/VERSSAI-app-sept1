#!/bin/bash

# VERSSAI Version Management Setup
echo "🔄 Setting up VERSSAI Version Management System..."

# Create a comprehensive .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Production builds
/frontend/build
/backend/dist

# Environment files
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
env.bak/
venv.bak/

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# N8N data (keep configs, not runtime data)
n8n/data/
n8n/.n8n/

# Temporary files
*.tmp
*.temp
.temp/

# Large datasets (keep references, not actual files)
*.xlsx
*.csv
*.json.bak

# Service files
*.pid
verssai_services.pid

# Test outputs
test_results/
*.test.log
EOF

echo "✅ .gitignore created"

# Initialize git if not already done
if [ ! -d ".git" ]; then
    git init
    echo "✅ Git repository initialized"
fi

# Configure git user if not set
if [ -z "$(git config user.name)" ]; then
    git config user.name "VERSSAI Developer"
    git config user.email "developer@verssai.local"
    echo "✅ Git user configured"
fi

echo "🔄 Git setup complete!"
