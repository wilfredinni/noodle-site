// Local snapshots of Noodle's theme-data.ts; no sibling repo is required.
// Add a labeled palette to siteThemes to include it in the site-wide palette menu.
export const noodleTheme = {
  name: "noodle",
  primary: "#59c9be",
  secondary: "#f2c65a",
  accent: "#ef7b63",
  error: "#ef7b63",
  warning: "#f0a96b",
  success: "#9dcb82",
  info: "#89b4fa",
  text: "#f3efe7",
  textMuted: "#aaa39a",
  background: "#181714",
  backgroundPanel: "#181714",
  backgroundElement: "#24211d",
  borderDimmest: "#302b26",
  border: "#3b3630",
  borderActive: "#59c9be",
  borderSubtle: "#514a42",
}

export type ThemePalette = typeof noodleTheme
export const defaultSiteTheme = "dracula"

export const siteThemes: { label: string; theme: ThemePalette }[] = [
  { label: "Noodle", theme: noodleTheme },
  { label: "Aura", theme: {
      name: "aura",
      primary: "#a277ff",
      secondary: "#f694ff",
      accent: "#a277ff",
      error: "#ff6767",
      warning: "#ffca85",
      success: "#61ffca",
      info: "#a277ff",
      text: "#edecee",
      textMuted: "#6d6d6d",
      background: "#0f0f0f",
      backgroundPanel: "#15141b",
      borderDimmest: "#19181e",
      backgroundElement: "#282633",
      border: "#2d2d2d",
      borderActive: "#6d6d6d",
      borderSubtle: "#2d2d2d",
    } },
  { label: "Carbonfox", theme: {
      name: "carbonfox",
      primary: "#33b1ff",
      secondary: "#78a9ff",
      accent: "#ff7eb6",
      error: "#ee5396",
      warning: "#f1c21b",
      success: "#25be6a",
      info: "#78a9ff",
      text: "#f2f4f8",
      textMuted: "#7d848f",
      background: "#161616",
      backgroundPanel: "#1a1a1a",
      borderDimmest: "#1f1f1f",
      backgroundElement: "#2a2a2a",
      border: "#303030",
      borderActive: "#33b1ff",
      borderSubtle: "#303030",
    } },
  { label: "Catppuccin", theme: {
      name: "catppuccin",
      primary: "#cba6f7",
      secondary: "#89b4fa",
      accent: "#f5c2e7",
      error: "#f38ba8",
      warning: "#fab387",
      success: "#a6e3a1",
      info: "#89dceb",
      text: "#cdd6f4",
      textMuted: "#6c7086",
      background: "#1e1e2e",
      backgroundPanel: "#181825",
      borderDimmest: "#313244",
      backgroundElement: "#313244",
      border: "#45475a",
      borderActive: "#585b70",
      borderSubtle: "#313244",
    } },
  { label: "Claude Code", theme: {
      name: "claude-code",
      primary: "#da7756",
      secondary: "#b1b9f9",
      accent: "#6a9bcc",
      error: "#ef6f6c",
      warning: "#e0a458",
      success: "#7a8f5f",
      info: "#6a9bcc",
      text: "#ffffff",
      textMuted: "#a0a0a0",
      background: "#1f1f1f",
      backgroundPanel: "#1f1f1f",
      borderDimmest: "#292929",
      backgroundElement: "#373737",
      border: "#505050",
      borderActive: "#da7756",
      borderSubtle: "#3f3f3f",
    } },
  { label: "Cobalt2", theme: {
      name: "cobalt2",
      primary: "#0088ff",
      secondary: "#9a5feb",
      accent: "#2affdf",
      error: "#ff0088",
      warning: "#ffc600",
      success: "#9eff80",
      info: "#ff9d00",
      text: "#ffffff",
      textMuted: "#adb7c9",
      background: "#193549",
      backgroundPanel: "#122738",
      borderDimmest: "#1c405a",
      backgroundElement: "#1f4662",
      border: "#1f4662",
      borderActive: "#0088ff",
      borderSubtle: "#1c405a",
    } },
  { label: "Dracula", theme: {
      name: "dracula",
      primary: "#bd93f9",
      secondary: "#ff79c6",
      accent: "#8be9fd",
      error: "#ff5555",
      warning: "#f1fa8c",
      success: "#50fa7b",
      info: "#ffb86c",
      text: "#f8f8f2",
      textMuted: "#6272a4",
      background: "#282a36",
      backgroundPanel: "#21222c",
      borderDimmest: "#3e4051",
      backgroundElement: "#44475a",
      border: "#44475a",
      borderActive: "#bd93f9",
      borderSubtle: "#383b48",
    } },
  { label: "Synthwave84", theme: {
      name: "synthwave84",
      primary: "#36f9f6",
      secondary: "#ff7edb",
      accent: "#b084eb",
      error: "#fe4450",
      warning: "#fede5d",
      success: "#72f1b8",
      info: "#ff8b39",
      text: "#ffffff",
      textMuted: "#848bbd",
      background: "#262335",
      backgroundPanel: "#1e1a29",
      borderDimmest: "#292038",
      backgroundElement: "#332a45",
      border: "#495495",
      borderActive: "#36f9f6",
      borderSubtle: "#495495",
    } },
]

