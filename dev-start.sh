#!/bin/bash
echo "Starting VERSSAI full development environment..."

# Start backend
echo "Starting backend server..."
cd backend
python3 server.py &
BACKEND_PID=$!

# Start frontend
echo "Starting frontend..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "Backend running (PID: $BACKEND_PID) at http://localhost:8080"
echo "Frontend running (PID: $FRONTEND_PID) at http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo "Stopping all services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT
wait
