export const THEMES = {
  minimal: { name: 'Pure Minimalist', bg: '#FFFFFF', accent: '#0F172A', soft: '#F1F5F9', border: '#CBD5E1', text: '#1A1A1A', muted: '#64748B' },
  warm: { name: 'Warm Studio', bg: '#FDFBF7', accent: '#9A4A12', soft: '#F6EEE2', border: '#E7D8C3', text: '#2A2118', muted: '#8A7660' },
  cool: { name: 'Cool Tech', bg: '#F8FAFC', accent: '#2F5D8F', soft: '#E6EEF7', border: '#C9D7E6', text: '#0F1B2D', muted: '#5E718A' },
  slate: { name: 'Creative Slate', bg: '#F1F5F9', accent: '#0B1220', soft: '#E2E8F0', border: '#CBD5E1', text: '#0B1220', muted: '#475569' },
}

const hexToRgb = h => {
  const n = parseInt(h.replace('#', '').padEnd(6, '0'), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const rgbToHex = rgb => '#' + rgb.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')
const mix = (a, b, t) => rgbToHex(hexToRgb(a).map((v, i) => v + (hexToRgb(b)[i] - v) * t))
const luminance = h => {
  const [r, g, b] = hexToRgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Derive a readable palette from any background color. */
export function customTheme(bg) {
  const dark = luminance(bg) < 0.35
  const ink = dark ? '#FFFFFF' : '#0F172A'
  return {
    name: 'Custom', bg,
    accent: dark ? mix(bg, '#FFFFFF', 0.85) : mix(bg, '#0F172A', 0.85),
    soft: mix(bg, ink, 0.06),
    border: mix(bg, ink, 0.18),
    text: dark ? '#F8FAFC' : '#1A1A1A',
    muted: mix(bg, ink, 0.55),
    onAccent: dark ? '#0F172A' : '#FFFFFF',
  }
}

export function resolveTheme(theme) {
  return theme.preset === 'custom' ? customTheme(theme.custom) : { onAccent: '#FFFFFF', ...THEMES[theme.preset] }
}
