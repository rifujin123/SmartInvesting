import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');

export const colors = {
  dark: {
    bg: '#07111A',
    background: '#07111A',
    primary: '#3BE0D0',
    surface: '#0C1824',
    surface2: '#10202F',
    card: 'rgba(16,32,47,0.82)',
    cardBorder: 'rgba(125,163,191,0.16)',
    text: '#F5F7FA',
    textSecondary: '#8CA0B3',
    textTertiary: '#5B6B7C',
    accent: '#3BE0D0',
    accentSubtle: 'rgba(59,224,208,0.12)',
    accent2: '#6EE7FF',
    gain: '#4ADE80',
    gainBg: 'rgba(74,222,128,0.14)',
    loss: '#FB7185',
    lossBg: 'rgba(251,113,133,0.14)',
    warning: '#FBBF24',
    warningBg: 'rgba(251,191,36,0.12)',
    info: '#60A5FA',
    infoBg: 'rgba(96,165,250,0.12)',
    overlay: 'rgba(4,10,16,0.72)',
    divider: 'rgba(125,163,191,0.08)',
    shimmer: 'rgba(255,255,255,0.06)',
    shimmerHighlight: 'rgba(255,255,255,0.12)',
  },
  light: {
    bg: '#F4F7FA',
    background: '#F4F7FA',
    primary: '#0EA5A4',
    surface: '#FFFFFF',
    surface2: '#EAF0F6',
    card: 'rgba(255,255,255,0.9)',
    cardBorder: 'rgba(15,23,42,0.08)',
    text: '#0F172A',
    textSecondary: '#5B6B7C',
    textTertiary: '#8B9DB2',
    accent: '#0EA5A4',
    accentSubtle: 'rgba(14,165,164,0.12)',
    accent2: '#0284C7',
    gain: '#16A34A',
    gainBg: 'rgba(22,163,74,0.12)',
    loss: '#DC2626',
    lossBg: 'rgba(220,38,38,0.12)',
    warning: '#D97706',
    warningBg: 'rgba(217,119,6,0.12)',
    info: '#0284C7',
    infoBg: 'rgba(2,132,199,0.12)',
    overlay: 'rgba(15,23,42,0.16)',
    divider: 'rgba(15,23,42,0.06)',
    shimmer: 'rgba(0,0,0,0.04)',
    shimmerHighlight: 'rgba(0,0,0,0.08)',
  },
} as const;

export type ColorScheme = keyof typeof colors;

export const spacing = {
  xs: 4,
  sm: 8,
  base: 12,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const typography = {
  display: {
    large: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const, letterSpacing: -0.8 },
    medium: { fontSize: 26, lineHeight: 34, fontWeight: '700' as const, letterSpacing: -0.5 },
    regular: { fontSize: 22, lineHeight: 30, fontWeight: '700' as const, letterSpacing: -0.3 },
  },
  heading: {
    h1: { fontSize: 20, lineHeight: 28, fontWeight: '700' as const },
    h2: { fontSize: 18, lineHeight: 26, fontWeight: '600' as const },
    h3: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
  },
  body: {
    large: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
    regular: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const },
    small: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
    xsmall: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
  },
  label: {
    large: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const, letterSpacing: 0.3 },
    medium: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const, letterSpacing: 0.2 },
    small: { fontSize: 11, lineHeight: 14, fontWeight: '600' as const, letterSpacing: 0.4 },
  },
  mono: {
    regular: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
    small: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  },
  title: { fontSize: 20, lineHeight: 28, fontWeight: '700' as const },
  sectionHeader: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
  button: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
} as const;

export const shadows = {
  card: {
    shadowColor: '#07111A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
  },
  cardLight: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  glow: {
    shadowColor: '#3BE0D0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 6,
  },
};

export const motion = {
  fast: 200,
  normal: 300,
  slow: 450,
  spring: { damping: 18, stiffness: 250 },
};

export const layout = {
  screenPadding: spacing.lg,
  cardPadding: spacing.md,
  listContentWidth: SCREEN_W - spacing.lg * 2,
  maxContentWidth: 600,
};
