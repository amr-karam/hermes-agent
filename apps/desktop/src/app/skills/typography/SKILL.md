---
name: typography
description: Typography design skill for web interfaces. Covers font selection, typographic scale, vertical rhythm, font loading strategies, responsive typography, heading hierarchy, body copy optimization, and accessibility in typography.
---

# Typography for Web Design

## Font Selection

### Categories of Fonts

```
Sans-serif (modern, clean, digital):
  System: Inter, SF Pro, Roboto, Helvetica Neue
  Custom: Satoshi, Space Grotesk, GT America, Avenir Next, Proxima Nova

Serif (traditional, readable, print-inspired):
  System: Times New Roman, Georgia, Merriweather
  Custom: Freight Text, Playfair Display, Spectral, Lyon, Minion Pro

Monospace (technical, code, typewriter):
  System: SF Mono, Monaco, Consolas
  Custom: JetBrains Mono, Fira Code, Dank Mono, Source Code Pro

Display/Decorative (headline, accent):
  Use sparingly: Cinzel, Bebas Neue, Anton, or custom lettering
```

### Pairing Fonts

**Contrast + Harmony**: Pair a distinctive display font with a refined body font.

```css
/* Example pairings */
.pairing-1 {
  --font-body: "Inter", sans-serif;
  --font-display: "Space Grotesk", sans-serif;
  /* Inter: highly readable, neutral. Space Grotesk: geometric, characterful */
}

.pairing-2 {
  --font-body: "Lora", serif;
  --font-display: "Montserrat", sans-serif;
  /* Lora: warm, readable serif. Montserrat: bold, geometric sans */
}

.pairing-3 {
  --font-body: "JetBrains Mono", monospace;
  --font-display: "DM Sans", sans-serif;
  /* Techy pairing for developer tools */
}
```

### Font Loading Strategy

```css
/* Critical: use font-display: swap for web fonts */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap;  /* Show fallback until loaded */
}

/* Preload key fonts in HTML */
/*
<link rel="preload" href="/fonts/custom.woff2" as="font" type="font/woff2" crossorigin>
*/

/* Avoid FOIT (Flash of Invisible Text) and FOUC (Flash of Unstyled Text) */
.loading body {
  opacity: 0;
}
```

## Typographic Scale

### Modular Scale

Use a consistent ratio for your type hierarchy. Common ratios:

```css
:root {
  --font-base-size: 1rem;        /* 16px */
  --font-scale-ratio: 1.25;      /* Major third */

  /* Scale calculation:
    Level 0: 1rem         (16px)
    Level 1: 1.25rem      (20px)
    Level 2: 1.563rem     (25px)
    Level 3: 1.953rem     (31px)
    Level 4: 2.441rem     (39px)
    Level 5: 3.052rem     (49px)
    Level 6: 3.815rem     (61px)
  */

  --font-size-xs:   clamp(0.75rem, 0.7vw + 0.6rem, 0.875rem);
  --font-size-sm:   clamp(0.875rem, 0.8vw + 0.7rem, 1rem);
  --font-size-md:   clamp(1rem, 1vw + 0.8rem, 1.125rem);
  --font-size-lg:   clamp(1.125rem, 1.5vw + 0.8rem, 1.25rem);
  --font-size-xl:   clamp(1.25rem, 2vw + 0.9rem, 1.563rem);
  --font-size-2xl:  clamp(1.563rem, 3vw + 1rem, 1.953rem);
  --font-size-3xl:  clamp(1.953rem, 4vw + 1rem, 2.441rem);
  --font-size-4xl:  clamp(2.441rem, 5vw + 1.1rem, 3.052rem);
  --font-size-5xl:  clamp(3.052rem, 7vw + 1.2rem, 3.815rem);
  --font-size-6xl:  clamp(3.815rem, 9vw + 1.3rem, 4.768rem);
}

/* Heading classes */
h1 { font-size: var(--font-size-4xl); font-weight: 700; }
h2 { font-size: var(--font-size-3xl); font-weight: 700; }
h3 { font-size: var(--font-size-2xl); font-weight: 600; }
h4 { font-size: var(--font-size-xl); font-weight: 600; }
h5 { font-size: var(--font-size-lg); font-weight: 600; }
h6 { font-size: var(--font-size-md); font-weight: 600; }
```

