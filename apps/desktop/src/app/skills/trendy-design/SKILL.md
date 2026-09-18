---
name: trendy-design
description: Trend-aware design skill for identifying, evaluating, and strategically applying current design trends. Covers trend forecasting, trendy CSS effects (glassmorphism, neumorphism, gradients), animation trends, when to use (or avoid) trends, and maintaining brand authenticity in modern design.
---

# Trendy Design

## Trend Intelligence

### Why Trends Matter

Trends aren't the enemy — blind application of trends is. A well-chosen trend can make your design feel modern, relevant, and fresh. A misused trend can make it feel dated by next month and forgettable now.

**Use a trend when:**
- It reinforces your brand personality
- It solves a real UX problem
- It enhances, not replaces, timeless design principles
- Your audience values contemporary aesthetics

**Avoid a trend when:**
- It's purely decorative with no functional purpose
- It conflicts with your brand's established identity
- It creates accessibility or performance issues
- It's peaking (will be dated next season)

### How to Track Trends

```
Sources to monitor:
  - Awwwards (https://www.awwwards.com/) — cutting-edge web design
  - Dribbble (https://dribbble.com/) — daily design inspiration
  - Behance (https://behance.net/) — comprehensive portfolios
  - Page Collective (https://pagecollective.com/) — curated websites
  - Landings (https://landings.digital/) — landing page trends
  - Godly (https://godly.nl/) — exceptional web design
  - Muzli (https://muz.li/) — design newsletter with trend reports
```

## Trend Forecasting

### Trend Lifecycle

```
1. Emerging (0-6 months): Experimentation in side projects, Dribbble shots
2. Rising (6-12 months): Adopted by ambitious brands, featured in showcases
3. Mainstream (12-18 months): Used by major brands, templated by agencies
4. Saturated (18-24 months): Everywhere, overused, generic
5. Declining (24+ months): Falling out of portfolios, feeling dated
6. Retro (few years later): Nostalgic revival in specific contexts

Strategy: Adopt during Rising phase, retire during Saturated
```

### Current Trend Tracking

```css
/* How to evaluate a CSS effect quickly */
.trend-test {
  /* Test on mobile — does it work at 320px? */
  /* Test in dark mode — does it still work? */
  /* Test with reduced motion — is it still useful? */
  /* Test with 200% zoom — does it break? */
  /* Test in low contrast mode — is it still perceivable? */
}
```

## Trending CSS Effects

### Glassmorphism

```css
.glass {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.glass-dark {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
}

/* Accessibility considerations */
@media (prefers-reduced-motion: reduce) {
  .glass {
    backdrop-filter: none;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
}
```

### Neumorphism

```css
.neumorphic {
  background: #F0F0F0;
  border-radius: 12px;
  box-shadow:
    8px 8px 16px #d9d9d9,
    -8px -8px 16px #ffffff;
}

.neumorphic-pressed {
  box-shadow:
    inset 4px 4px 8px #d9d9d9,
    inset -4px -4px 8px #ffffff;
}

/* Dark mode neumorphism */
@media (prefers-color-scheme: dark) {
  .neumorphic {
    background: #1A1A1A;
    box-shadow:
      8px 8px 16px #131313,
      -8px -8px 16px #212121;
  }
}

/* ⚠️ Accessibility note: neumorphism often has poor contrast.
   Use with caution, or add a visible border for focus states. */
.neumorphic:focus-within {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
```

### Viscous UI

```css
/* Blob morphing backgrounds */
.blob {
  position: absolute;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle,
    hsla(260, 80%, 60%, 0.3) 0%,
    hsla(260, 80%, 60%, 0) 70%
  );
  filter: blur(80px);
  animation: blobMove 20s ease-in-out infinite;
}

@keyframes blobMove {
  0% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(50px, -30px) scale(1.05); }
  50% { transform: translate(100px, 0) scale(0.95); }
  75% { transform: translate(50px, 50px) scale(1.05); }
  100% { transform: translate(0, 0) scale(1); }
}
```

### Gradient Trends

