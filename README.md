# GameBook Studio

GameBook Studio is an advanced desktop application designed for creating and managing interactive gamebooks and story-driven content. Built with Electron and React, it provides a robust platform for writers and game designers to craft branching narratives with rich multimedia elements.

## 🎮 Features

### Completed Features
- **Paragraph Editor**
  - Rich text editing capabilities
  - Tag system for organizing content
  - Real-time preview
  - Keyboard shortcuts for efficient editing

- **Story Map**
  - Visual representation of story branches
  - Drag-and-drop interface
  - Connection management between story nodes
  - Mini-map for easy navigation

- **Backup System**
  - Automatic backup functionality
  - Backup history management
  - Recovery options for lost work

- **Export Options**
  - Multiple export formats support
  - Customizable export templates
  - Preview before export

- **Performance Monitoring**
  - Telemetry dashboard
  - System resource usage tracking
  - Error logging and analysis
  - Performance optimization tools

### Planned Features
- [ ] Cloud synchronization
- [ ] Collaborative editing
- [ ] Version control for story branches
- [ ] Advanced asset management
- [ ] Custom theme creator
- [ ] Mobile preview mode
- [ ] Story testing simulator
- [ ] Analytics dashboard
- [ ] Import from various formats
- [ ] Plugin system

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Development Setup
1. Clone the repository:
```bash
git clone https://github.com/rouges78/GameBook-Studio.git
cd GameBook-Studio
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

### Building for Production
```bash
npm run build
# or
yarn build
```

The built application will be available in the `dist` directory.

## 🛠 Technology Stack
- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Electron, Node.js
- **Database**: SQLite (via Prisma)
- **Testing**: Jest, React Testing Library
- **Build Tools**: Vite, Electron Forge

## 📦 Project Structure
```
GameBook-Studio/
├── electron/          # Electron main process files
├── src/               # React application source
│   ├── components/    # React components
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom React hooks
│   └── utils/         # Utility functions
├── prisma/            # Database schema and migrations
└── tests/             # Test files
```

## 🤝 Contributing
Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

### Development Guidelines
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 Documentation
- [User Guide](docs/user-guide.md)
- [Development Guide](docs/development.md)
- [API Documentation](docs/api.md)

## 🔄 Updates and Versioning
The project follows Semantic Versioning (SemVer). For the latest changes, see the [CHANGELOG](CHANGELOG.md).

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔧 Troubleshooting
For common issues and solutions, please check our [FAQ](docs/faq.md) or open an issue on GitHub.

## 📊 Project Status
- **Current Version**: 0.1.0
- **Development Stage**: Alpha
- **Last Updated**: November 2024

## 🎯 Roadmap
### Phase 1 (Current)
- [x] Basic editor functionality
- [x] Story mapping
- [x] Backup system
- [ ] Asset management

### Phase 2 (Upcoming)
- [ ] Cloud integration
- [ ] Collaborative features
- [ ] Advanced export options
- [ ] Mobile compatibility

### Phase 3 (Future)
- [ ] Plugin system
- [ ] Theme marketplace
- [ ] Analytics tools
- [ ] AI assistance features

## 💡 Support
For support, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue if needed

## 🌟 Acknowledgments
Thanks to all contributors who have helped shape GameBook Studio!