export function themeVariables(theme: ThemePalette) {
  const variables = Object.entries(theme)
    .filter(([key]) => key !== "name")
    .map(([key, value]) => [`--demo-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`, value])
  const chevron = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 6"><path fill="${theme.text}" d="M0 0h10L5 6z"/></svg>`
  return { ...Object.fromEntries(variables), "--demo-select-chevron": `url("data:image/svg+xml,${encodeURIComponent(chevron)}")` }
}

// Web text needs stronger contrast than some of the native terminal's muted roles.
const channels = (hex: string) => [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16))
const mix = (a: string, b: string, amount: number) => "#" + channels(a).map((value, index) => Math.round(value + (channels(b)[index]! - value) * amount).toString(16).padStart(2, "0")).join("")
const luminance = (hex: string) => channels(hex).map((value) => {
  const channel = value / 255
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
}).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index]!, 0)
export const contrast = (a: string, b: string) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05)
function readable(color: string, backgrounds: string[]) {
  const target = luminance(backgrounds[0]!) < 0.5 ? "#ffffff" : "#000000"
  for (let step = 0; step <= 100; step++) {
    const candidate = mix(color, target, step / 100)
    if (backgrounds.every((bg) => contrast(candidate, bg) >= 4.5)) return candidate
  }
  return target
}

export function siteVariables(theme: ThemePalette): Record<string, string> {
  const noodle = theme.name === "noodle"
  const bg = noodle ? "#181613" : theme.background
  const elevated = noodle ? "#201d19" : theme.backgroundPanel
  const panel = theme.backgroundElement
  const surfaces = [bg, elevated, panel]
  const accent = readable(theme.primary, surfaces)
  const muted = readable(theme.textMuted, surfaces)
  const paper = noodle ? "#eee7da" : mix(theme.text, theme.primary, 0.08)
  const ink = noodle ? "#211e1a" : bg
  const accentLow = mix(bg, accent, 0.18)
  const variables: Record<string, string> = {
    ...themeVariables(theme),
    "--bg": bg, "--bg-elevated": elevated, "--bg-card": panel, "--panel": panel,
    "--fg": theme.text, "--muted": muted, "--accent": accent,
    "--accent-dim": noodle ? "#3daaa1" : mix(accent, theme.text, 0.12),
    "--accent-text": bg, "--accent-glow": "transparent",
    "--border": theme.border, "--border-hover": noodle ? "#514a42" : mix(theme.border, theme.text, 0.25),
    "--rule": `color-mix(in srgb, ${theme.text} 12%, transparent)`,
    "--violet": readable(noodle ? theme.primary : theme.secondary, surfaces), "--cyan": accent,
    "--green": readable(theme.success, surfaces), "--orange": readable(theme.warning, surfaces),
    "--noodle": readable(theme.secondary, surfaces), "--coral": readable(theme.accent, surfaces),
    "--coral-ink": readable(noodle ? "#9b3f31" : theme.accent, [paper]),
    "--ivory": paper, "--ivory-ink": ink,
    "--color-orange": readable(theme.warning, surfaces), "--color-green": readable(theme.success, surfaces),
    "--color-blue": readable(theme.info, surfaces), "--color-red": readable(noodle ? "#f38ba8" : theme.error, surfaces),
    "--color-purple": readable(noodle ? theme.primary : theme.secondary, surfaces), "--color-yellow": readable(noodle ? "#f9e2af" : theme.warning, surfaces),
    "--sl-color-accent-low": accentLow, "--sl-color-accent": accent, "--sl-color-accent-high": mix(accent, theme.text, 0.75),
    "--sl-color-white": theme.text, "--sl-color-black": bg,
    "--sl-color-gray-1": noodle ? "#d7d1c8" : mix(theme.text, muted, 0.2),
    "--sl-color-gray-2": muted, "--sl-color-gray-3": muted,
    "--sl-color-gray-4": mix(bg, theme.text, 0.4), "--sl-color-gray-5": theme.border,
    "--sl-color-gray-6": noodle ? "#302b26" : theme.backgroundElement,
    "--sl-color-bg": bg, "--sl-color-bg-nav": noodle ? "#1a1815" : elevated,
    "--sl-color-bg-sidebar": noodle ? "#1d1a17" : elevated, "--sl-color-bg-inline-code": panel,
    "--sl-color-bg-accent": accent, "--sl-color-text": theme.text,
    "--sl-color-text-accent": accent, "--sl-color-text-invert": bg,
    "--sl-color-hairline-light": theme.border, "--sl-color-hairline-shade": theme.borderSubtle,
    "--sl-color-border": theme.border, "--sl-color-border-accent": accent,
    "--sl-color-hero": accent,
  }
  for (const [name, color] of Object.entries({ orange: theme.warning, green: theme.success, blue: theme.primary, red: theme.error, purple: theme.secondary })) {
    const low = mix(bg, color, 0.16)
    variables[`--sl-color-${name}`] = readable(color, surfaces)
    variables[`--sl-color-${name}-high`] = readable(color, [...surfaces, low])
    variables[`--sl-color-${name}-low`] = low
  }
  variables["--page-pattern"] = pagePattern(variables["--noodle"]!, accent, theme.text)
  variables["--header-pattern"] = headerPattern(variables["--noodle"]!, accent)
  return variables
}

