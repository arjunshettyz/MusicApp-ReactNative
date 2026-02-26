import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, ThemeColors } from '../theme';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextValue {
    colors: ThemeColors;
    isDark: boolean;
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    colors: lightColors,
    isDark: false,
    mode: 'system',
    setMode: () => { },
});

// Simple in-memory persistence (works on both web and native)
let _savedMode: ThemeMode = 'system';
const _listeners: Array<(mode: ThemeMode) => void> = [];
const _notifyListeners = (mode: ThemeMode) => _listeners.forEach((l) => l(mode));

export const saveThemeMode = (mode: ThemeMode) => {
    _savedMode = mode;
    _notifyListeners(mode);
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('theme_mode', mode);
        }
    } catch { }
};

const loadThemeMode = (): ThemeMode => {
    try {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('theme_mode');
            if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
        }
    } catch { }
    return _savedMode;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const systemScheme = useColorScheme();
    const [mode, setModeState] = useState<ThemeMode>(loadThemeMode);

    // listen for changes from other components (e.g. Settings)
    useEffect(() => {
        const listener = (m: ThemeMode) => setModeState(m);
        _listeners.push(listener);
        return () => {
            const idx = _listeners.indexOf(listener);
            if (idx >= 0) _listeners.splice(idx, 1);
        };
    }, []);

    const setMode = useCallback((m: ThemeMode) => {
        setModeState(m);
        saveThemeMode(m);
    }, []);

    const isDark =
        mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

    const colors = isDark ? darkColors : lightColors;

    // Apply global background for Web to prevent white glitches during transitions
    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.body.style.backgroundColor = colors.bg;
        }
    }, [colors.bg]);

    return (
        <ThemeContext.Provider value={{ colors, isDark, mode, setMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
