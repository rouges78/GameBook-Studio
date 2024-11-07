"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSearchHistory = void 0;
const react_1 = require("react");
const STORAGE_KEY = 'keyboard-shortcuts-search-history';
const MAX_HISTORY_ITEMS = 5;
const useSearchHistory = () => {
    const [searchHistory, setSearchHistory] = (0, react_1.useState)(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        }
        catch {
            return [];
        }
    });
    (0, react_1.useEffect)(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(searchHistory));
    }, [searchHistory]);
    const addToHistory = (0, react_1.useCallback)((search) => {
        if (!search.trim())
            return;
        setSearchHistory(prev => {
            const filtered = prev.filter(item => item.toLowerCase() !== search.toLowerCase());
            return [search, ...filtered].slice(0, MAX_HISTORY_ITEMS);
        });
    }, []);
    const clearHistory = (0, react_1.useCallback)(() => {
        setSearchHistory([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);
    const clearSearchTerm = (0, react_1.useCallback)((term) => {
        setSearchHistory(prev => prev.filter(item => item !== term));
    }, []);
    return {
        searchHistory,
        addToHistory,
        clearHistory,
        clearSearchTerm
    };
};
exports.useSearchHistory = useSearchHistory;
