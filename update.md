# Update 2024-12-29

## Security Enhancements
- Implemented Content Security Policy (CSP) in Electron main process
- Added secure headers configuration for renderer process
- Enabled explicit webSecurity in BrowserWindow preferences
- Updated application version to 0.9.12

## Bug Fixes
- Fixed exit button functionality in dashboard
- Fixed project loading after CSP implementation
- Added required CSP rules for IPC communication

# Update 2024-01-01

## Database Access Fixes
- Removed direct PrismaClient usage from frontend
- Added electronAPI interface for database access
- Updated Settings component to use electronAPI for project fetching
- Added type declarations for electronAPI in electron/types.d.ts

## Version Update
- Updated package.json version to 1.0.1
