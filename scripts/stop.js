#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');

console.log('🛑 Stopping Image Pro servers...');

const isWindows = process.platform === 'win32';

// Stop by PID if .pids file exists
if (fs.existsSync('.pids')) {
  const pids = fs.readFileSync('.pids', 'utf-8').split(',');
  pids.forEach(pid => {
    try {
      process.kill(pid, 'SIGTERM');
      console.log(`   Stopped process ${pid}`);
    } catch (e) {
      // Process might already be stopped
    }
  });
  fs.unlinkSync('.pids');
}

// Kill by port (fallback)
console.log('   Checking ports...');

if (isWindows) {
  // Windows
  exec('netstat -ano | findstr :8000', (error, stdout) => {
    if (stdout) {
      const lines = stdout.trim().split('\n');
      lines.forEach(line => {
        const pid = line.trim().split(/\s+/).pop();
        exec(`taskkill /PID ${pid} /F`, () => {
          console.log('   Stopped Python API (port 8000)');
        });
      });
    }
  });

  exec('netstat -ano | findstr :3000', (error, stdout) => {
    if (stdout) {
      const lines = stdout.trim().split('\n');
      lines.forEach(line => {
        const pid = line.trim().split(/\s+/).pop();
        exec(`taskkill /PID ${pid} /F`, () => {
          console.log('   Stopped Next.js (port 3000)');
        });
      });
    }
  });
} else {
  // Unix/Linux/macOS
  exec('lsof -ti:8000', (error, stdout) => {
    if (stdout) {
      const pid = stdout.trim();
      exec(`kill -9 ${pid}`, () => {
        console.log('   Stopped Python API (port 8000)');
      });
    }
  });

  exec('lsof -ti:3000', (error, stdout) => {
    if (stdout) {
      const pid = stdout.trim();
      exec(`kill -9 ${pid}`, () => {
        console.log('   Stopped Next.js (port 3000)');
      });
    }
  });
}

setTimeout(() => {
  console.log('✅ All servers stopped');
}, 1000);
