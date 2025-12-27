#!/bin/bash

# Start script for Image Pro (Unix/Linux/macOS)

echo "🚀 Starting Image Pro..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null
then
    echo "❌ Python is not installed. Please install Python 3.9+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Determine Python command
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
else
    PYTHON_CMD=python
fi

echo "📦 Installing dependencies..."
npm install

cd api
$PYTHON_CMD -m pip install -r requirements.txt
cd ..

echo ""
echo "🐍 Starting Python API on http://localhost:8000..."

# Check if venv exists
if [ ! -d "api/venv" ]; then
    echo "❌ Virtual environment not found. Please run install script first:"
    echo "   ./install.sh"
    exit 1
fi

cd api
source venv/bin/activate
$PYTHON_CMD -m uvicorn main:app --reload --port 8000 &
PYTHON_PID=$!
cd ..

# Wait for Python API to start
sleep 3

echo "⚡ Starting Next.js on http://localhost:3000..."
npm run dev &
NEXTJS_PID=$!

# Save PIDs to file for stop script
echo $PYTHON_PID > .pids
echo $NEXTJS_PID >> .pids

echo ""
echo "✅ Both servers are running!"
echo "   - Frontend: http://localhost:3000"
echo "   - Python API: http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop both servers or run './stop.sh'"
echo ""

# Wait for user interrupt
trap "kill $PYTHON_PID $NEXTJS_PID 2>/dev/null; rm -f .pids; echo ''; echo '🛑 Servers stopped'; exit" INT TERM

# Keep script running
wait
