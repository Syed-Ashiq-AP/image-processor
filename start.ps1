# Start script for Image Pro (Windows PowerShell)

Write-Host "🚀 Starting Image Pro..." -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = & py --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed. Please install Python 3.9+ first." -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = & node --version 2>&1
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

Set-Location api
py -m pip install -r requirements.txt -q
Set-Location ..

Write-Host ""
Write-Host "🐍 Starting Python API on http://localhost:8000..." -ForegroundColor Magenta

# Check if venv exists
if (-not (Test-Path "api\venv")) {
    Write-Host "❌ Virtual environment not found. Please run install script first:" -ForegroundColor Red
    Write-Host "   .\install.ps1" -ForegroundColor Yellow
    exit 1
}

# Start Python API in new window with venv activated
$pythonJob = Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$PWD\api'; .\venv\Scripts\Activate.ps1; python -m uvicorn main:app --reload --port 8000" -PassThru -WindowStyle Normal

# Wait for Python API to start
Start-Sleep -Seconds 3

Write-Host "⚡ Starting Next.js on http://localhost:3000..." -ForegroundColor Magenta

# Start Next.js in new window
$nextJob = Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev" -PassThru -WindowStyle Normal

# Save PIDs to file for stop script
"$($pythonJob.Id),$($nextJob.Id)" | Out-File -FilePath ".pids" -NoNewline

Write-Host ""
Write-Host "✅ Both servers are running in separate windows!" -ForegroundColor Green
Write-Host "   - Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   - Python API: http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Run './stop.ps1' to stop both servers" -ForegroundColor Yellow
Write-Host ""
