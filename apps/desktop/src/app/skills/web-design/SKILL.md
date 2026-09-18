---
name: web-design
description: Strategic web design skill covering design systems, visual identity, UX patterns, accessibility, and creative direction for web interfaces. Use when designing websites, landing pages, dashboards, component libraries, or when the user asks for design system architecture, brand integration, layout composition, color theory, typography pairing, motion design, or accessibility compliance for web.
---

# Web Design

## Design Philosophy

Web design is where form meets function. Every decision — color, typography, spacing, motion —
must serve both the user's goal and the brand's character. This skill covers the strategic
process: from defining a design system to implementing production-ready, accessible interfaces.

### Core Principles

1. **Start with intent, not decoration.** Every visual element must serve a purpose: guide
   attention, communicate hierarchy, or reinforce brand. Ornamentation without function is
   noise.

2. **Commit to a single aesthetic direction.** Don't hedge — choose brutally minimal *or*
   maximalist, dark *or* light, geometric *or* organic. Half-committed designs feel generic.

3. **Design the system before the screen.** Build a reusable design language (tokens,
   components, patterns) so every page inherits consistency.

4. **Accessibility is non-negotiable.** WCAG 2.1 AA compliance is the floor, not the ceiling.
   Design for keyboard, screen reader, and high-contrast from day one.

5. **Design for real content.** Use actual text, real data, and representative images. "Lipsum
   ipsum" hides spacing problems and truncates in production.

## Design System

### Tokens

Tokens are the atomic level — named, documented values that feed every component.

**Color tokens** follow a functional naming scheme: `color-background-primary`,
`color-text-primary`, `color-border-input`, etc. Never name a token after its value
(`color-blue-500`); the value will change in dark mode, in a theme, or over time.

```
color-background-primary: #FFFFFF → #121212
color-background-secondary: #F5F5F5 → #1E1E1E
color-text-primary: #1A1A1A → #E5E5E5
color-text-secondary: #6B7280 → #9CA3AF
color-accent-primary: #6366F1 (brand)
color-accent-primary-hover: #4F46E5
color-border: #E5E5E5 → #333333
color-border-input: #D1D5DB → #404040
color-surface-elevated: #FFFFFF → #1A1A1A (cards, modals)
color-surface-overlay: rgba(0,0,0,0.05) → rgba(255,255,255,0.05)
color-state-error: #EF4444
color-state-success: #22C55E
color-state-warning: #F59E0B
color-state-info: #3B82F6
color-shadow: rgba(0,0,0,0.05) → rgba(0,0,0,0.3)
```

**Typography tokens** pair a distinctive display font with a refined body font.

```
font-family-display: "Satoshi", "Space Grotesk", or "GT America Mono" — pick ONE
font-family-body: "Inter", "San Francisco", or system sans — keep readable
font-size-display-3xl: clamp(2rem, 5vw, 3.5rem)
font-size-display-2xl: clamp(1.5rem, 4vw, 2.5rem)
font-size-heading-1: 2rem / 1.2
font-size-heading-2: 1.5rem / 1.25
font-size-heading-3: 1.25rem / 1.3
font-size-body: 1rem / 1.6
font-size-small: 0.875rem / 1.5
font-weight-bold: 700
font-weight-semibold: 600
font-weight-medium: 500
font-weight-regular: 400
```

**Spacing tokens** use a consistent scale (e.g., 4px base):

```
spacing-sxxs: 0.25rem  (4px)
spacing-sxs: 0.5rem   (8px)
spacing-sm:  0.75rem  (12px)
spacing-md:  1rem     (16px)
spacing-lg:  1.25rem   (20px)
spacing-xl:  1.5rem   (24px)
spacing-xxl: 2rem     (32px)
spacing-xxxl: 3rem     (48px)
spacing-xxxxl: 4rem    (64px)
```

### Components

Components are composed from tokens. Document the states: default, hover, focus, active,
disabled, loading, error. Every interactive element must have a visible focus ring.

```
Button: primary, secondary, outline, ghost, danger, sizes: sm/md/lg
Input: with label, placeholder, error state, helper text, icon
Card: with header, body, footer, elevation, interactive variant
Badge: solid, outline, soft, with icon
Avatar: with fallback, online/offline status indicator
Dropdown: with search, multi-select, async loading
Table: sortable, filterable, pagination, loading skeleton
```

## Visual Identity

### Logo & Brand

A logo is not just a graphic — it's the face of the brand. Design it in context:

1. **Define clear space** — how much breathing room around the logo.
2. **Define minimum size** — at what point it becomes illegible.
3. **Define variants** — full color, single color, reversed (on dark), icon-only.
4. **Define misuse** — what breaks it (stretch, color change, drop shadow, rotation).

### Color Theory

Use HSL to reason about color relationships:

