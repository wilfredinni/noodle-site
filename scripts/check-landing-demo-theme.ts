// Run with: bun scripts/check-landing-demo-theme.ts
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { noodleTheme, themeVariables, formatSize, formatStatus, statusColorToken } from "../src/components/landing/noodle-demo"

for (const [bytes, expected] of [[0, "0B"], [292, "292B"], [1023, "1023B"], [1024, "1.0KB"], [1536, "1.5KB"], [1048576, "1.0MB"]] as const) {
  assert.equal(formatSize(bytes), expected)
}
for (const [status, expected] of [[100, "text-muted"], [199, "text-muted"], [200, "success"], [299, "success"], [300, "info"], [399, "info"], [400, "error"], [599, "error"], [600, "text-muted"]] as const) {
  assert.equal(statusColorToken(status), expected)
}
assert.equal(formatStatus("200 OK"), "200 OK")
assert.equal(formatStatus("204"), "204")
assert.equal(formatStatus("500 Internal Server Error"), "500 Internal Serv…")

// Deliberately distinct colors catch roles that accidentally share Noodle's values.
const palette = { ...noodleTheme, name: "probe", primary: "#010203", accent: "#040506", backgroundPanel: "#070809", textMuted: "#0a0b0c" }
const variables = themeVariables(palette)
for (const [role, value] of Object.entries(palette)) {
  if (role === "name") continue
  const key = `--demo-${role.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`
  assert.equal(variables[key], value)
}
assert.ok(decodeURIComponent(variables["--demo-select-chevron"]).includes(`fill="${palette.textMuted}"`))
const css = readFileSync(new URL("../src/components/landing/NoodleDemo.astro", import.meta.url), "utf8").split("<style>")[1]!
assert.doesNotMatch(css, /#[\da-f]{3,8}\b|rgba?\(/i, "Demo CSS must consume theme colors")
for (const [, variable] of css.matchAll(/var\((--demo-[\w-]+)/g)) {
  assert.ok(variable in variables || ["--demo-line", "--demo-stripe", "--demo-status"].includes(variable), `Missing theme role: ${variable}`)
}
console.log("Demo theme roles, badge formatting, and status boundaries passed")
