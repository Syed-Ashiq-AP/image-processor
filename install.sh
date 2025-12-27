#!/bin/bash

# Install script for Image Pro (Unix/Linux/macOS)

echo "📦 Installing Image Pro..."
echo ""

# Check if Python is installed
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
    echo "✓ Python found: $(python3 --version)"
elif command -v python &> /dev/null; then
    PYTHON_CMD=python
    echo "✓ Python found: $(python --version)"
else
    echo "❌ Python is not installed. Please install Python 3.9+ first."
    echo "   Download from: https://www.python.org/downloads/"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"

echo ""
echo "📦 Installing Node.js dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Node.js dependencies"
    exit 1
fi

echo ""
echo "🐍 Creating Python virtual environment..."
cd api

# Remove existing venv if present
if [ -d "venv" ]; then
    echo "   Removing existing virtual environment..."
    rm -rf venv
fi

# Create venv
$PYTHON_CMD -m venv venv

if [ $? -ne 0 ]; then
    echo "❌ Failed to create virtual environment"
    cd ..
    exit 1
fi

echo "✓ Virtual environment created"

echo ""
echo "📦 Installing Python dependencies in virtual environment..."

# Activate venv and install dependencies
source venv/bin/activate
$PYTHON_CMD -m pip install --upgrade pip -q
$PYTHON_CMD -m pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    deactivate
    cd ..
    exit 1
fi

deactivate
cd ..

echo ""
echo "✅ Installation complete!"
echo ""
echo "You can now run the application with:"
echo "  npm run start"
echo "  or"
echo "  ./start.sh"
echo ""