```css
/* Duotone gradients */
.duotone {
  background: linear-gradient(135deg,
    hsl(260, 80%, 40%) 0%,
    hsl(200, 80%, 50%) 100%
  );
  background-blend-mode: multiply;
  color: #fff;
}

/* Animated gradient */
.animated-gradient {
  background: conic-gradient(
    from 0deg,
    hsl(260, 80%, 50%),
    hsl(200, 80%, 50%),
    hsl(300, 80%, 50%),
    hsl(260, 80%, 50%)
  );
  background-size: 400% 400%;
  animation: gradientShift 8s ease-in-out infinite;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

### 3D & Extruded Effects

```css
.three-d {
  transform: perspective(1000px) rotateX(10deg);
  transform-style: preserve-3d;
}

.three-d-face {
  transform: translateZ(20px);
  transform-style: preserve-3d;
}

/* Text extrusion */
.extruded-text {
  background: linear-gradient(
    to bottom,
    hsl(260, 80%, 50%) 0%,
    hsl(260, 80%, 45%) 5%,
    hsl(260, 80%, 40%) 100%
  );
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  filter: drop-shadow(0 4px 4px rgba(0, 0, 0, 0.2));
}
```

## Trending Animations

### Scroll-Linked Animations

```css
/* CSS Scroll-Linked Animations (2024) */
@scroll-timeline myScrollTimeline {
  source: auto;
  orientation: block;
  range: 0% 100%;
}

.scroll-reveal {
  animation: reveal var(--duration, 1s) linear;
  animation-timeline: myScrollTimeline;
}

@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Fallback for browsers without scroll timeline */
@supports not (animation-timeline: auto) {
  .scroll-reveal {
    opacity: 1;
    transform: none;
  }
}
```

### Text Animations

```css
/* Typewriter effect */
.typewriter {
  overflow: hidden;
  border-right: 3px solid var(--color-brand);
  white-space: nowrap;
  width: 0;
  animation: type 3.5s steps(40, end) forwards;
}

@keyframes type {
  0% { width: 0; }
  100% { width: 100%; }
}

/* Word-by-word reveal */
.word-reveal {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.25em;
}

.word {
  opacity: 0;
  animation: wordIn 0.5s ease-out forwards;
}

.word:nth-child(1) { animation-delay: 0ms; }
.word:nth-child(2) { animation-delay: 50ms; }
.word:nth-child(3) { animation-delay: 100ms; }

@keyframes wordIn {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}
```

### Interactive Cursor Effects

```css
/* Custom cursor following */
.custom-cursor {
  position: fixed;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-brand-500);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
  z-index: 9999;
  mix-blend-mode: difference;
}

.custom-cursor.active {
  opacity: 1;
}

/* Magnet effect on hover */
.magnet:hover .magnet-content {
  transform: scale(1.05);
  transition: transform 0.3s ease;
}

/* Tear effect (advanced) */
.tear {
  position: relative;
  display: inline-block;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}

.tear:hover {
  clip-path: polygon(
    0 0, 100% 0, 100% 85%, 85% 100%, 0 100%
  );
  transition: clip-path 0.4s ease;
}
```

## Trend Evaluation Framework

### Is This Trend Right For You?

```
Checklist:
  [ ] Does it align with the brand's personality?
  [ ] Does it solve a UX problem, or is it purely decorative?
  [ ] Will users with disabilities be able to use it?
  [ ] Does it degrade gracefully on older browsers?
  [ ] Is the performance cost acceptable?
  [ ] Will this feel dated in 12–18 months?
  [ ] Do our users value contemporary aesthetics?
```

### Trend Longevity Matrix

```
High Longevity (Timeless when executed well):
  - Typography-driven layouts
  - Generous whitespace
  - Strong color contrasts
  - Clear hierarchy

Medium Longevity (Seasonal, 1–2 years):
  - Animated gradients
  - Glassmorphism
  - Neomorphism (with modifications)
  - Asymmetric layouts
  - Bold typography

Low Longevity (Dated quickly, 6–12 months):
  - Brutal/destroyed text effects
  - Heavy 3D transforms
  - Blob backgrounds (overused)
  - Skeleton screens with spinners
  - Full-page carousels
```

## Trend Application Strategy

### Layer Trends Selectively

```css
/* Pick 1-2 trending elements, pair with timeless foundation */
.trendy-section {
  /* Timeless: generous whitespace, clear typography */
  padding: 4rem 2rem;
  max-width: 65ch;
  margin: 0 auto;

  /* Trendy: subtle animated gradient border */
  border: 1px solid;
  border-image: linear-gradient(
    45deg,
    hsla(260, 80%, 60%, 0.3),
    hsla(200, 80%, 60%, 0.3)
  ) 1;
}

