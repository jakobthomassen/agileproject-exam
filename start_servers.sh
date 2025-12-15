#!/bin/bash

echo "Starting Backend..."
# Start backend in background
(cd backend/fast_api_approach && uvicorn src.main:app --reload) &

echo "Starting Frontend..."
# Start frontend in background
(cd frontend && npm run dev) &

echo "Both servers launched."
wait
