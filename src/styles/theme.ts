// theme.ts

export const baseTheme = {
  colors: {
    background: '',
    text: '',
    mutedText: '',
    card: '',
    border: '',
    primary: '',
    danger: '',
    input: '',
  },
  spacing: {
    xs: 0,
    sm: 0,
    md: 0,
    lg: 0,
    xl: 0,
  },
  fontSizes: {
    xs: 0,
    sm: 0,
    md: 0,
    lg: 0,
    xl: 0,
    xxl: 0,
  },
  borderRadius: {
    sm: 0,
    md: 0,
    lg: 0,
    xl: 0,
  },
  shadow: {
    light: {
      shadowColor: '',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
  },
}

export type ThemeName = 'light' | 'dark'
export type AppTheme = typeof baseTheme

export const themes: Record<ThemeName, AppTheme> = {
  light: {
    colors: {
      background: '#ffffff',
      text: '#111111',
      mutedText: '#666666',
      card: '#ffffff',
      border: '#eeeeee',
      primary: '#007aff',
      danger: '#ff3b30',
      input: '#fafafa'
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 20,
    },
    shadow: {
      light: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
      },
    },
  },

  dark: {
    colors: {
      background: '#121212',
      text: '#eeeeee',
      mutedText: '#aaaaaa',
      card: '#1e1e1e',
      border: '#333333',
      primary: '#0a84ff',
      danger: '#ff453a',
      input: '#1e1e1e'
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 20,
    },
    shadow: {
      light: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
      },
    },
  },
}
