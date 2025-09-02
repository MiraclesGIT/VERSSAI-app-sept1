#!/bin/bash
echo "Starting VERSSAI System..."

# Start backend
cd backend
source venv/bin/activate
python3 server.py &

# Start frontend  
cd ../frontend
npm start &

echo "System starting on:"
echo "- Backend: http://localhost:8080"
echo "- Frontend: http://localhost:3000"
echo "- API Docs: http://localhost:8080/docs"
