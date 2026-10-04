// Run with: bun scripts/check-landing-demo-theme.ts
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { noodleTheme, siteThemes, themeVariables, siteVariables, contrast } from "../src/lib/themes"
import { codeLines, formatSize, formatStatus, statusColorToken } from "../src/components/landing/noodle-demo"
import { examples } from "../src/components/landing/noodle-demo-examples"

assert.equal(siteThemes.length, 8)
assert.equal(new Set(siteThemes.map(({ theme }) => theme.name)).size, 8)
for (const { label, theme } of siteThemes) {
  const web = siteVariables(theme)
  for (const background of ["--bg", "--bg-elevated", "--bg-card"]) {
    for (const foreground of ["--fg", "--muted", "--accent", "--green", "--orange", "--coral", "--color-blue", "--color-red", "--color-purple"]) {
      assert.ok(contrast(web[foreground]!, web[background]!) >= 4.5, `${label}: ${foreground} on ${background}`)
    }
  }
  for (const background of ["--accent", "--accent-dim"]) assert.ok(contrast(web["--accent-text"]!, web[background]!) >= 4.5, `${label}: button contrast`)
  assert.ok(contrast(web["--coral-ink"]!, web["--ivory"]!) >= 4.5, `${label}: paper panel contrast`)
  assert.ok(label)
  assert.deepEqual(Object.keys(theme).sort(), Object.keys(noodleTheme).sort(), `${label}: complete palette`)
  for (const [role, value] of Object.entries(theme)) {
    if (role !== "name") assert.match(value, /^#[\da-f]{6}$/i, `${label}: valid ${role}`)
  }
}

for (const [bytes, expected] of [[0, "0B"], [292, "292B"], [1023, "1023B"], [1024, "1.0KB"], [1536, "1.5KB"], [1048576, "1.0MB"]] as const) {
  assert.equal(formatSize(bytes), expected)
}
for (const [status, expected] of [[100, "text-muted"], [199, "text-muted"], [200, "success"], [299, "success"], [300, "info"], [399, "info"], [400, "error"], [599, "error"], [600, "text-muted"]] as const) {
  assert.equal(statusColorToken(status), expected)
}
assert.equal(formatStatus("200 OK"), "200 OK")
assert.equal(formatStatus("204"), "204")
assert.equal(formatStatus("500 Internal Server Error"), "500 Internal Serv…")

for (const example of examples) {
  for (const [source, language] of [[example.body, example.bodyFormat === "XML" ? "xml" : "json"], [JSON.stringify(example.response, null, 2), "json"], [example.scripts?.pre, "javascript"], [example.scripts?.post, "javascript"], [example.tests, "javascript"]]) {
    if (!source) continue
    assert.equal(codeLines(source, language).flat().map((token) => token.text).join(""), `${source}\n`, `${example.id}: highlighting preserves source`)
  }
}
const tokens = (source: string, language = "json") => codeLines(source, language).flat().filter((token) => token.text.trim())
assert.equal(tokens('// Example row: { "user_id": 1 }', "javascript")[0]!.kind, "comment")
assert.equal(tokens('"https://example.com"', "javascript")[0]!.kind, "string")
assert.ok(tokens('"Created at $time.iso"').some((token) => token.text === "$time.iso" && token.kind === "variable"))
assert.ok(tokens("<message>Hello</message>", "xml").filter((token) => token.text === "message").every((token) => token.kind === "tag"))
assert.equal(tokens("Number(row.user_id)", "javascript")[0]!.kind, "constructor")

// Deliberately distinct colors catch roles that accidentally share Noodle's values.
const palette = { ...noodleTheme, name: "probe", primary: "#010203", accent: "#040506", backgroundPanel: "#070809", textMuted: "#0a0b0c" }
const variables = themeVariables(palette)
for (const [role, value] of Object.entries(palette)) {
  if (role === "name") continue
  const key = `--demo-${role.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`
  assert.equal(variables[key], value)
}
assert.ok(decodeURIComponent(variables["--demo-select-chevron"]).includes(`fill="${palette.text}"`))
const css = readFileSync(new URL("../src/components/landing/NoodleDemo.astro", import.meta.url), "utf8").split("<style>")[1]!
assert.doesNotMatch(css, /#[\da-f]{3,8}\b|rgba?\(/i, "Demo CSS must consume theme colors")
for (const [, variable] of css.matchAll(/var\((--demo-[\w-]+)/g)) {
  assert.ok(variable in variables || ["--demo-line", "--demo-stripe", "--demo-status"].includes(variable), `Missing theme role: ${variable}`)
}
console.log("Demo theme roles, badge formatting, and sample syntax highlighting passed")
