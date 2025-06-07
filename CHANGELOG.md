## [Unreleased]

## [1.3.5] - 2025-01-22
### Fixed
- Fixed Electron security warnings by resolving path conflicts
- Addressed CSP violations and unsafe eval warnings  
- Resolved preload script loading issues
- Streamlined build configuration
- Removed duplicate path imports in Electron main process
- Corrected preload script path configuration
- Version consistency across package.json and changelog components

### Security
- Enabled Electron sandboxing and context isolation
- Implemented IPC channel validation in preload script
- Updated Electron security settings in main process

## [1.3.3] - 2025-01-22
### Fixed
- Electron build configuration errors
- Source/output directory structure conflicts

### Added
- Quick save button on home page
- Advanced error logging for backups

### Changed
- Improved error handling with Electron Log

## [1.3.2] - 2025-01-22
### Fixed
- Electron main process initialization errors
- Module system conflicts in main.js
- Missing core IPC handlers
- Improved logging and error handling

## [1.3.1] - 2025-01-09
### Fixed
- Return to paragraph editor button functionality
- Minimap background image display
- Image load button in sidebar restoration
- Sidebar persistent visibility and positioning

## [1.3.0] - 2025-01-07
### Accessibility
- Added aria-label to file inputs for screen readers

### Removed
- Deprecated image adjustment functionality

### Fixed
- UI component encoding issues

## [1.2.4] - 2025-01-06
### UI Improvements
- Fixed white areas in StoryMap
- Unified dark theme across interface
- Updated top bar and sidebar colors
- Removed duplicate changelog entries
