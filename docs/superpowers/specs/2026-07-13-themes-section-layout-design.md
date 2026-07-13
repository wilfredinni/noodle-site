# Design Spec: Personalization Section Layout Realignment

## Goal
Realign the landing page's personalization (themes) section to use the same 2-column layout style as the "noodle is for you" section, keeping the tag, title, and paragraph text on the left, and the visual image and legend on the right.

## Proposed Changes

### HTML Structure
In [index.astro](file:///Users/carlosmontecinos/Projects/noodle-site/src/pages/index.astro):
- Restructure the `<section class="themes-section">` element to split its children into two direct child containers: `.themes-left` (holding the tag, heading, and description paragraph) and `.themes-right` (holding the screenshot visual and legend).

```html
<section class="themes-section">
  <div class="themes-left">
    <span class="section-tag"># personalization</span>
    <h2>30+ built-in themes to match your workspace.</h2>
    <p>
      Noodle comes pre-packaged with over 30 beautiful themes (including Catppuccin, Everforest, Nord, and Tokyo Night). Give your terminal some personality and work in a space that feels uniquely yours.
    </p>
  </div>
  <div class="themes-right">
    <div class="themes-visual">
      <Image src={themesImage} class="themes-screenshot" alt="Noodle Themes Collection" loading="lazy" />
      <div class="visual-glow"></div>
    </div>
    <p class="themes-legend">
      Press <code>Ctrl+T</code> inside Noodle to open the interactive theme picker.
    </p>
  </div>
</section>
```

### CSS Styling
In the `<style>` block of [index.astro](file:///Users/carlosmontecinos/Projects/noodle-site/src/pages/index.astro):
- Update `.themes-section` to use CSS grid mirroring `.local-yaml-section`:
  - `display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;`
- Add `.themes-left` styling to mirror `.yaml-right`:
  - `display: flex; flex-direction: column; gap: 1.5rem;`
- Add `.themes-left h2` styling to match the heading styles:
  - `font-size: clamp(1.4rem, 2.5vw, 2.2rem); font-weight: 400; line-height: 1.3; color: var(--fg); text-align: left;`
- Add `.themes-left p` styling to match:
  - `font-size: 1rem; line-height: 1.6; color: var(--muted);`
- Update `.themes-right` styling to wrap the image and legend.
- Clean up unused CSS classes like `.section-header`, `.header-left`, `.header-right` if they are no longer needed by any other section.
- Add responsive media queries inside `@media (max-width: 900px)` to stack the columns:
  ```css
  .themes-section {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
  ```

## Verification Plan
1. Check the build of the Astro dev server for any errors.
2. Confirm the visual design alignment in the browser by checking that margins, gaps, paddings, and font sizes of both sections are perfectly aligned.
