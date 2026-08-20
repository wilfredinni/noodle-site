import { mkdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import sharp from "sharp"

const root = new URL("..", import.meta.url).pathname
const svgDir = join(root, "src/assets/noodle/social")
const pngDir = join(root, "public/social")
const embedPrompt = join(root, ".agents/skills/impeccable/scripts/embed-prompt.mjs")
const execFileAsync = promisify(execFile)
await Promise.all([mkdir(svgDir, { recursive: true }), mkdir(pngDir, { recursive: true })])

const mark = await readFile(join(root, "src/assets/noodle/logo-kraken-dark.svg"))
const markUri = `data:image/svg+xml;base64,${mark.toString("base64")}`

const colors = {
  yellow: "#F2C65A",
  navy: "#08172D",
  coral: "#EF7B63",
  teal: "#59C9BE",
}

const contract = `
  <!--
    THESIS: Noodle owns a bold saffron field instead of a generic dark developer card.
    OWN-WORLD: saffron ground, navy kraken, restrained coral or teal rules, Bodoni promise, Avenir explanation.
    STORY: recognize Noodle, understand the terminal REST client, then visit noodlerest.dev.
    FIRST VIEWPORT: message left, complete kraken right, generous margins, URL anchored low.
    FORM: Saffron Field, selected by the user from three social-image concepts.
    FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
  -->`

const type = `
  <style>
    .display { font-family: "Bodoni 72", "Bodoni MT", Georgia, serif; letter-spacing: -1.5px; }
    .sans { font-family: "Avenir Next", Helvetica, Arial, sans-serif; }
    .mono { font-family: Menlo, monospace; letter-spacing: 0.5px; }
  </style>`

const logo = (x, y, width, height) =>
  `<image href="${markUri}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/>`

const frame = (width, height, body) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${contract}
  ${type}
  <rect width="${width}" height="${height}" fill="${colors.yellow}"/>
  ${body}
</svg>`

const cards = [
  {
    name: "profile-avatar",
    width: 400,
    height: 400,
    svg: frame(400, 400, logo(34, 48, 332, 296)),
  },
  {
    name: "og-default",
    width: 1200,
    height: 630,
    svg: frame(1200, 630, `
      <text x="72" y="231" class="display" fill="${colors.navy}" font-size="76">API workflows,</text>
      <text x="72" y="318" class="display" fill="${colors.navy}" font-size="86" font-style="italic">untangled.</text>
      <text x="76" y="386" class="sans" fill="${colors.navy}" font-size="20">Readable files. Live requests. Any terminal.</text>
      <line x1="76" y1="494" x2="560" y2="494" stroke="${colors.navy}" opacity="0.35"/>
      <text x="76" y="538" class="mono" fill="${colors.navy}" font-size="14">noodlerest.dev</text>
      ${logo(730, 68, 430, 384)}
    `),
  },
  {
    name: "release",
    width: 1200,
    height: 630,
    svg: frame(1200, 630, `
      <rect x="0" y="612" width="1200" height="18" fill="${colors.coral}"/>
      <text x="72" y="108" class="mono" fill="${colors.navy}" font-size="18">NOODLE RELEASES</text>
      <text x="72" y="236" class="display" fill="${colors.navy}" font-size="76">What shipped,</text>
      <text x="72" y="322" class="display" fill="${colors.navy}" font-size="86" font-style="italic">and why.</text>
      <text x="76" y="393" class="sans" fill="${colors.navy}" font-size="18">Release notes from the terminal REST client.</text>
      <line x1="76" y1="494" x2="560" y2="494" stroke="${colors.navy}" opacity="0.35"/>
      <text x="76" y="538" class="mono" fill="${colors.navy}" font-size="14">noodlerest.dev/releases</text>
      ${logo(730, 68, 430, 384)}
    `),
  },
  {
    name: "blog",
    width: 1200,
    height: 630,
    svg: frame(1200, 630, `
      <rect x="0" y="612" width="1200" height="18" fill="${colors.teal}"/>
      <text x="72" y="231" class="display" fill="${colors.navy}" font-size="76">Stories from</text>
      <text x="72" y="318" class="display" fill="${colors.navy}" font-size="86" font-style="italic">the terminal.</text>
      <text x="76" y="386" class="sans" fill="${colors.navy}" font-size="20">Updates, architecture, and feature deep-dives.</text>
      <line x1="76" y1="494" x2="560" y2="494" stroke="${colors.navy}" opacity="0.35"/>
      <text x="76" y="538" class="mono" fill="${colors.navy}" font-size="14">noodlerest.dev/blog</text>
      ${logo(730, 68, 430, 384)}
    `),
  },
  {
    name: "github-social-preview",
    width: 1280,
    height: 640,
    svg: frame(1280, 640, `
      <text x="80" y="235" class="display" fill="${colors.navy}" font-size="78">API workflows,</text>
      <text x="80" y="324" class="display" fill="${colors.navy}" font-size="88" font-style="italic">untangled.</text>
      <text x="84" y="394" class="sans" fill="${colors.navy}" font-size="20">Readable files. Live requests. Any terminal.</text>
      <line x1="84" y1="502" x2="586" y2="502" stroke="${colors.navy}" opacity="0.35"/>
      <text x="84" y="548" class="mono" fill="${colors.navy}" font-size="14">noodlerest.dev</text>
      ${logo(786, 80, 430, 380)}
    `),
  },
  {
    name: "square-announcement",
    width: 1080,
    height: 1080,
    svg: frame(1080, 1080, `
      ${logo(240, 62, 600, 536)}
      <text x="540" y="768" class="display" fill="${colors.navy}" font-size="78" text-anchor="middle">API workflows,</text>
      <text x="540" y="861" class="display" fill="${colors.navy}" font-size="90" font-style="italic" text-anchor="middle">untangled.</text>
      <text x="540" y="936" class="sans" fill="${colors.navy}" font-size="20" text-anchor="middle">Readable files. Live requests. Any terminal.</text>
      <text x="540" y="1012" class="mono" fill="${colors.navy}" font-size="14" text-anchor="middle">noodlerest.dev</text>
    `),
  },
  {
    name: "x-header",
    width: 1500,
    height: 500,
    svg: frame(1500, 500, `
      <text x="120" y="188" class="display" fill="${colors.navy}" font-size="76">API workflows,</text>
      <text x="120" y="278" class="display" fill="${colors.navy}" font-size="86" font-style="italic">untangled.</text>
      <text x="124" y="343" class="sans" fill="${colors.navy}" font-size="18">Readable files. Live requests. Any terminal.</text>
      <text x="124" y="411" class="mono" fill="${colors.navy}" font-size="14">noodlerest.dev</text>
      ${logo(968, 40, 440, 393)}
    `),
  },
  {
    name: "linkedin-cover",
    width: 4200,
    height: 700,
    svg: frame(4200, 700, `
      <rect x="0" y="0" width="74" height="700" fill="${colors.coral}"/>
      <text x="820" y="302" class="display" fill="${colors.navy}" font-size="146">API workflows,</text>
      <text x="820" y="466" class="display" fill="${colors.navy}" font-size="164" font-style="italic">untangled.</text>
      <text x="832" y="568" class="sans" fill="${colors.navy}" font-size="34">Readable files. Live requests. Any terminal.</text>
      <text x="832" y="632" class="mono" fill="${colors.navy}" font-size="22">noodlerest.dev</text>
      ${logo(3030, 44, 620, 554)}
    `),
  },
]

for (const card of cards) {
  const svgPath = join(svgDir, `${card.name}.svg`)
  const pngPath = join(pngDir, `${card.name}.png`)
  await writeFile(svgPath, card.svg)
  await sharp(Buffer.from(card.svg))
    .png({ compressionLevel: 9, adaptiveFiltering: true, palette: true, quality: 100 })
    .toFile(pngPath)
  await execFileAsync(process.execPath, [
    embedPrompt,
    pngPath,
    "--prompt",
    `Origin: rendered from src/assets/noodle/social/${card.name}.svg by scripts/generate-social-images.mjs. Direction: user-selected Saffron Field with a saffron ground and navy kraken.`,
  ])
  console.log(`${card.name}: ${card.width}x${card.height}`)
}
