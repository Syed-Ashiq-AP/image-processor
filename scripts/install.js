#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📦 Installing Image Pro...\n');

const isWindows = process.platform === 'win32';
const pythonCmd = isWindows ? 'py' : 'python3';
const venvPath = path.join(__dirname, '..', 'api', 'venv');
const venvActivate = isWindows 
  ? path.join(venvPath, 'Scripts', 'activate.bat')
  : path.join(venvPath, 'bin', 'activate');

// Check Python
exec(`${pythonCmd} --version`, (error, stdout) => {
  if (error) {
    console.error('❌ Python is not installed. Please install Python 3.9+ first.');
    console.error('   Download from: https://www.python.org/downloads/');
    process.exit(1);
  }
  console.log(`✓ Python found: ${stdout.trim()}`);

  // Check Node.js
  exec('node --version', (error, stdout) => {
    if (error) {
      console.error('❌ Node.js is not installed. Please install Node.js 18+ first.');
      console.error('   Download from: https://nodejs.org/');
      process.exit(1);
    }
    console.log(`✓ Node.js found: ${stdout.trim()}\n`);

    // Install Node.js dependencies
    console.log('📦 Installing Node.js dependencies...');
    exec('npm install', { stdio: 'inherit' }, (error) => {
      if (error) {
        console.error('❌ Failed to install Node.js dependencies');
        process.exit(1);
      }

      console.log('\n🐍 Creating Python virtual environment...');
      
      // Remove existing venv if present
      if (fs.existsSync(venvPath)) {
        console.log('   Removing existing virtual environment...');
        fs.rmSync(venvPath, { recursive: true, force: true });
      }

      // Create venv
      exec(`${pythonCmd} -m venv api/venv`, (error) => {
        if (error) {
          console.error('❌ Failed to create virtual environment');
          process.exit(1);
        }
        console.log('✓ Virtual environment created\n');

        console.log('📦 Installing Python dependencies in virtual environment...');
        
        // Install dependencies in venv
        const pipCmd = isWindows
          ? `api\\venv\\Scripts\\python.exe -m pip install --upgrade pip -q && api\\venv\\Scripts\\python.exe -m pip install -r api\\requirements.txt`
          : `api/venv/bin/python -m pip install --upgrade pip -q && api/venv/bin/python -m pip install -r api/requirements.txt`;

        exec(pipCmd, { stdio: 'inherit' }, (error) => {
          if (error) {
            console.error('❌ Failed to install Python dependencies');
            process.exit(1);
          }

          console.log('\n✅ Installation complete!\n');
          console.log('You can now run the application with:');
          console.log('  npm run start\n');
        });
      });
    });
  });
});
