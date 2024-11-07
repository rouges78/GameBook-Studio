# Development Guide

This guide provides detailed information for developers who want to contribute to GameBook Studio.

## Development Environment Setup

### Required Tools
- Visual Studio Code (recommended)
- Node.js v16+
- npm or yarn
- Git

### First-Time Setup
1. **Clone the Repository**
```bash
git clone https://github.com/rouges78/GameBook-Studio.git
cd GameBook-Studio
```

2. **Install Dependencies**
```bash
npm install
```

3. **Setup Database**
```bash
npx prisma generate
npx prisma migrate dev
```

4. **Start Development Server**
```bash
npm run dev
```

## Project Architecture

### Core Components

#### Electron Main Process (`electron/`)
- `main.js` - Main entry point
- `preload.js` - Preload scripts
- `database.js` - Database operations
- `backup.js` - Backup functionality

#### React Frontend (`src/`)
- `components/` - React components
- `contexts/` - React contexts
- `hooks/` - Custom React hooks
- `utils/` - Utility functions

### Key Features Implementation

#### Paragraph Editor
The paragraph editor is built using:
- React for UI components
- Custom hooks for state management
- Event system for real-time updates

#### Story Map
The story map feature uses:
- Canvas API for rendering
- Custom drag-and-drop system
- Path finding algorithms for connections

#### Backup System
Implements:
- Automatic periodic backups
- Version control
- Recovery mechanisms

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/StoryMap.test.tsx

# Run with coverage
npm test -- --coverage
```

### Test Structure
- Unit tests for components
- Integration tests for features
- Performance tests
- End-to-end tests

## Building

### Development Build
```bash
npm run build:dev
```

### Production Build
```bash
npm run build
```

### Platform-Specific Builds
```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

## Code Style Guide

### TypeScript
- Use TypeScript for all new code
- Maintain strict type checking
- Document complex types

### React Components
- Use functional components
- Implement proper error boundaries
- Follow React hooks best practices

### Testing
- Write tests for new features
- Maintain high test coverage
- Use meaningful test descriptions

## Performance Optimization

### Key Areas
- Story map rendering
- Large document handling
- Asset management
- Memory usage

### Monitoring
- Use built-in telemetry
- Monitor performance metrics
- Track error rates

## Database Management

### Prisma Setup
- Schema definitions
- Migration management
- Query optimization

### Data Models
- Story structure
- User preferences
- Backup metadata
- Telemetry data

## Error Handling

### Guidelines
- Use proper error boundaries
- Implement logging
- Provide user feedback
- Handle recovery

## Security

### Best Practices
- Input validation
- Secure file handling
- Data encryption
- Safe IPC communication

## Contributing

### Process
1. Fork the repository
2. Create a feature branch
3. Implement changes
4. Write tests
5. Submit pull request

### Pull Request Guidelines
- Clear description
- Test coverage
- Documentation updates
- Clean commit history

## Debugging

### Tools
- Chrome DevTools
- VS Code debugger
- Electron debugger

### Common Issues
- Database connection
- IPC communication
- Memory leaks
- Performance bottlenecks

## Release Process

### Steps
1. Version bump
2. Update changelog
3. Run tests
4. Build release
5. Create release notes
6. Deploy

### Version Control
- Follow semantic versioning
- Tag releases
- Update documentation

## Additional Resources

### Documentation
- [API Reference](api.md)
- [User Guide](user-guide.md)
- [FAQ](faq.md)

### Tools
- VS Code extensions
- Development utilities
- Testing tools

## Support

### Getting Help
- GitHub issues
- Documentation
- Community channels

This guide is continuously updated as the project evolves.
