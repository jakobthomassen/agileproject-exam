@echo off
setlocal

echo Starting Backend...
start "Backend Server" cmd /k "cd backend && uvicorn app.main:app --reload"

echo Starting Frontend...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo Both servers launched.
endlocal
