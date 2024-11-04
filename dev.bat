@echo off
echo Starting development environment...

:: Kill any existing processes
taskkill /F /IM electron.exe 2>nul
taskkill /F /IM node.exe 2>nul

:: Clean dist directory
call npx rimraf dist

:: Compile preload script
echo Compiling preload script...
call npx tsc -p electron/tsconfig.json

:: Start Vite dev server
echo Starting Vite dev server...
start /b cmd /c "npm run dev:vite"

:: Wait for Vite to be ready (increased wait time)
echo Waiting for Vite server to start...
timeout /t 5 /nobreak > nul

:: Start Electron
echo Starting Electron...
start /b cmd /c "npm run dev:electron"

echo Development environment started. Press Ctrl+C to exit.
