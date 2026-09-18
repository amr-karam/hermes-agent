---
name: color-theory
description: Color theory and palette design skill for web and UI interfaces. Covers color psychology, HSL/HSLA color relationships, WCAG contrast ratios, accessible color generation, brand color selection, gradient design, and practical color implementation in CSS and design tools.
---

# Color Theory for Web Design

## Understanding Color

### Color Models

**RGB (Red Green Blue) — Additive**

Used on screens. Colors are created by mixing light.

```css
/* RGB in CSS */
color: rgb(255, 99, 132);
color: rgb(100% 39% 52%);
color: rgb(255 99 132 / 0.8); /* with alpha */
```

**HSL (Hue Saturation Lightness) — Perceptual**

Intuitive for designers. Hue (0–360°), Saturation (0–100%), Lightness (0–100%).

```css
/* HSL is easier to reason about */
color: hsl(350, 100%, 52%); /* base red */
color: hsl(350, 100%, 72%); /* lighter red — tint */
color: hsl(350, 70%, 42%);  /* darker red — shade */
```

**LAB (Lightness A B) — Perceptually Uniform**

Closest to human vision. Use for scientific color decisions.

### Hue Relationships

```
HUE WHEEL — 360 degrees

Red:      0°    (0° / 360°)
Orange:   30°
Yellow:   60°
Green:    120°
Blue:     240°
Purple:   270°
Magenta:  300°
```

## Color Harmony

### Primary, Secondary, Tertiary

```css
/* Primary triad */
color-primary:   hsl(220, 80%, 50%);  /* Blue base */
color-secondary: hsl(320, 80%, 50%);  /* Magenta */
color-accent:    hsl( 20, 80%, 50%);  /* Orange */

/* Analogous (next to each other) */
color-1: hsl(200, 80%, 50%);
color-2: hsl(220, 80%, 50%);
color-3: hsl(240, 80%, 50%);

/* Complementary (opposite) */
color-base:    hsl(220, 80%, 50%);   /* Blue */
color-complement: hsl(40, 80%, 50%); /* Orange */
```

### Building Harmonies in HSL

**Split-Complementary:** Base color + two colors 150° and 210° from it

```css
color-base:        hsl(200, 80%, 50%);
color-split-1:     hsl(20,  80%, 50%);  /* 200° - 150° = -150° → 20° */
color-split-2:     hsl(320, 80%, 50%);  /* 200° + 150° = 350° → -10° */
```

**Tetradic:** Two complementary pairs

```css
color-1: hsl(200, 80%, 50%);
color-2: hsl(20,  80%, 50%);
color-3: hsl(200, 80%, 60%); /* +10% lightness */
color-4: hsl(20,  80%, 60%);
```

## Accessible Color Systems

### WCAG Contrast Ratios

```
Minimum contrast requirements:
  AA Large Text (≥18pt): 3:1
  AA Normal Text:        4.5:1
  AAA Large Text:        4.5:1
  AAA Normal Text:       7:1

How to compute:
  1. Get relative luminance of both colors:
     L = 0.2126×R + 0.7152×G + 0.0722×B
     (linearize sRGB first)
  2. ratio = (L1 + 0.05) / (L2 + 0.05)
```

### Practical WCAG Check

```css
/* Text colors on white background */
.text-primary:   #1A1A1A; /* 14.5:1 — AAA+ */
.text-secondary: #4B5563; /*  4.0:1 — needs adjustment or larger font */
.text-tertiary:  #6B7280; /*  2.9:1 — too low, use only for disabled */

/* Better accessible set */
.text-primary:   #111827; /* 15.1:1 */
.text-secondary: #4B5563; /* 4.5:1 — exactly AA */
.text-tertiary:  #9CA3AF; /* 2.9:1 — only on dark backgrounds */
```

### Automated Contrast Generation

```css
/*
  Use color-mix() for tint/shade generation
  Available in modern browsers with color-mix support
*/
.color-primary {
  --base: hsl(260, 80%, 55%);
  --tint: color-mix(in srgb, var(--base), white 30%);
  --shade: color-mix(in srgb, var(--base), black 30%);
}
```

## Semantic Color Tokens

Never hardcode values. Always use semantic token names:

```css
:root {
  /* Brand colors */
  --color-brand-50:  #f5f3ff;
  --color-brand-100: #ede9fe;
  --color-brand-300: #c4b5fd;
  --color-brand-500: #6366f1;  /* Primary brand */
  --color-brand-700: #4338ca;
  --color-brand-900: #312e81;

  /* Status colors */
  --color-status-error:   hsl(0, 80%, 50%);
  --color-status-success: hsl(140, 50%, 45%);
  --color-status-warning: hsl(40, 100%, 50%);
  --color-status-info:    hsl(210, 100%, 55%);

  /* State colors (interactive) */
  --color-state-error-background:   hsl(0, 80%, 50% / 0.1);
  --color-state-error-border:       hsl(0, 80%, 50%);
  --color-state-error-text:         hsl(0, 80%, 40%);

  /* Neutral scale */
  --color-neutral-50:  #FAFAFA;
  --color-neutral-100: #F5F5F5;
  --color-neutral-200: #EEEEEE;
  --color-neutral-300: #E0E0E0;
  --color-neutral-400: #BDBDBD;
  --color-neutral-500: #9E9E9E;
  --color-neutral-600: #757575;
  --color-neutral-700: #616161;
  --color-neutral-800: #424242;
  --color-neutral-900: #212121;

  /* Semantic aliases */
  --color-background: var(--color-neutral-50);
  --color-foreground: var(--color-neutral-900);
  --color-border: var(--color-neutral-200);
  --color-input: var(--color-background);
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: var(--color-neutral-900);
    --color-foreground: var(--color-neutral-100);
    --color-border: var(--color-neutral-800);
    --color-input: var(--color-neutral-800);
  }
}
```

