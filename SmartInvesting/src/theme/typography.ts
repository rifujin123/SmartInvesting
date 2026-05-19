import { Platform, TextStyle } from 'react-native';

const fontFamily = {
  display: Platform.select({ ios: 'System', android: 'Roboto', default: 'sans-serif-medium' }),
  heading: Platform.select({ ios: 'System', android: 'Roboto', default: 'sans-serif-medium' }),
  body: Platform.select({ ios: 'System', android: 'Roboto', default: 'sans-serif' }),
  mono: Platform.select({ ios: 'Courier', android: 'monospace', default: 'monospace' }),
};

export const typography = {
  display: {
    large: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const, fontFamily: fontFamily.display, letterSpacing: -0.8 },
    medium: { fontSize: 26, lineHeight: 34, fontWeight: '700' as const, fontFamily: fontFamily.display, letterSpacing: -0.5 },
    regular: { fontSize: 22, lineHeight: 30, fontWeight: '700' as const, fontFamily: fontFamily.display, letterSpacing: -0.3 },
  },
  heading: {
    h1: { fontSize: 20, lineHeight: 28, fontWeight: '700' as const, fontFamily: fontFamily.heading },
    h2: { fontSize: 18, lineHeight: 26, fontWeight: '600' as const, fontFamily: fontFamily.heading },
    h3: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const, fontFamily: fontFamily.heading },
  },
  body: {
    large: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const, fontFamily: fontFamily.body },
    regular: { fontSize: 15, lineHeight: 22, fontWeight: '400' as const, fontFamily: fontFamily.body },
    small: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const, fontFamily: fontFamily.body },
    xsmall: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const, fontFamily: fontFamily.body },
  },
  label: {
    large: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const, fontFamily: fontFamily.heading, letterSpacing: 0.3 },
    medium: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const, fontFamily: fontFamily.heading, letterSpacing: 0.2 },
    small: { fontSize: 11, lineHeight: 14, fontWeight: '600' as const, fontFamily: fontFamily.heading, letterSpacing: 0.4 },
  },
  mono: {
    regular: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const, fontFamily: fontFamily.mono },
    small: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const, fontFamily: fontFamily.mono },
  },
  title: { fontSize: 20, lineHeight: 28, fontWeight: '700' as const, fontFamily: fontFamily.heading },
  sectionHeader: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const, fontFamily: fontFamily.heading },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const, fontFamily: fontFamily.body },
  button: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const, fontFamily: fontFamily.heading },
} as const;

// Typography helpers
export const textStyles = {
  displayLarge: typography.display.large,
  displayMedium: typography.display.medium,
  displayRegular: typography.display.regular,
  h1: typography.heading.h1,
  h2: typography.heading.h2,
  h3: typography.heading.h3,
  bodyLarge: typography.body.large,
  bodyRegular: typography.body.regular,
  bodySmall: typography.body.small,
  bodyXSmall: typography.body.xsmall,
  labelLarge: typography.label.large,
  labelMedium: typography.label.medium,
  labelSmall: typography.label.small,
  monoRegular: typography.mono.regular,
  monoSmall: typography.mono.small,
};
