"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTheme = exports.ThemeContext = exports.defaultTheme = void 0;
const react_1 = require("react");
exports.defaultTheme = {
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    textColor: '#F9FAFB',
    backgroundColor: '#111827',
    fontSize: 16,
    fontFamily: 'Roboto',
    borderRadius: 4,
    buttonStyle: 'rounded',
    spacing: 16,
    paragraphBackground: '#1F2937',
    animationSpeed: 300,
    iconSet: 'default',
    layout: 'grid',
};
exports.ThemeContext = (0, react_1.createContext)({
    theme: exports.defaultTheme,
    setTheme: () => { },
});
const useTheme = () => {
    const context = React.useContext(exports.ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
exports.useTheme = useTheme;
