---
name: Noodle
description: A full-featured, local-first terminal REST client whose requests live as readable YAML.
colors:
  background: "#1e1e2e"
  elevated-background: "#181825"
  card-surface: "#313244"
  foreground: "#cdd6f4"
  muted: "#a6adc8"
  primary: "#b4befe"
  primary-dim: "#9399e8"
  border: "#313244"
  border-hover: "#45475a"
  blue: "#89b4fa"
  green: "#a6e3a1"
  orange: "#fab387"
  red: "#f38ba8"
  purple: "#cba6f7"
  yellow: "#f9e2af"
typography:
  display:
    fontFamily: "JetBrains Mono, Fira Code, monospace"
    fontSize: "clamp(2rem, 4vw, 3.2rem)"
    fontWeight: 800
    lineHeight: 1.2
  headline:
    fontFamily: "JetBrains Mono, Fira Code, monospace"
    fontSize: "clamp(1.4rem, 2.5vw, 2.2rem)"
    fontWeight: 400
    lineHeight: 1.3
  body:
    fontFamily: "JetBrains Mono, Fira Code, monospace"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "JetBrains Mono, Fira Code, monospace"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.05em"
rounded:
  control: "4px"
  surface: "6px"
  image: "8px"
spacing:
  compact: "0.5rem"
  control: "0.75rem"
  card: "1.25rem"
  section: "2.5rem"
  feature-gap: "4rem"
components:
  install-control:
    backgroundColor: "{colors.elevated-background}"
    textColor: "{colors.blue}"
    rounded: "{rounded.surface}"
    padding: "0.75rem 1.25rem"
  feature-card:
    backgroundColor: "{colors.elevated-background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.surface}"
    padding: "{spacing.card}"
  nav-install:
    textColor: "{colors.muted}"
    rounded: "{rounded.control}"
    padding: "0.4rem 0.6rem"
---

# Design System: Noodle

## Overview

**Creative North Star: "The version-controlled workbench"**

Noodle’s site should feel like the interface around a well-kept local repository: capable, inspectable, and immediately useful. The Catppuccin Mocha surface, concise monospace language, and syntax-color accents make terminal work feel polished without pretending it needs a cloud workspace.

The system rejects the visual logic of commercial REST clients that hide work in proprietary formats or cloud accounts. It remains dark, direct, and information-dense, with visual variation coming from semantic code colors and real product screenshots rather than decorative effects.

**Key Characteristics:**

- Dark Catppuccin Mocha surfaces with high-contrast lavender foreground text.
- JetBrains Mono leads the visual voice; Inter is available as a fallback utility family.
- Small radii, crisp one-pixel rules, and solid offset shadows create terminal-like tactility.
- Color communicates feature category and code semantics, not generic decoration.
- Responsive layouts collapse to one focused column before content becomes cramped.

## Colors

The palette is Catppuccin Mocha used as a practical code-editor environment: lavender establishes the interface, while syntax colors identify purpose.

### Primary

- **Lavender Signal:** Used for the primary accent, important links, and the install control’s active state. It is the site’s unifying interface color.
- **Soft Lavender:** A lower-emphasis primary for secondary accent moments and glows.

### Secondary

- **Sky Syntax:** Used for executable commands and information that should read as actionable.
- **Greenlight:** Reserved for successful or install-oriented actions.
- **Orchid Marker:** Used for section tags and navigational emphasis.

### Tertiary

- **Peach Syntax:** Used for request composition and warm code detail.
- **Rose Syntax:** Used for failure or caution-oriented feature categories.
- **Butter Syntax:** Used sparingly for timeline and attention states.

### Neutral

- **Mocha Ground:** The page background. It carries the terminal atmosphere across the marketing site.
- **Crust Surface:** The elevated background for cards, controls, and navigation.
- **Slate Rule:** The standard border and structural shadow color.
- **Lavender Ink:** The default high-emphasis copy color.
- **Subtext:** The default supporting-copy color; never use it for content that must carry the primary message.

**The Syntax-Has-a-Job Rule.** Use blue, green, orange, red, purple, and yellow to distinguish real categories or states. Never add color merely to make a surface feel more animated.

## Typography

**Display Font:** JetBrains Mono, Fira Code, monospace
**Body Font:** JetBrains Mono, Fira Code, monospace
**Utility Fallback:** Inter, system-ui, sans-serif

**Character:** Typography should read like an unusually well-finished terminal: compact enough for developers, but given generous line-height and space so the marketing surface remains calm and approachable.

### Hierarchy

