const { spawn } = require('child_process');
const { platform } = require('os');

(async () => {
  try {
    // Import get-port dynamically
    const getPort = (await import('get-port')).default;
    
    // Find an available port starting from 5173
    const port = await getPort({ port: [5173, 5174, 5175, 5176, 5177, 5178] });
    console.log(`Found available port: ${port}`);

    // Start Vite dev server
    console.log('Starting Vite dev server...');
    const vite = spawn(platform() === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev:vite', '--', `--port=${port}`], {
      stdio: 'inherit',
      env: {
        ...process.env,
        VITE_PORT: port.toString()
      }
    });

    // Handle Vite process errors
    vite.on('error', (err) => {
      console.error('Failed to start Vite:', err);
      process.exit(1);
    });

    // Start Electron after a delay to ensure Vite is ready
    setTimeout(() => {
      console.log('Starting Electron...');
      const electron = spawn(platform() === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev:electron'], {
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_ENV: 'development',
          VITE_PORT: port.toString()
        }
      });

      // Handle Electron process errors
      electron.on('error', (err) => {
        console.error('Failed to start Electron:', err);
        vite.kill();
        process.exit(1);
      });

      // Handle Electron process exit
      electron.on('close', (code) => {
        console.log(`Electron process exited with code ${code}`);
        vite.kill();
        process.exit(code || 0);
      });
    }, 3000);

    // Handle process termination
    const cleanup = () => {
      vite.kill();
      process.exit();
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);

  } catch (error) {
    console.error('Error in dev script:', error);
    process.exit(1);
  }
})();