## Gradient Design

### Gradient Principles

1. **Limit your palette** — gradients work best with 2–3 colors
2. **Control the angle** — match your layout's visual flow
3. **Soft transitions** — subtle shifts feel premium, harsh shifts feel cheap
4. **Consider accessibility** — ensure text over gradient has sufficient contrast

```css
/* Subtle brand gradient */
.gradient-brand {
  background: linear-gradient(
    135deg,
    hsl(260, 80%, 55%) 0%,
    hsl(240, 80%, 60%) 100%
  );
}

/* Text gradient over solid background */
.text-gradient {
  background: linear-gradient(90deg,
    hsl(260, 80%, 50%),
    hsl(300, 80%, 55%)
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* Radial focus effect */
.gradient-focus {
  background: radial-gradient(
    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    hsl(260, 80%, 60%) 0%,
    hsl(260, 80%, 55%) 50%,
    transparent 70%
  );
}
```

### Gradient Safety

```css
/*
  Always provide a solid fallback before gradient
  for browsers that don't support gradients
*/
.button {
  background-color: hsl(260, 80%, 55%);  /* Fallback */
  background-image: linear-gradient(135deg,
    hsl(260, 80%, 55%),
    hsl(240, 80%, 60%)
  );
}
```

## Color Psychology

### Warm Colors (Reds, Oranges, Yellows)

```
Red:   energy, urgency, danger, passion
  - Use for: errors, sale badges, primary CTA
  - Too much: creates anxiety, feels aggressive

Orange: warmth, enthusiasm, creativity
  - Use for: warnings, secondary CTAs, accents
  - Too much: feels cheap or playful

Yellow: optimism, attention, caution
  - Use for: highlights, warnings, highlights
  - Too much: strains eyes, hard to read
```

### Cool Colors (Blues, Greens, Purples)

```
Blue: trust, stability, professionalism
  - Use for: primary brand, social, security
  - Too much: feels cold, corporate

Green: growth, health, success, money
  - Use for: success states, eco themes, finance
  - Too much: feels generic

Purple: luxury, creativity, spirituality
  - Use for: premium products, beauty, creativity
  - Too much: feels whimsical or dated
```

### Neutral Colors

```
Grayscale: sophistication, modernity, contrast
  - Use for: backgrounds, text, borders
  - Vary lightness significantly (use full 50–900 scale)

Black/White: timeless, high contrast, dramatic
  - Use sparingly for maximum impact
```

## Practical Implementation

### Generating Color Palettes

```javascript
// Generate accessible tint/shade scale
function generateScale(baseHsl, steps = 10) {
  const scale = {}
  const step = 100 / steps

  for (let i = 0; i <= steps; i++) {
    const lightness = step + (i * step)
    scale[`color-${i * 50}`] = `hsl(${baseHsl[0]}, ${baseHsl[1]}%, ${lightness}%)`
  }
  return scale
}

// Check contrast
function contrastRatio(hex1, hex2) {
  const l1 = luminance(hexToRgb(hex1))
  const l2 = luminance(hexToRgb(hex2))
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}
```

### CSS Color Utilities

```css
/* Color utility classes for rapid prototyping */
.bg-brand-500  { background-color: hsl(260, 80%, 55%); }
.bg-brand-600  { background-color: hsl(260, 80%, 50%); }
.text-brand-500 { color: hsl(260, 80%, 55%); }

/* Hover states using HSL manipulation */
.bg-brand-500:hover {
  filter: brightness(0.9);
  /* Keeps hue/saturation, reduces lightness */
}

/* Focus rings with brand color */
*:focus-visible {
  outline: 2px solid hsl(260, 80%, 55%);
  outline-offset: 2px;
}
```

## Brand Color Selection

### Process

1. **Audit the industry** — what colors do competitors use? Find the gap.
2. **Understand the brand** — playful, serious, trustworthy, innovative?
3. **Test in context** — how does it look on products, marketing, UI?
4. **Check cultural associations** — colors mean different things globally
5. **Verify accessibility** — test all brand colors against WCAG

### Color Palette Checklist

```
□ Brand color works in both light and dark modes
□ Brand color has an accessible contrast ratio (≥4.5:1) against white and black
□ Accent color provides sufficient contrast for CTAs
□ Status colors (error/success/warning) are distinguishable from brand
□ At least 2 neutral colors for backgrounds
□ Color palette works for colorblind users (test with simulators)
□ Gradient (if used) degrades to solid color on older browsers
```

## Tools & Resources

- **Coolors** — `https://coolors.co/` (fast palette generation)
- **Adobe Color** — `https://color.adobe.com/` (harmony rules)
- **Colorable** — `https://colorable.joke2k.net/` (contrast checker)
- **WebAIM Contrast** — `https://webaim.org/resources/contrastchecker/`
- **A11y Color Palette** — `https://www.a11y-colour-palette.com/`
- **UI Gradients** — `https://uigradients.com/`