- **Display** (800, `clamp(2rem, 4vw, 3.2rem)`, 1.2): Hero statement only; keep it short and unforced.
- **Headline** (400, `clamp(1.4rem, 2.5vw, 2.2rem)`, 1.3): Section-level statements and the closing CTA.
- **Card Title** (700, 1.2rem, normal): Feature names and concise product claims.
- **Body** (400, 1rem, 1.6): Explanations, with a comfortable reading measure around 65–75 characters when layout permits.
- **Label** (700, 0.75rem, 0.05em): Commands, tags, and compact control labels; uppercase is allowed only for short labels such as `COPY`.

**The Command-Line Rule.** Code, commands, and feature names are literal. Avoid marketing-style type treatments, gradient text, excessive tracking, and decorative all-caps copy.

## Elevation

Noodle uses tonal layering first: Mocha Ground sits below Crust Surface, and one-pixel rules define component boundaries. Feature cards use a crisp solid offset shadow (`4px 4px 0` at rest, `6px 6px 0` on hover) to suggest a physical terminal panel rather than soft floating SaaS cards. The sticky navigation uses a purposeful backdrop blur to remain legible over scrolling content.

### Shadow Vocabulary

- **Terminal Offset** (`4px 4px 0 var(--border)`): Default feature-card depth.
- **Accent Offset** (`6px 6px 0 var(--accent-color)`): Feature-card hover feedback; the accent must match the card’s category.

**The Crisp-Depth Rule.** Borders and solid offset shadows may work together because the shadow is structural and hard-edged. Do not replace them with diffuse, oversized drop shadows.

## Components

### Navigation

- **Style:** Sticky, centered within a 1200px shell, with a lightly translucent Mocha Ground backdrop and a one-pixel bottom rule.
- **Typography:** The wordmark is 700-weight monospace at 1.25rem; navigation links are 0.9rem muted copy.
- **States:** Links shift from Subtext to Lavender Ink on hover. The compact install link uses a 4px radius and a border that brightens on hover.
- **Mobile:** At 768px and below, navigation moves into a toggle-controlled vertical menu; retain the Install and GitHub actions in the menu.

### Install Control

- **Character:** A command line rendered as an actionable, copyable control.
- **Shape:** Gently rounded terminal housing (6px) with a crisp one-pixel Slate Rule.
- **Color:** Command text uses Sky Syntax; the `COPY` action uses a Slate Rule fill and switches to Lavender Signal with Mocha Ground text on hover.
- **Responsive:** It may fill the available width on smaller screens, but command text must remain horizontally scrollable instead of wrapping or truncating.

### Feature Cards

- **Corner Style:** Compact terminal rounding (6px).
- **Background:** Crust Surface, with a Mocha Ground command inset.
- **Border and Depth:** One-pixel Slate Rule plus Terminal Offset; on hover, translate the card by -2px and switch the rule and offset to its semantic accent.
- **Internal Padding:** 1.25rem, with a 0.75rem internal rhythm.

### Feature Sections

- **Structure:** A two-column introduction and summary followed by a three-card grid; alternate the intro side only when it supports page rhythm.
- **Responsive:** Collapse header and cards to one column at 900px, center the copy, and preserve clear section spacing.

### Closing CTA

- **Style:** Centered, text-led ending separated by a dashed one-pixel Slate Rule—not a large promotional card.
- **Actions:** Install is Greenlight; GitHub is Orchid Marker. Both become Lavender Ink with an underline on hover.

## Do's and Don'ts

### Do:

- **Do** preserve the Catppuccin Mocha background and use Lavender Ink for high-emphasis text.
- **Do** use real terminal screenshots, YAML, commands, release history, and product behavior as the page’s evidence.
- **Do** keep controls compact: 4px radii for nav controls and 6px for cards or command housings.
- **Do** use `0.2s` color, border, and transform transitions, and remove or shorten movement for reduced-motion users.
- **Do** let blue, green, orange, red, purple, and yellow communicate a distinct feature category or status.

### Don't:

- **Don't** make Noodle resemble commercial REST clients that confine work to cloud-based workspaces, proprietary request formats, or lock-in-heavy account systems.
- **Don't** introduce soft “ghost-card” shadows, glassy decorative panels, giant radii, gradient text, or generic SaaS metrics.
- **Don't** turn every section tag into a tiny uppercase eyebrow; use the existing `#` terminal labels selectively.
- **Don't** hide essential commands or copy behind color alone; readable text contrast and keyboard access are baseline requirements.
- **Don't** replace the workbench-like terminal voice with a generic editorial or enterprise-software aesthetic.
