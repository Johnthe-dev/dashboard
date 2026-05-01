import type { ThemeId, ThemeMeta, ThemeColors } from '../types/theme'

export const THEME_COLORS: Record<ThemeId, ThemeColors> = {
  'sticky-yellow': {
    bg: '#fff9c4',
    headerBg: '#fff176',
    text: '#3e2a00',
    textMuted: '#7a5c1e',
    accent: '#f57f17',
    border: '#e6c84a',
    inputBg: '#fffde7',
  },
  'sticky-pink': {
    bg: '#ffd6d6',
    headerBg: '#ffb3b3',
    text: '#5c0f0f',
    textMuted: '#a03030',
    accent: '#d32f2f',
    border: '#f48fb1',
    inputBg: '#ffe8e8',
  },
  parchment: {
    bg: '#faf7f0',
    headerBg: '#f0ebe0',
    text: '#2c2416',
    textMuted: '#6b5c44',
    accent: '#7c5c2e',
    border: '#d6ccb4',
    inputBg: '#f5f0e8',
  },
  slate: {
    bg: '#2b2d31',
    headerBg: '#1e2023',
    text: '#e0e2e8',
    textMuted: '#9aa0b0',
    accent: '#5c8df5',
    border: '#3d4045',
    inputBg: '#232528',
  },
  midnight: {
    bg: '#0f1724',
    headerBg: '#0a1018',
    text: '#ccd6f6',
    textMuted: '#7a8caa',
    accent: '#64b5f6',
    border: '#1a2840',
    inputBg: '#0c1520',
  },
  forest: {
    bg: '#1a2620',
    headerBg: '#111c17',
    text: '#c8e6c9',
    textMuted: '#7aaa82',
    accent: '#81c784',
    border: '#2a3d30',
    inputBg: '#162018',
  },
  ocean: {
    bg: '#ddeeff',
    headerBg: '#b8d8ff',
    text: '#0a1e38',
    textMuted: '#2a4b72',
    accent: '#1a6fd4',
    border: '#80b8f0',
    inputBg: '#edf5ff',
  },
  sage: {
    bg: '#e0f2e8',
    headerBg: '#b8dfc8',
    text: '#0a2018',
    textMuted: '#2c5c40',
    accent: '#1a7a40',
    border: '#80c89a',
    inputBg: '#edf7f1',
  },
}

export const THEMES: ThemeMeta[] = [
  { id: 'sticky-yellow', label: 'Sticky', swatch: '#fff176', colors: THEME_COLORS['sticky-yellow'] },
  { id: 'sticky-pink', label: 'Rose', swatch: '#ffb3b3', colors: THEME_COLORS['sticky-pink'] },
  { id: 'ocean', label: 'Ocean', swatch: '#b8d8ff', colors: THEME_COLORS.ocean },
  { id: 'sage', label: 'Sage', swatch: '#b8dfc8', colors: THEME_COLORS.sage },
  { id: 'parchment', label: 'Parchment', swatch: '#f0ebe0', colors: THEME_COLORS.parchment },
  { id: 'slate', label: 'Slate', swatch: '#2b2d31', colors: THEME_COLORS.slate },
  { id: 'midnight', label: 'Midnight', swatch: '#0f1724', colors: THEME_COLORS.midnight },
  { id: 'forest', label: 'Forest', swatch: '#1a2620', colors: THEME_COLORS.forest },
]

export const DEFAULT_THEME: ThemeId = 'sticky-yellow'
