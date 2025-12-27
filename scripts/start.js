#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Image Pro...\n');

// Determine Python command
const isWindows = process.platform === 'win32';
const pythonCmd = isWindows ? 'py' : 'python3';

// Check if Python and Node are installed
exec(`${pythonCmd} --version`, (error) => {
  if (error) {
    console.error('❌ Python is not installed. Please install Python 3.9+ first.');
    process.exit(1);
  }
});

console.log('📦 Installing dependencies...');
exec('npm install', { stdio: 'inherit' }, (error) => {
  if (error) {
    console.error('❌ Failed to install npm dependencies');
    process.exit(1);
  }

  // Check if venv exists
  const venvPath = path.join(__dirname, '..', 'api', 'venv');
  if (!fs.existsSync(venvPath)) {
    console.error('\n❌ Python virtual environment not found.');
    console.error('   Please run the install script first:');
    console.error('   npm run install:all\n');
    process.exit(1);
  }

  console.log('\n🐍 Starting Python API on http://localhost:8000...');
  
  // Use Python from venv
  const venvPython = isWindows 
    ? path.join(__dirname, '..', 'api', 'venv', 'Scripts', 'python.exe')
    : path.join(__dirname, '..', 'api', 'venv', 'bin', 'python');
  
  // Start Python API
  const pythonProcess = spawn(venvPython, ['-m', 'uvicorn', 'main:app', '--reload', '--port', '8000'], {
    cwd: path.join(__dirname, '..', 'api'),
    stdio: 'inherit',
    shell: true
  });

  // Wait for Python API to start
  setTimeout(() => {
    console.log('⚡ Starting Next.js on http://localhost:3000...');
    
    // Start Next.js
    const nextProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true
    });

    // Save PIDs
    fs.writeFileSync('.pids', `${pythonProcess.pid},${nextProcess.pid}`);

    console.log('\n✅ Both servers are running!');
    console.log('   - Frontend: http://localhost:3000');
    console.log('   - Python API: http://localhost:8000\n');
    console.log('Press Ctrl+C to stop or run: npm run stop:all\n');

    // Handle cleanup
    const cleanup = () => {
      console.log('\n🛑 Stopping servers...');
      pythonProcess.kill();
      nextProcess.kill();
      if (fs.existsSync('.pids')) {
        fs.unlinkSync('.pids');
      }
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  }, 3000);
});