.trend-overlay {
  position: relative;
  z-index: 1;
}

.trend-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(99, 102, 241, 0.1) 0%,
    transparent 60%
  );
  filter: blur(40px);
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.trend-overlay:hover::before {
  opacity: 1;
}
```

### Trend Retirement Plan

```css
/* Version your design system to track trend adoption */

/* v1.0 — Glassmorphism era */
.glass-panel-v1 {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
}

/* v2.0 — Flat redesign */
.glass-panel-v2 {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--color-shadow-sm);
}

/* Gradual migration, not hard cut */
.glass-panel {
  /* Default to latest */
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}
```

## Performance Considerations

### Cost of Trendy Effects

```
Low performance impact (<1ms per frame):
  ✅ Subtle hover transforms
  ✅ Linear transitions
  ✅ Static gradients
  ✅ CSS-only animations

Medium impact (1-3ms per frame):
  ⚠️ Backdrop-filter (hardware accelerated but still costly)
  ⚠️ Filter effects (blurs, shadows)
  ⚠️ CSS clips and masks

High impact (3ms+ per frame):
  ❌ Complex clip-path animations
  ❌ SVG animations on large paths
  ❌ Multiple layered gradients with animation
  ❌ Forced compositing layers (too many will-layers)
```

### Performance Budget

```css
/* Monitor: aim for 60fps (16.6ms per frame) */
/* Animation budget: 8ms for style, 8ms for composite */

.trendy-animation {
  /* Use only composite properties */
  will-change: transform, opacity;
  transform: translateZ(0);  /* Force GPU layer */

  /* Avoid animating: width, height, margin, padding, left, top */
  /* These trigger layout recalculations */
}
```

## Trending Color Palettes 2024–2025

### Current Palette Directions

```css
/* Digital Lavender (Pantone 2024) + Modern Neutrals */
:root {
  --color-2024-primary: hsl(260, 80%, 55%);    /* Violet */
  --color-2024-secondary: hsl(220, 60%, 45%);  /* Deep blue */
  --color-2024-accent: hsl(30, 90%, 60%);      /* Warm orange */
  --color-2024-neutral-dark: hsl(220, 10%, 15%);
  --color-2024-neutral-light: hsl(0, 0%, 98%);
}

/* Earth Tones + High Contrast */
:root {
  --color-earth-primary: hsl(30, 40%, 45%);    /* Warm brown */
  --color-earth-secondary: hsl(180, 30%, 40%); /* Sage green */
  --color-earth-accent: hsl(0, 80%, 50%);      /* Terracotta red */
  --color-earth-neutral: hsl(45, 20%, 92%);   /* Cream */
  --color-earth-text: hsl(210, 10%, 20%);      /* Charcoal */
}

/* Retro-Futurism: Neon on Dark */
:root {
  --color-retro-bg: hsl(220, 10%, 8%);       /* Near black */
  --color-retro-neon-1: hsl(180, 100%, 60%); /* Cyan */
  --color-retro-neon-2: hsl(300, 100%, 70%); /* Magenta */
  --color-retro-neon-3: hsl(50, 100%, 60%);   /* Yellow */
  --color-retro-accent: hsl(0, 0%, 100%);     /* White */
}
```

## Trending Typography

### Current Font Trends

```
Display/Trending (use sparingly for headings):
  - Space Grotesk — geometric, slightly condensed
  - Bebas Neue — condensed display workhorse
  - Poppins — friendly geometric sans
  - DM Sans — slightly rounded, approachable
  - Inter — still the best all-purpose body font

Avoid (overused by AI tools):
  - Inter as body font in everything
  - Space Grotesk + Inter pairing (extremely common)
  - Roboto (dated)
  - Open Sans (dated)
