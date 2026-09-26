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