export const syntaxThemes = siteThemes.toSorted((a, b) => Number(b.theme.name === defaultSiteTheme) - Number(a.theme.name === defaultSiteTheme)).map(({ theme }) => ({
  name: theme.name,
  type: "dark" as const,
  colors: {
    "editor.background": siteVariables(theme)["--bg-elevated"]!,
    "editor.foreground": theme.text,
    "editorLineNumber.foreground": theme.textMuted,
    "editor.selectionBackground": theme.backgroundElement,
  },
  tokenColors: [
    { scope: ["comment"], settings: { foreground: theme.textMuted } },
    { scope: ["string"], settings: { foreground: theme.success } },
    { scope: ["constant.numeric", "constant.language"], settings: { foreground: theme.warning } },
    { scope: ["keyword", "storage"], settings: { foreground: theme.primary } },
    { scope: ["entity.name", "support", "variable", "meta.object-literal.key", "string.quoted.double.json"], settings: { foreground: theme.secondary } },
    { scope: ["entity.name.function"], settings: { foreground: theme.info } },
    { scope: ["punctuation"], settings: { foreground: theme.text } },
  ],
}))

export const siteThemeCSS = siteThemes.map(({ theme }) => {
  const selector = `${theme.name === defaultSiteTheme ? ":root," : ""}:root[data-site-theme="${theme.name}"]`
  return `${selector}{${Object.entries(siteVariables(theme)).map(([key, value]) => `${key}:${value}`).join(";")}}`
}).join("\n") + `\n:root{color-scheme:dark;--font-mono:'JetBrains Mono','Fira Code',monospace}`

function pagePattern(noodle: string, accent: string, text: string) {
  return `url("data:image/svg+xml,${encodeURIComponent(`<svg viewBox='0 0 1600 1500' xmlns='http://www.w3.org/2000/svg'><g fill='none' stroke-linecap='round'><path d='M-180 310C260 20 470 610 910 420S1390 610 1780 190' stroke='${noodle}' stroke-width='28' opacity='.075'/><path d='M1780 1080C1330 820 1160 1390 720 1190S210 910-180 1310' stroke='${accent}' stroke-width='20' opacity='.055'/><path d='M-180 330C260 40 470 630 910 440S1390 630 1780 210' stroke='${text}' stroke-width='3' opacity='.035'/></g></svg>`)}")`
}

function headerPattern(noodle: string, accent: string) {
  return `url("data:image/svg+xml,${encodeURIComponent(`<svg viewBox='0 0 1600 160' xmlns='http://www.w3.org/2000/svg'><g fill='none' stroke-linecap='round'><path d='M-140 120C260-80 490 250 900 75S1410 235 1740 15' stroke='${noodle}' stroke-width='20' opacity='.07'/><path d='M-120 145C300-45 535 245 960 100S1390 205 1730 45' stroke='${accent}' stroke-width='12' opacity='.055'/></g></svg>`)}")`
}