### Vertical Rhythm

```css
:root {
  --line-height-body: 1.6;      /* For body text */
  --line-height-heading: 1.2;   /* Tighter for headings */
}

/* Keep vertical rhythm consistent */
p, ul, ol {
  margin-top: 0;
  margin-bottom: 1em;
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 2em;
  margin-bottom: 1em;
}

/* Use relative units for margins to maintain rhythm */
p + p {
  margin-top: 1.5em;  /* 1.6 × line-height, roughly */
}
```

## Responsive Typography

### Fluid Typography with clamp()

```css
/* clamp() ensures text is never too small or too large */
.display-3xl {
  font-size: clamp(2rem, 5vw + 1rem, 3.5rem);
  line-height: clamp(1.1, 1.05 + 0.5vw, 1.2);
}

.display-2xl {
  font-size: clamp(1.5rem, 3.5vw + 0.8rem, 2.5rem);
  line-height: clamp(1.15, 1.1 + 0.3vw, 1.25);
}

.body-xl {
  font-size: clamp(1.125rem, 2.5vw + 0.7rem, 1.25rem);
  line-height: 1.6;
}

.caption {
  font-size: clamp(0.75rem, 1.5vw + 0.5rem, 0.875rem);
  line-height: 1.5;
}
```

### Breakpoint Typography

```css
/* Mobile-first approach */
html { font-size: 16px; }

@media (min-width: 48rem) {   /* 768px — tablet */
  html { font-size: 17px; }
}

@media (min-width: 62rem) {   /* 992px — desktop */
  html { font-size: 18px; }
}

@media (min-width: 75rem) {  /* 1200px — large desktop */
  html { font-size: 19px; }
}
```

## Heading Hierarchy

### The Golden Rule

There should be **one and only one** `<h1>` per page. It should be the page title,
visible to all users (not visually hidden).

```html
<!-- ✅ Correct -->
<h1>Page Title — The One H1</h1>
<h2>Section Heading</h2>
<h3>Subsection Heading</h3>
<h4>Component Title</h4>
<h5>Card Title</h5>
<h6>Fine print heading</h6>

<!-- Follow hierarchy — don't skip levels -->
<!-- ✅ Good progression -->
<h2> → <h3> → <h4>

<!-- ❌ Bad — skips h3 */
<h2>Title</h2>
<h4>Subsection</h4>  /* Missing h3! */
```

### Heading Styling

```css
/* Distinct h1 — sets the page's primary visual */
h1 {
  font-size: var(--font-size-4xl);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 1.5em;
}

/* h2 — establishes major section divisions */
h2 {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  line-height: 1.15;
  margin-top: 2.5em;
  margin-bottom: 1em;
}

/* h3 — subsection within h2 */
h3 {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  line-height: 1.2;
  margin-top: 2em;
  margin-bottom: 0.75em;
}

/* Visually hidden but accessible headings */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## Body Copy Optimization

### Readability Rules

```css
.body-copy {
  /* Line length: 50–75 characters for comfort */
  max-width: 65ch;

  /* Line height: 1.5–1.6 for body text */
  line-height: 1.6;

  /* Letter spacing: neutral for body */
  letter-spacing: 0.01em;

  /* Word spacing: default */
  word-spacing: normal;

  /* Text color: sufficient contrast */
  color: var(--color-text-primary);

  /* Hyphenation for long-form text */
  hyphens: auto;
}

/* Justified text is problematic — avoid it */
/* If necessary, add hyphens and adjust tracking */
.text-justify {
  text-align: justify;
  hyphens: auto;
  text-justify: inter-word;
}
```

### Content Blocks

```css
/* Paragraph spacing — consistent rhythm */
p + p {
  margin-top: 1.5em;
}

