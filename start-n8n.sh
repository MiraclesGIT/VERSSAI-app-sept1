#!/bin/bash

# N8N Startup Script for VERSSAI VC Intelligence Platform
cd /app

# Set environment variables
export N8N_BASIC_AUTH_ACTIVE=true
export N8N_BASIC_AUTH_USER=verssai
export N8N_BASIC_AUTH_PASSWORD=verssai2024!
export N8N_HOST=0.0.0.0
export N8N_PORT=5678
export N8N_PROTOCOL=http
export N8N_USER_FOLDER=/app/n8n-data
export WEBHOOK_URL=https://6ba2da35-de59-4fa1-b62b-c6f198fa8fe5.preview.emergentagent.com/webhook/
export N8N_SECURE_COOKIE=false
export N8N_COOKIES_SECURE=false
export EXECUTIONS_DATA_SAVE_ON_ERROR=all
export EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
export EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true

# Create necessary directories
mkdir -p /app/n8n-data
mkdir -p /app/n8n-data/logs

# Start N8N
echo "Starting N8N for VERSSAI VC Intelligence Platform..."
./node_modules/.bin/n8n start