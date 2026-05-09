export const colors = {
  primary: '#0F766E',
  primaryPressed: '#0D9488',
  surface: '#F8FAFC',
  surfaceCard: '#FFFFFF',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  success: '#059669',
  loss: '#DC2626',
  expenseAccent: '#EA580C',
  overlay: 'rgba(15, 23, 42, 0.45)',

  // Figma Design System Tokens
  figma: {
    appBg: '#101828',
    surface: '#23303B',
    surfaceCard: '#F9F9FB',
    primary: '#456EFE',
    primaryDark: '#23303B',
    accent: '#13C999',
    danger: '#FF6363',
    textPrimary: '#FFFFFF',
    textSecondary: '#8E949A',
    textMuted: '#A4A9AE',
    divider: '#E2E8F0',
  },
} as const;

export type Colors = typeof colors;
