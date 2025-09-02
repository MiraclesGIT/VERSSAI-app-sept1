#!/bin/bash
echo "Starting VERSSAI development environment..."

# Start frontend
cd frontend
npm start &
FRONTEND_PID=$!

echo "Frontend started at http://localhost:3000"
echo "Press Ctrl+C to stop"
wait $FRONTEND_PID
