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

// ponytail: tokenize fixed samples only; use a parser if editable code is added.
export function codeLines(code: string, language = "json") {
  return code.split("\n").map((line) => {
    if (language === "xml") {
      return `${line}\n`.split(/(<\/?[\w:.-]+|\/?>)/g).flatMap((text) => {
        if (text.startsWith("<")) {
          const end = text.startsWith("</") ? 2 : 1
          return [{ text: text.slice(0, end), kind: "punctuation" }, { text: text.slice(end), kind: "tag" }]
        }
        return [{ text, kind: /^[/>]+$/.test(text) ? "punctuation" : "plain" }]
      })
    }
    const parts = `${line}\n`.split(/(\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\$(?:random|time)\.\w+|\b[a-zA-Z_]\w*\b|\b\d+(?:\.\d+)?\b|[{}\[\](),.:;=<>+?!])/g)
    let offset = 0
    return parts.flatMap((text) => {
      const before = line.slice(0, offset)
      offset += text.length
      const after = line.slice(offset).trimStart()
      const kind = text.startsWith("//") ? "comment"
        : text.startsWith("$") ? "variable"
        : /^["']/.test(text) ? language === "json" && after.startsWith(":") ? "key" : "string"
        : /^\d/.test(text) ? "number"
        : /^(true|false|null)$/.test(text) ? "constant"
        : /^(const|let|var|if|for|of|await|return|throw|new)$/.test(text) ? "keyword"
        : /^(Number|String|Boolean|Object|Array)$/.test(text) ? "constructor"
        : /^[a-zA-Z_]/.test(text) ? after.startsWith("(") ? "function" : before.endsWith(".") ? "property" : "plain"
        : /^[{}\[\](),.:;=<>+?!]$/.test(text) ? "punctuation" : "plain"
      return kind === "string" && language === "json"
        ? text.split(/(\$(?:random|time)\.\w+)/g).map((part) => ({ text: part, kind: part.startsWith("$") ? "variable" : kind }))
        : [{ text, kind }]
    })
  })
}
