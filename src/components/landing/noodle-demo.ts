// Local snapshot of Noodle's theme-data.ts. Add palettes with the same roles,
// then pass one to <NoodleDemo theme={palette} />; no sibling repo is required.
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

export type DemoTheme = typeof noodleTheme

export function themeVariables(theme: DemoTheme) {
  const variables = Object.entries(theme)
    .filter(([key]) => key !== "name")
    .map(([key, value]) => [`--demo-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`, value])
  const chevron = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 6"><path fill="${theme.textMuted}" d="M0 0h10L5 6z"/></svg>`
  return { ...Object.fromEntries(variables), "--demo-select-chevron": `url("data:image/svg+xml,${encodeURIComponent(chevron)}")` }
}

// Keep the badge formatting and HTTP color mapping aligned with ui/format.ts.
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

export function statusColorToken(status: number) {
  if (status >= 200 && status <= 299) return "success"
  if (status >= 300 && status <= 399) return "info"
  if (status >= 400 && status <= 599) return "error"
  return "text-muted"
}

export function formatStatus(status: string): string {
  const [code, ...words] = status.split(" ")
  const text = words.join(" ")
  return code + (text ? ` ${text.length > 13 ? `${text.slice(0, 13)}…` : text}` : "")
}
