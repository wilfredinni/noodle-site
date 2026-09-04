import { readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const assets = join(root, "src/assets/noodle")
const publicDir = join(root, "public")
const masterPath = join(assets, "logo-kraken-master.svg")
const navy = "#08172D"
const paper = "#F3EFE7"
const saffron = "#F2C65A"
const surface = "#181613"

const master = await readFile(masterPath, "utf8")
const path = master.match(/<path[\s\S]*?\/>/)?.[0]
if (!path) throw new Error("Could not read the master logo path")

const transparent = (fill) => master.replaceAll(navy, fill)
const tile = (scale = 0.78) => {
  const offset = (512 - 512 * scale) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="92" fill="${surface}"/>
  <g transform="translate(${offset} ${offset}) scale(${scale})">${path.replaceAll(navy, saffron)}</g>
</svg>`
}

await Promise.all([
  writeFile(join(assets, "logo-kraken-dark.svg"), transparent(navy)),
  writeFile(join(assets, "logo-kraken-light.svg"), transparent(saffron)),
  writeFile(join(assets, "logo-kraken-neutral.svg"), transparent(paper)),
  writeFile(join(assets, "logo-kraken-nav.svg"), transparent(saffron)),
  writeFile(join(assets, "logo-kraken-badge.svg"), tile()),
])

const render = (svg, size, output) => sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9 }).toFile(output)
await Promise.all([
  render(transparent(navy), 1024, join(assets, "logo-kraken-master.png")),
  render(transparent(saffron), 1024, join(assets, "logo-kraken-source.png")),
  render(transparent(saffron), 512, join(assets, "logo-kraken-nav.png")),
  render(transparent(saffron), 512, join(assets, "logo-kraken-nav-wide.png")),
  render(tile(0.8), 16, join(publicDir, "favicon-16x16.png")),
  render(tile(0.8), 32, join(publicDir, "favicon-32x32.png")),
  render(tile(0.72), 180, join(publicDir, "apple-touch-icon.png")),
  render(tile(0.72), 192, join(publicDir, "android-chrome-192x192.png")),
  render(tile(0.72), 512, join(publicDir, "android-chrome-512x512.png")),
])

const png = await readFile(join(publicDir, "favicon-32x32.png"))
const ico = Buffer.alloc(22)
ico.writeUInt16LE(1, 2)
ico.writeUInt16LE(1, 4)
ico[6] = 32
ico[7] = 32
ico.writeUInt16LE(1, 10)
ico.writeUInt16LE(32, 12)
ico.writeUInt32LE(png.length, 14)
ico.writeUInt32LE(22, 18)
await writeFile(join(publicDir, "favicon.ico"), Buffer.concat([ico, png]))

console.log("Generated logo variants, favicons, and device icons")