```

## Resources & Trend Tracking

- **Awwwards Trends** — `https://www.awwwards.com/web-design/trends`
- **Dribbble Trending** — `https://dribbble.com/tags/design_system`
- **Page Collective** — `https://pagecollective.com/`
- **Landings** — `https://landings.digital/`
- **Muzli** — `https://muz.li/` (daily design inspiration)
- **The Dots** — `https://the Dots.com/trending`
- **Designspiration** — `https://www.designspiration.com/`
- **CSS Awards** — `https://www.cssdesignawards.com/`
- **Mindsparkle Mag** — `https://mindsparklemag.com/`

## Trendy Websites for Inspiration (September 2026)

### Awwwards Sites of the Day (Current Winners)

These are fresh, award-winning sites showcasing today's hottest trends:

```
1.  Aspen Search (sep 17)
    URL: https://www.awwwards.com/sites/aspen-search
    Trends: Minimal dark theme, micro-interactions, smooth scrolling
    Why trendy: Clean negative space with subtle animation on scroll

2.  USAvionix (sep 16)
    URL: https://www.awwwards.com/sites/usavionix
    Trends: 3D product visualization, immersive hero, dark mode
    Why trendy: Real-time 3D product showcase with parallax

3.  STANZZA design (sep 15)
    URL: https://www.awwwards.com/sites/stanzza-design
    Trends: Brutalist typography, glitch effects, experimental layout
    Why trendy: Raw, unpolished aesthetic with intentional imperfection

4.  Léo Parpeix - Portfolio 2026 (sep 14)
    URL: https://www.awwwards.com/sites/leo-parpeix-portfolio-2026
    Trends: Horizontal scrolling galleries, sticky navigation
    Why trendy: Portfolio showcasing work through progressive reveal

5.  The Tuscan Journey Begins (sep 13)
    URL: https://www.awwwards.com/sites/the-tuscan-journey-begins
    Trends: Storytelling narrative, full-bleed imagery, cinematic pacing
    Why trendy: Immersive storytelling through scroll-driven narrative

6.  Warm & Fuzzy (sep 12)
    URL: https://www.awwwards.com/sites/warm-fuzzy
    Trends: Organic shapes, soft gradients, hand-drawn elements
    Why trendy: "Cozy web" aesthetic with tactile texture

7.  White Desert (sep 11)
    URL: https://www.awwwards.com/sites/white-desert
    Trends: Minimalist luxury, monochromatic palette, clean typography
    Why trendy: "Less is more" — whitespace as a design element

8.  Cerebrium (sep 10)
    URL: https://www.awwwards.com/sites/cerebrium
    Trends: AI-themed visuals, data visualization, dark mode
    Why trendy: Tech-forward design showcasing AI/ML product

9.  Seasats (sep 9)
    URL: https://www.awwwards.com/sites/seasats
    Trends: Product-focused, clean e-commerce, interactive demos
    Why trendy: Direct product showcase without e-commerce clutter

10. Why Zero (sep 8)
    URL: https://www.awwwards.com/sites/why-zero
    Trends: Zero-waste aesthetic, earth tones, handcrafted feel
    Why trendy: Sustainability-focused brand design with authentic texture

11. United Carriers (sep 7)
    URL: https://www.awwwards.com/sites/united-carriers
    Trends: B2B SaaS design, clean dashboard UI, professional tone
    Why trendy: Mature SaaS aesthetic without startup clichés

12. Gionatan Nese '26 (sep 6)
    URL: https://www.awwwards.com/sites/gionatan-nese-26
    Trends: Personal portfolio, creative coding, unconventional layout
    Why trendy: Artist portfolio breaking traditional grid layouts

13. Illoca (sep 5)
    URL: https://www.awwwards.com/sites/illoca
    Trends: E-commerce reimagined, editorial layout, storytelling
    Why trendy: Fashion e-commerce designed as editorial experience

14. Trevor Noah (sep 4)
    URL: https://www.awwwards.com/sites/trevor-noah
    Trends: Entertainment brand, video integration, conversational UI
    Why trendy: Comedian brand site designed like interactive comedy

15. Paul Kalkbrenner (sep 3)
    URL: https://www.awwwards.com/sites/paul-kalkbrenner
    Trends: Music brand, audio visualization, dark mode, cinematic
    Why trendy: Musician site treating audio as visual medium

16. Squarespace Foundations (sep 2)
    URL: https://www.awwwards.com/sites/squarespace-foundations
    Trends: Design system showcase, documentation-style layout
    Why trendy: Product documentation designed with editorial care

17. ERA Residence (sep 1)
    URL: https://www.awwwards.com/sites/era-residence
    Trends: Real estate brand, architectural photography, luxury minimalism
    Why trendy: Property showcase through architectural photography focus
```

