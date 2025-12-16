#!/bin/bash

# Function to kill processes on exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit
}

# Trap Ctrl+C
trap cleanup SIGINT

echo "🚀 Starting Peers Event Planner..."

# Start Backend
echo "Starting Backend (Port 8000)..."
cd backend/fast_api_approach
# Check if venv exists, if so activate it (optional but good practice)
if [ -d "venv" ]; then
    source venv/bin/activate
fi
python3 -m uvicorn src.main:app --reload --port 8000 &
BACKEND_PID=$!

# Wait a moment for backend to init
sleep 2

# Start Frontend
echo "Starting Frontend (Port 5173)..."
cd ../../frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ Both servers are running!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "Press Ctrl+C to stop both."

wait
