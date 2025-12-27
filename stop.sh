#!/bin/bash

# Stop script for Image Pro (Unix/Linux/macOS)

echo "🛑 Stopping Image Pro servers..."

# Kill processes by PID if .pids file exists
if [ -f .pids ]; then
    while read pid; do
        kill $pid 2>/dev/null && echo "   Stopped process $pid"
    done < .pids
    rm -f .pids
fi

# Kill by port (fallback)
echo "   Checking ports..."

# Kill process on port 8000 (Python API)
PORT_8000=$(lsof -ti:8000)
if [ ! -z "$PORT_8000" ]; then
    kill -9 $PORT_8000 2>/dev/null
    echo "   Stopped Python API (port 8000)"
fi

# Kill process on port 3000 (Next.js)
PORT_3000=$(lsof -ti:3000)
if [ ! -z "$PORT_3000" ]; then
    kill -9 $PORT_3000 2>/dev/null
    echo "   Stopped Next.js (port 3000)"
fi

# Kill by process name (additional fallback)
pkill -f "uvicorn main:app" 2>/dev/null
pkill -f "next dev" 2>/dev/null

echo "✅ All servers stopped"
