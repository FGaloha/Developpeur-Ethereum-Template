import { extendTheme, ChakraProvider } from '@chakra-ui/react'

const fonts = {
  body: `Inter, -apple-system, "Segoe UI", Helvetica, Arial`,
  heading: `Inter, -apple-system, "Segoe UI", Helvetica, Arial`,
}

const breakpoints = {
  sm: '40em',
  md: '52em',
  lg: '64em',
  xl: '80em',
  '2xl': '96em',
}

const config = {
  initialColorMode: 'light',
  useSystemColorMode: true,
}

const overrides = {
  fonts,
  breakpoints,
  config,
  fontWeights: {
    normal: 300,
    medium: 600,
    bold: 700
  },
  fontSizes: {
    xs: "12px",
    sm: "14px",
    md: "16px",
    lg: "18px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "28px",
    "4xl": "36px",
    "5xl": "48px",
    "6xl": "64px",
    "7xl": "4.5rem",
    "8xl": "6rem",
    "9xl": "8rem",
  },
}

const customTheme = extendTheme(overrides)

export default customTheme
