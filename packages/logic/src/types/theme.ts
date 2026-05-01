export type ThemeId =
  | 'sticky-yellow'
  | 'sticky-pink'
  | 'parchment'
  | 'slate'
  | 'midnight'
  | 'forest'
  | 'ocean'
  | 'sage'

export interface ThemeColors {
  bg: string
  headerBg: string
  text: string
  textMuted: string
  accent: string
  border: string
  inputBg: string
}

export interface ThemeMeta {
  id: ThemeId
  label: string
  swatch: string
  colors: ThemeColors
}
