export interface ViewerTheme {
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    error: string
    info: string
    background: string
    foreground: string
    border: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  typography: {
    fontSize: {
      sm: string
      base: string
      lg: string
      xl: string
    }
    fontFamily: string
  }
  borderRadius: string
}
