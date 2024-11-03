# Clean dist directory
Write-Host "Cleaning dist directory..."
rimraf dist

# Start Vite dev server
Write-Host "Starting Vite dev server..."
$viteProcess = Start-Process -FilePath "npm" -ArgumentList "run dev:vite" -PassThru -NoNewWindow

# Wait for Vite server to be ready
Write-Host "Waiting for Vite server..."
Start-Sleep -Seconds 3

# Start Electron
Write-Host "Starting Electron..."
$electronProcess = Start-Process -FilePath "npm" -ArgumentList "run dev:electron" -PassThru -NoNewWindow

# Wait for processes to finish
try {
    $viteProcess.WaitForExit()
    $electronProcess.WaitForExit()
} finally {
    # Cleanup
    if (!$viteProcess.HasExited) {
        Stop-Process -Id $viteProcess.Id -Force
    }
    if (!$electronProcess.HasExited) {
        Stop-Process -Id $electronProcess.Id -Force
    }
}
