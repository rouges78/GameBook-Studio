import { spawn } from 'child_process';
import { platform } from 'os';
import getPort from 'get-port';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  try {
    // Find an available port starting from 5173
    const port = await getPort({ port: [5173, 5174, 5175, 5176, 5177, 5178] });
    console.log(`Found available port: ${port}`);

    // Start Vite dev server - Correzione definitiva per Windows
    console.log('Starting Vite dev server...');
    const viteCommand = platform() === 'win32' 
      ? `"${path.join(__dirname, 'node_modules/.bin/vite.cmd')}" --port ${port} --strictPort`
      : `vite --port ${port} --strictPort`;

    const vite = spawn(viteCommand, {
      stdio: 'inherit',
      shell: true,
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
      const electronCommand = platform() === 'win32'
        ? `electron.cmd "${path.join(__dirname, 'electron/dist/main.mjs')}" --port=${port}`
        : `electron "${path.join(__dirname, 'electron/dist/main.mjs')}" --port=${port}`;

      const electron = spawn(electronCommand, {
        stdio: 'inherit',
        shell: true,
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

      // Handle process termination
      const cleanup = () => {
        vite.kill();
        electron.kill();
        process.exit();
      };

      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);
      process.on('exit', cleanup);

    }, 3000);

  } catch (error) {
    console.error('Error in dev script:', error);
    process.exit(1);
  }
})();