```
# Complementary: hue ± 180°
primary:   hsl(250, 80%, 55%)
accent:    hsl(70,  80%, 55%)

# Triadic: hue ± 120°
primary:   hsl(200, 80%, 50%)
secondary: hsl(320, 80%, 50%)
tertiary:  hsl( 80, 80%, 50%)

# Tetradic (double complementary): hue ± 90°
primary:   hsl(200, 80%, 50%)
secondary: hsl(290, 80%, 50%)
tertiary:  hsl( 20, 80%, 50%)
quaternary: hsl(110, 80%, 50%)
```

Always check contrast ratios: WCAG AA requires 4.5:1 for normal text, 3:1 for large text.
Use tools like `colorable.joke2k.net` or compute manually:

```
# Luminance formula:
L = 0.2126×R + 0.7152×G + 0.0722×B
# (sRGB values linearized first)
ratio = (L_lighter + 0.05) / (L_dark + 0.05)
```

### Typography System

Font pairing is about contrast and harmony:

```
Display + Body = contrast
Geometric sans + humanist sans
Serif + sans-serif
Monospace + sans-serif (for tech brands)

Line length: 50–75 characters for body copy (reading comfort)
Line height: 1.5–1.6× for body, 1.2–1.3× for headings
Letter spacing: -0.02em for display, 0.01em for body
```

## Layout & Composition

### Grid Systems

**12-column grid** for desktop layouts — the industry standard for a reason:
- 6 columns on tablet (≥768px)
- 4 columns on mobile (≥640px)
- Gutters: 24px desktop, 16px tablet, 16px mobile
- Margins: 48px desktop, 24px tablet, 16px mobile

**CSS Grid for macro layout:**

```css
.container {
  display: grid;
  grid-template-columns: repeat(12, [col-start] 1fr);
  gap: 24px;
  max-width: 1200px;
  margin-inline: auto;
}

.grid-span-6 { grid-column: span 6; }
.grid-span-4 { grid-column: span 4; }
.grid-span-12 { grid-column: 12; }
```

### Spatial Hierarchy

Use the **8-point system** for consistent spacing:

```
Elements are spaced at multiples of 8px: 8, 16, 24, 32, 48, 64, 96.
This creates visual rhythm and alignment.
```

### Asymmetry & Balance

Don't center everything. Use asymmetrical layouts:

```
Left column: 2/3 width (main content)
Right column: 1/3 width (sidebar, ads, related)

Or: off-center focal point with generous whitespace on one side
```

## UX Patterns & Best Practices

### F-Shaped Reading Pattern

Users read web content in an F pattern. Design for it:
- Place key information in the top-left
- Use short paragraphs and bullet points
- Bold the first few words of each paragraph

### Form Design

Every field must justify its existence:

```
✅ Label above the field (or inline labels with float-on-focus)
✅ Helper text for optional clarification
✅ Error messages that explain HOW to fix (not just what's wrong)
✅ Group related fields (fieldsets with legends)
✅ Auto-focus the first field
✅ Keyboard navigation: Tab → Enter = Submit
```

### Navigation Patterns

- **Primary nav**: top bar or left sidebar (persistent, 5–7 items max)
- **Secondary nav**: breadcrumbs, tabs, or table of contents
- **Tertiary nav**: footer links, pagination, "see all" links

### Dark Mode

Don't just invert colors. Design for dark mode from the start:

```
Light mode: high luminance, more contrast, saturated colors
Dark mode: lower luminance, less contrast, desaturated colors

Text contrast: same ratio, different absolute luminance
Surfaces: use different elevations (shadows) for depth
Borders: 1px solid at 20% opacity (not solid color)
```

### Loading States

Never show a blank screen. Always design for:

1. **Skeleton screens** — content-shaped placeholders (not spinners)
2. **Progress indicators** — for known-duration tasks (file upload, video buffering)
3. **Optimistic updates** — assume success, revert on failure

## Accessibility (WCAG 2.1 AA)

### Semantic HTML

```html
<!-- ✅ Good: semantic, accessible -->
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
</header>
<main>
  <article>
    <h1>Main Article Title</h1>
    <p>...</p>
  </article>
</main>

<!-- ❌ Bad: no semantics -->
<div class="header">
  <div class="nav">
    <span onclick="navigate()">Home</span>
  </div>
</div>
<div class="content">
  <div class="title">Main Article Title</div>
  <div>Some text...</div>
</div>
```

### Focus Management

- All interactive elements must be focusable
- Focus indicator must have 3:1 contrast against adjacent colors
- Focus must be visible BEFORE user interacts (not just on keyboard event)
- Trap focus in modals; return focus to trigger on close

```css
/* Visible focus ring */
:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}
```

### ARIA Best Practices

```html
<!-- Landmarks for screen readers -->
<main id="main-content">
<article aria-labelledby="article-title">
  <h1 id="article-title">...</h1>

<!-- Live regions for dynamic updates -->
<div aria-live="polite" aria-atomic="true">
  Status: {{ loading ? 'Loading...' : 'Ready' }}

<!-- Descriptive link text -->
<a href="/pricing">
  View our <span aria-hidden="true">comprehensive</span> pricing plans
</a>
```