/* Links within text */
a {
  color: var(--color-link);
  text-decoration: underline;
  text-underline-offset: 0.2em;
  text-decoration-thickness: 1px;
  transition: text-decoration-color 0.2s ease;
}

a:hover {
  text-decoration-color: currentColor;
}

/* Avoid removing underlines — they're the universal link indicator */
a:not(.button) {
  text-decoration: underline;
}
```

## Letter & Word Spacing

### Optical Adjustments

```css
/* Headings often benefit from tighter tracking */
.display {
  letter-spacing: -0.02em;
}

/* Body text stays neutral */
.body {
  letter-spacing: 0.01em;
}

/* All caps need more spacing */
.uppercase {
  letter-spacing: 0.05em;
  font-weight: 600;
}

/* Small text (captions, labels) */
.caption {
  letter-spacing: 0.03em;
}
```

## Accessible Typography

### Minimum Font Sizes

```css
/*
  WCAG recommends minimum 16px for body text
  14px is acceptable for captions (but consider 16px minimum)
*/

html { font-size: 16px; }

.caption {
  font-size: 0.875rem;  /* 14px — larger than 12px minimum */
}

/* Don't go below 12px for any text */
.micro {
  font-size: 0.75rem;  /* 12px — absolute floor */
}
```

### High Contrast & Legibility

```css
/* Ensure text works in both light and dark modes */
@media (prefers-color-scheme: dark) {
  .text-primary {
    color: var(--color-neutral-200);
  }
}

/* Users may set larger default fonts */
@media (min-width: 120rem) {
  html {
    font-size: 20px;  /* Scale up for low-vision users */
  }
}

/* Bold text carries more information scent */
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
```

### Focus Styles for Text Links

```css
a:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
  border-radius: 2px;
}
```

## Font Performance

### Optimization Checklist

```
□ Use variable fonts when possible (single file for all weights)
□ Subset fonts to include only used characters
□ Preload critical fonts in <head>
□ Use font-display: swap or fallback
□ Limit to 2 font families (one for headings, one for body)
□ Avoid loading too many weights (3–4 max)
□ Consider system fonts for performance-critical apps
□ Use woff2 format (90% smaller than woff)
```

### Variable Fonts

```css
/* Variable font — one file contains all variations */
@font-face {
  font-family: 'InterVariable';
  src: url('/fonts/Inter-roman.var.woff2') format('woff2') tech('variations');
  font-weight: 100 900;
  font-stretch: 75% 125%;
  font-display: swap;
}

.text {
  font-family: 'InterVariable', sans-serif;
  font-weight: 500;  /* Uses single file, no loading */
}

.text-bold {
  font-variation-settings: 'wght' 700;
}
```

## Text Utilities

### CSS Utility Classes

```css
/* Text alignment */
.text-left   { text-align: left; }
.text-center { text-align: center; }
.text-right  { text-align: right; }
.text-justify { text-align: justify; }

/* Font weight */
.font-normal    { font-weight: 400; }
.font-medium    { font-weight: 500; }
.font-semibold  { font-weight: 600; }
.font-bold      { font-weight: 700; }
.font-extrabold { font-weight: 800; }

/* Text transform */
.uppercase { text-transform: uppercase; }
.lowercase { text-transform: lowercase; }
.capitalize { text-transform: capitalize; }

/* Text overflow */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-balance {
  text-wrap: balance;
  /* Evenly distributes text across lines, reducing ragged edges */
}

.text-pretty {
  text-wrap: pretty;
  /* Prevents single words from wrapping alone — nicer paragraphs */
}
```

## Tools & Resources

- **Google Fonts** — `https://fonts.google.com/`
- **Fontshare** — `https://www.fontshare.com/` (free commercial fonts)
- **Typekit/Adobe Fonts** — professional font library
- **Typewolf** — `https://www.typewolf.com/` (typography inspiration)
- **Modular Scale** — `https://www.modularscale.com/` (generate type scales)
- **Type Scale** — `https://type-scale.com/` (visualize typography scales)
- **Font Pair** — `https://fontpair.co/` (find font combinations)
