import type { ViewerTheme } from './types'

export const defaultTheme: ViewerTheme = {
  colors: {
    primary: '#7C3AED', // violet
    secondary: '#0891B2', // cyan
    success: '#059669', // green
    warning: '#D97706', // orange
    error: '#DC2626', // red
    info: '#0891B2', // cyan
    background: '#FFFFFF',
    foreground: '#1E1B4B', // dark indigo
    border: '#E5E7EB'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  typography: {
    fontSize: {
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem'
    },
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  borderRadius: '0.375rem'
}