### Color & Contrast

- Text and interactive elements: minimum 4.5:1 contrast ratio (3:1 for large text ≥18pt)
- Don't rely on color alone to convey information (add text labels, icons, or patterns)
- Test with color blindness simulators (8% of men have some form of color vision deficiency)

## Motion & Interaction

### Design Principles

```
1. Respect user preferences: prefers-reduced-motion
2. Meaningful motion: every animation has a clear purpose
3. Fast and smooth: 100–300ms for state changes, 300–500ms for transitions
4. Natural easing: use cubic-bezier(0.25, 0.1, 0.25, 1) for enter, ease-out for exit
```

### CSS Motion Guidelines

```css
/* Fast state changes */
.button {
  transition: background-color 150ms ease-out, color 150ms ease-out;
}

/* Page transitions */
.page-enter {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 300ms ease-out, transform 300ms ease-out;
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Micro-interactions

```
Hover:  subtle scale or shadow change (1–2%)
Press:  inset shadow, slight scale down
Focus:  outline ring (3:1 contrast)
Loading:  pulse or spin, content-shaped skeleton
Success:  green flash + checkmark
Error:    red flash + X + shake (5–3 times)
```

## Responsive Design

### Breakpoint Strategy

Use **content-based breakpoints**, not device-based:

```css
/* Start from mobile, expand up */
@media (min-width: 48rem) {  /* ~768px — tablets */ }
@media (min-width: 62rem) {  /* ~992px — laptops */ }
@media (min-width: 75rem) {  /* ~1200px — desktops */ }
@media (min-width: 90rem) {  /* ~1440px — large screens */ }
```

### Flexible Images & Media

```css
img, video, svg {
  max-width: 100%;
  height: auto;
}

/* Aspect ratio boxes */
.aspect-16-9 { aspect-ratio: 16 / 9; }
.aspect-4-3  { aspect-ratio:  4 / 3; }
```

### Touch Targets

Minimum 44×44 pixels for touch targets (Apple HIG standard):

```css
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}
```

## Design Process

### 1. Discovery

```
- Who are the users? (personas)
- What are their goals? (jobs to be done)
- What's the context of use? (device, environment, constraints)
- What's the competitive landscape?
- What's the brand's unique value proposition?
```

### 2. Information Architecture

```
- Card sorting (users organize content into groups)
- Site maps (hierarchical structure)
- User flows (path from entry to goal)
- Content audits (what exists, what's missing, what's outdated)
```

### 3. Wireframing

Low-fidelity sketches that focus on structure, not pixels:

```
Tools: Figma (free), Balsamiq, pen & paper
Focus: layout, hierarchy, flow
NOT: colors, fonts, images
Speed: 5–15 minutes per screen
```

### 4. Visual Design

High-fidelity mockups with real design system:

```
Tools: Figma (components + auto-layout + variants)
Deliverables: design system, component specs, screen mockups
```

### 5. Prototyping

Interactive versions to test flow and behavior:

```
- Clickable prototypes (Figma → Figma Mirror)
- Code prototypes (HTML/CSS/JS for critical interactions)
- A/B testing (different designs, measure engagement)
```

### 6. Validation

```
- Usability testing (5–8 users, observe tasks, not opinions)
- Accessibility audit (axe-core, Lighthouse, manual keyboard nav)
- Performance audit (Lighthouse, Web Vitals)
- Design QA (pixel-perfect vs. design file)
```

## Design QA Checklist

Before handing off to development:

```
□ Typography tokens are defined (size, weight, line-height, letter-spacing)
□ Color tokens cover all states (default, hover, focus, active, disabled)
□ Spacing tokens are consistent (8-point grid)
□ All interactive elements have visible focus states
□ Color contrast meets WCAG AA (4.5:1 for text)
□ All images have alt text (decorative: empty, informative: described)
□ Form fields have labels (no floating labels without proper implementation)
□ Layout is responsive (test at mobile, tablet, desktop breakpoints)
□ Motion respects prefers-reduced-motion
□ Content is real (no lorem ipsum)
□ Error states are designed (form errors, loading, empty states)
□ Design system is documented (Figma or zeroheight)
```

## Tools & Resources

### Primary Tools

- **Figma** — design tool with components, auto-layout, variants, and design systems
- **Lighthouse** — automated auditing (accessibility, performance, SEO, best practices)
- **axe-core** — accessibility testing engine
- **Storybook** — component library development and testing

### Reference Resources

- **WCAG 2.1 Quick Reference** — `https://www.w3.org/WAI/WCAG21/quickref/`
- **Colorable** — `https://colorable.joke2k.net/` (contrast checker)
- **WebAIM Contrast Checker** — `https://webaim.org/resources/contrastchecker/`
- **Material Design** — `https://m3.material.io/`
- **Apple Human Interface Guidelines** — `https://developer.apple.com/design/human-interface-guidelines`
- **A11Y Project** — `https://www.a11yproject.com/checklist/`
