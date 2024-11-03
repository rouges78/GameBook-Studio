const { spawn } = require('child_process');
const { platform } = require('os');

// Start Vite
console.log('Starting Vite...');
const vite = spawn(platform() === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev:vite'], {
  stdio: 'inherit'
});

// Start Electron after a delay to ensure Vite is ready
setTimeout(() => {
  console.log('Starting Electron...');
  const electron = spawn(platform() === 'win32' ? 'electron.cmd' : 'electron', ['.'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'development'
    }
  });

  electron.on('close', () => {
    vite.kill();
    process.exit();
  });
}, 2000);
