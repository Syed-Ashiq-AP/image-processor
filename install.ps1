# Install script for Image Pro (Windows PowerShell)

Write-Host "📦 Installing Image Pro..." -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = & py --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed. Please install Python 3.9+ first." -ForegroundColor Red
    Write-Host "   Download from: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = & node --version 2>&1
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install Node.js dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🐍 Creating Python virtual environment..." -ForegroundColor Yellow
Set-Location api

# Remove existing venv if present
if (Test-Path venv) {
    Write-Host "   Removing existing virtual environment..." -ForegroundColor Gray
    Remove-Item -Recurse -Force venv
}

# Create venv
py -m venv venv

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create virtual environment" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "✓ Virtual environment created" -ForegroundColor Green

Write-Host ""
Write-Host "📦 Installing Python dependencies in virtual environment..." -ForegroundColor Yellow

# Activate venv and install dependencies
& .\venv\Scripts\Activate.ps1
py -m pip install --upgrade pip -q
py -m pip install -r requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install Python dependencies" -ForegroundColor Red
    deactivate
    Set-Location ..
    exit 1
}

deactivate
Set-Location ..

Write-Host ""
Write-Host "✅ Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "You can now run the application with:" -ForegroundColor Cyan
Write-Host "  npm run start" -ForegroundColor White
Write-Host "  or" -ForegroundColor Gray
Write-Host "  .\start.ps1" -ForegroundColor White
Write-Host ""