### Trendy Sites Beyond Awwwards

```
Design Systems & Component Libraries:
  - **shadcn/ui** — https://ui.shadcn.com/
    Trends: Copy-paste components, Radix UI primitives, clean code

  - **Acme UI** — https://acme.page/
    Trends: React component library showcase, modern React patterns

  - **Tailwind UI** — https://tailwindui.com/
    Trends: Utility-first CSS, dark mode, responsive utilities

Portfolios & Creative:
  - **Bruno Simon** — https://bruno-simon.com/
    Trends: 3D portfolio, Three.js, WebGL, interactive experimentation

  - **React Promise Line** — https://react-promise.com/
    Trends: Developer portfolio with code-as-canvas aesthetic

  - **Timothy Van Damt** — https://www.timothyvd.be/
    Trends: Experimental layouts, creative cursor interactions

E-commerce & Commerce:
  - **Pitch** — https://pitch.com/
    Trends: Presentation tool, clean onboarding, brand consistency

  - **Linear** — https://linear.app/
    Trends: Product-focused, minimal UI, keyboard navigation

  - **Framer** — https://www.framer.com/
    Trends: No-code design tool, interactive prototypes, animations

Agency & Studio:
  - **Merci Michel** — https://www.merci-michel.com/
    Trends: Studio showcase, experimental layouts, interactive storytelling

  - **Resn** — https://www.resn.com/
    Trends: Agency portfolio, bold typography, interactive experiences

  - **Active Theory** — https://www.activetheory.com/
    Trends: Digital agency, WebGL, creative technology showcase

  - **Hancock** — https://hancock.computer/
    Trends: Creative agency, playful interactions, unconventional UX
```

### How to Study These Sites

```
When analyzing trendy websites:

1. Inspect the CSS — check for modern properties (backdrop-filter,
   container queries, @scroll-timeline, color-mix())

2. Observe the motion — note easing curves, duration, stagger,
   and whether animations respect prefers-reduced-motion

3. Check the layout — is it Grid or Flexbox? How do they handle
   responsive breakpoints? What's the container width strategy?

4. Note the typography — font pairings, scale, line height,
   responsive type (clamp() vs. media queries)

5. Examine interactions — hover states, focus management,
   loading patterns, error handling

6. Test accessibility — can you navigate with keyboard only?
   Does it have skip links? Are ARIA attributes used correctly?

7. Study the performance — check Lighthouse scores, note
    hero image optimization, font loading strategy

### Animation-Focused Sites

Don't miss the sister skill **web-animation** for detailed motion technique
analysis. Here are sites pushing the envelope in web animation right now:

```
Bruno Simon Portfolio — https://bruno-simon.com/
  Trends: Three.js 3D, WebGL physics, real-time interaction
  Why trendy: Browser-based 3D gaming engine in a portfolio

Lusion v3 — https://lusion.co.jp/
  Trends: SVG blob morphing, scroll-driven 3D, custom cursor
  Why trendy: Seamless animation flow, organic motion language

Noomo Agency — https://noomoagencies.com/
  Trends: 3D transforms, parallax depth, magnetic interactions
  Why trendy: Sophisticated scroll-linked 3D without performance lag

Active Theory — https://active-theory.com/
  Trends: Custom WebGL shaders, real-time particle systems
  Why trendy: Pushing WebGL to its creative limits in production

Merci Michel — https://merci-michel.com/
  Trends: SVG masking, path animations, scroll-triggered reveals
  Why trendy: Clean, purposeful animations that enhance storytelling

Dogstudio — https://dogstudio.co/
  Trends: Typographic animation, text reveal effects, playful motion
  Why trendy: Typography-driven animation with impeccable timing

Hello Monday — https://hellomonday.com/
  Trends: Page transitions, micro-interactions, React animations
  Why trendy: Production-quality motion design in React/Framer Motion

The First The Last — https://thefirstthelast.studio/
  Trends: Minimalist transitions, subtle micro-interactions
  Why trendy: Every animation serves a clear UX purpose
```
