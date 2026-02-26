import { StatusBarStyle } from 'react-native';

export interface ThemeColors {
    accent: string;
    accentLight: string;
    accentMid: string;
    bg: string;
    bgSecondary: string;
    bgTertiary: string;
    card: string;
    cardSecondary: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    divider: string;
    heart: string;
    error: string;
    success: string;
    white: string;
    tabBar: string;
    tabBarBorder: string;
    tabBarActive: string;
    tabBarInactive: string;
    statusBar: StatusBarStyle;
}

export const lightColors: ThemeColors = {
    accent: '#FF8C00',
    accentLight: 'rgba(255, 140, 0, 0.12)',
    accentMid: 'rgba(255, 140, 0, 0.25)',
    bg: '#FFFFFF',
    bgSecondary: '#F5F5F7',
    bgTertiary: '#EFEFEF',
    card: '#F0F0F2',
    cardSecondary: '#E8E8EC',
    surface: '#FFFFFF',
    textPrimary: '#1A1A1A',
    textSecondary: '#666666',
    textMuted: '#AAAAAA',
    border: '#E8E8EC',
    divider: '#F0F0F0',
    heart: '#FF4758',
    error: '#FF4444',
    success: '#00C853',
    white: '#FFFFFF',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E8E8EC',
    tabBarActive: '#FF8C00',
    tabBarInactive: '#AAAAAA',
    statusBar: 'dark-content',
};

export const darkColors: ThemeColors = {
    accent: '#FF8C00',
    accentLight: 'rgba(255, 140, 0, 0.15)',
    accentMid: 'rgba(255, 140, 0, 0.3)',
    bg: '#1C1E26',
    bgSecondary: '#242731',
    bgTertiary: '#2C303B',
    card: '#2A2D37',
    cardSecondary: '#333745',
    surface: '#242731',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A4B8',
    textMuted: '#63677E',
    border: '#313544',
    divider: '#2A2E3A',
    heart: '#FF4758',
    error: '#FF5555',
    success: '#00C853',
    white: '#FFFFFF',
    tabBar: '#1C1E26',
    tabBarBorder: '#2A2E3A',
    tabBarActive: '#FF8C00',
    tabBarInactive: '#63677E',
    statusBar: 'light-content',
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
};

export const Radius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const Typography = {
    h1: { fontSize: 24, fontWeight: '800' as const, letterSpacing: -0.5 },
    h2: { fontSize: 18, fontWeight: '700' as const },
    h3: { fontSize: 15, fontWeight: '700' as const },
    body: { fontSize: 14, fontWeight: '400' as const },
    bodyBold: { fontSize: 14, fontWeight: '600' as const },
    caption: { fontSize: 12, fontWeight: '400' as const },
    captionBold: { fontSize: 12, fontWeight: '600' as const },
    tiny: { fontSize: 10, fontWeight: '500' as const, letterSpacing: 0.5 },
};

// Backwards-compat alias
export const Colors = lightColors;
