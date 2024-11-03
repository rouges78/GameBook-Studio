@echo off
echo Starting development environment...

:: Clean dist directory
call rimraf dist

:: Start Vite dev server
start /b cmd /c "npm run dev:vite"

:: Wait for Vite to be ready
timeout /t 3 /nobreak > nul

:: Start Electron
start /b cmd /c "npm run dev:electron"
