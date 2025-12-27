# Stop script for Image Pro (Windows PowerShell)

Write-Host "🛑 Stopping Image Pro servers..." -ForegroundColor Yellow

# Stop by PID if .pids file exists
if (Test-Path .pids) {
    $pids = Get-Content .pids
    $pidArray = $pids -split ","
    
    foreach ($pid in $pidArray) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "   Stopped process $pid" -ForegroundColor Green
        } catch {
            # Process might already be stopped
        }
    }
    Remove-Item .pids -ErrorAction SilentlyContinue
}

# Kill by port (fallback)
Write-Host "   Checking ports..." -ForegroundColor Gray

# Stop process on port 8000 (Python API)
$pythonProcess = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($pythonProcess) {
    Stop-Process -Id $pythonProcess -Force -ErrorAction SilentlyContinue
    Write-Host "   Stopped Python API (port 8000)" -ForegroundColor Green
}

# Stop process on port 3000 (Next.js)
$nextProcess = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($nextProcess) {
    Stop-Process -Id $nextProcess -Force -ErrorAction SilentlyContinue
    Write-Host "   Stopped Next.js (port 3000)" -ForegroundColor Green
}

# Kill by process name (additional fallback)
Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*python*"} | Where-Object {
    $_.CommandLine -like "*uvicorn*" -or $_.CommandLine -like "*next dev*"
} | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "✅ All servers stopped" -ForegroundColor Green
