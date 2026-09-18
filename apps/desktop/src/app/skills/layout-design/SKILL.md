---
name: layout-design
description: Web layout design skill covering CSS Grid, Flexbox, responsive layout patterns, spatial composition, asymmetrical design, container queries, and modern CSS layout techniques for web interfaces.
---

# Layout Design for Web

## Spatial Reasoning

### The Z-Axis (Depth)

```css
/* Layer elements in z-space */
.layer-back   { z-index: 0; }
.layer-base   { z-index: 1; }
.layer-elevated { z-index: 10; }
.layer-overlay { z-index: 20; }
.layer-modal  { z-index: 30; }
.layer-toast  { z-index: 40; }
```

### The 8-Point Grid

Align elements to an 8px baseline grid:

```css
:root {
  --space-0:  0;
  --space-1:  0.125rem;  /* 2px */
  --space-2:  0.25rem;   /* 4px */
  --space-3:  0.5rem;    /* 8px */
  --space-4:  0.75rem;   /* 12px */
  --space-5:  1rem;      /* 16px */
  --space-6:  1.5rem;    /* 24px */
  --space-7:  2rem;      /* 32px */
  --space-8:  3rem;      /* 48px */
  --space-9:  4rem;      /* 64px */
}

/* Use these consistently for margins, padding, gaps */
.card {
  padding: var(--space-5);
  margin-bottom: var(--space-6);
  gap: var(--space-4);
}
```

## CSS Grid Layout

### Basic Grid Container

```css
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
  max-width: 1200px;
  margin-inline: auto;
}

/* Spanning columns */
.col-span-1  { grid-column: span 1; }
.col-span-2  { grid-column: span 2; }
.col-span-3  { grid-column: span 3; }
.col-span-4  { grid-column: span 4; }
.col-span-6  { grid-column: span 6; }
.col-span-12 { grid-column: span 12; }
```

### Responsive Grid Patterns

```css
/* Mobile-first 12-column grid */
.responsive-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 48rem) {  /* 768px — tablet */
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .col-md-6 { grid-column: span 6; }
}

@media (min-width: 62rem) {  /* 992px — desktop */
  .responsive-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  .col-lg-3 { grid-column: span 3; }
  .col-lg-6 { grid-column: span 6; }
  .col-lg-12 { grid-column: 1 / -1; }
}
```

### Holy Grail Layout

```css
.holy-grail {
  display: grid;
  grid-template-areas:
    "header header header"
    "nav    main   aside"
    "footer footer footer";
  grid-template-columns: 1fr 3fr 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

@media (max-width: 48rem) {
  .holy-grail {
    grid-template-areas:
      "header"
      "nav"
      "main"
      "aside"
      "footer";
    grid-template-columns: 1fr;
  }
}
```

### Grid with Subgrid

```css
/* Modern grid nesting (currently supported in Firefox/Safari) */
.parent-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.nested-item {
  display: grid;
  grid-template-columns: subgrid;
  /* Inherits parent's column tracks */
  gap: 1rem;
}
```

## Flexbox Layout

### Flex Container Patterns

```css
/* Horizontal list with space-between */
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Vertical stack */
.flex-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Responsive flex */
.responsive-flex {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 48rem) {
  .responsive-flex {
    flex-direction: row;
    flex-wrap: wrap;
  }
  .flex-item {
    flex: 1 1 0;  /* Grow, shrink, basis */
  }
}
```

### Flex Item Control

```css
/* Equal height cards */
.card-container {
  display: flex;
  gap: 1.5rem;
}

.card {
  flex: 1;              /* Equal width */
  display: flex;
  flex-direction: column;
}

.card-body {
  flex: 1;              /* Fill remaining height */
}
```

## Container Queries

### Component-Level Responsiveness

```css
/* Define container for children */
.card-grid {
  container-type: inline-size;
  display: grid;
  gap: 1.5rem;
}

/* Elements respond to container, not viewport */
@container (min-width: 320px) {
  .card {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
}

@container (min-width: 480px) {
  .card {
    display: flex;
  }
}

/* Size-based containers */
.sidebar {
  container-type: size;  /* Responds to both width and height */
}

@container (min-height: 400px) {
  .sidebar-content {
    position: sticky;
    top: 1rem;
  }
}
```

### Container Query Units

```css
/* cqw = container width unit, cqh = container height unit */
.title {
  font-size: clamp(1.5rem, 4cqw, 3rem);
}

.sidebar-text {
  font-size: clamp(0.875rem, 2.5cqw, 1rem);
}
```

## Asymmetrical Layout

### Breaking the Grid

```css
/* Offset elements for visual interest */
.asymmetric-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 2rem;
}

.offset-1 { grid-column: 2 / span 4; }
.offset-2 { grid-column: 3 / span 6; }
.wide-1 { grid-column: 1 / -1; }

/* Overlapping elements */
.overlap-container {
  position: relative;
  grid-column: 1 / -1;
  z-index: 1;
}

.overlap-element {
  position: relative;
  z-index: 2;
  margin-top: -2rem;
}
```

### Diagonal Layouts

```css
.diagonal-section {
  position: relative;
  padding: 4rem 2rem;
}

.diagonal-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: var(--color-background);
  transform: skewY(-3deg);
  transform-origin: top left;
  z-index: -1;
}

/* Counter-skew content */
.diagonal-section .content {
  transform: skewY(3deg);
  transform-origin: top left;
}
```

## Aspect Ratio Control

### Modern aspect-ratio

```css
/* Constrain element proportions */
.aspect-square  { aspect-ratio: 1 / 1; }
.aspect-video   { aspect-ratio: 16 / 9; }
.aspect-portrait { aspect-ratio: 3 / 4; }
.aspect-golden  { aspect-ratio: 1.618 / 1; }

/* Responsive aspect ratio */
.responsive-aspect {
  aspect-ratio: 16 / 9;
  width: 100%;
  height: auto;
}

/* Object fit for media */
.aspect-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
```

## Layout Patterns

### Sidebar + Main Content

```css
.layout-sidebar {
  display: grid;
  grid-template-columns: 16rem 1fr;
  gap: 2rem;
  min-height: 100vh;
}

@media (max-width: 48rem) {
  .layout-sidebar {
    grid-template-columns: 1fr;
  }
}
```

### Card Grid

```css
.card-grid {
  display: grid;
  gap: 2rem;
  /* Auto fit creates as many cards as fit, each minimum 280px */
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.card {
  display: grid;
  grid-template-rows: auto 1fr auto;  /* Header, body, footer */
  min-height: 12rem;
}
```

### Split Screen

```css
.split-screen {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100vh;
  gap: 0;
}

.split-screen > * {
  /* Each side fills its area */
}

@media (max-width: 48rem) {
  .split-screen {
    grid-template-columns: 1fr;
  }
}
```

### Centered Content

```css
.centered {
  display: grid;
  place-items: center;
  min-height: 100vh;
  text-align: center;
}

.content-block {
  max-width: 40rem;  /* Constrain text width */
  padding: 2rem;
}
```

### Masonry (Pure CSS)

```css
.masonry {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-auto-flow: dense;
  gap: 1.5rem;
}

.masonry-item:nth-child(3n + 1) { grid-row: span 2; }
.masonry-item:nth-child(5n + 2) { grid-row: span 3; }
.masonry-item:nth-child(7n + 4) { grid-row: span 2; }
```

## Advanced Techniques

### Sticky Sections

```css
.sticky-section {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-background);
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border);
}
```

### CSS Anchors (Popover API)

```css
.popover-trigger {
  anchor-name: --popover-anchor;
}

.popover {
  position: absolute;
  /* Position relative to anchor */
  position-anchor: --popover-anchor;
  position-area: bottom span-left;
  position-try-order: most-inline-size;
}
```

### View Transitions for Layout Changes

```javascript
// Smooth DOM transitions
function navigate(url) {
  document.startViewTransition(() => {
    // Update DOM
    window.location.href = url
  })
}
```

## Layout Accessibility

### Focus Order

```css
/* Ensure logical tab order */
.grid-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

/* Use tabindex="0" only when necessary */
/* Avoid tabindex="-1" on focusable elements */
```

### Landmark Structure

```html
<header>      <!-- Page header -->
<nav>         <!-- Primary navigation -->
<main>        <!-- Main content area -->
<aside>       <!-- Complementary content -->
<footer>      <!-- Page footer -->
```

## Layout Performance

### Contain for Performance

```css
/* Isolate expensive layout subtrees */
.layout-section {
  contain: layout style;  /* Independent layout, style isolation */
}

/* Content that doesn't affect other elements */
.card {
  contain: content;  /* Layout + style isolation without creating a new block */
}
```

### Avoid Layout Thrashing

```css
/* ✅ Efficient: use transform for positioning */
.element {
  transform: translateX(100px);
}

/* ❌ Inefficient: changing layout properties */
.element-bad {
  left: 100px;     /* Triggers reflow */
  width: 200px;    /* Triggers reflow */
  margin: 10px;    /* Triggers reflow */
}
```

## Tools & Resources

- **CSS Grid Garden** — `https://cssgridgarden.com/` (learn Grid interactively)
- **Flexbox Froggy** — `https://flexboxfroggy.com/` (learn Flexbox interactively)
- **LayoutIt** — `https://www.layoutit.com/` (CSS Grid and Flexbox playground)
- **CSS Tricks: Complete Guide to Grid** — `https://css-tricks.com/snippets/css/complete-guide-grid/`
- **CSS Tricks: Complete Guide to Flexbox** — `https://css-tricks.com/snippets/css/a-guide-to-flexbox/`
- **Every Layout** — `https://every-layout.dev/` (reusable CSS layout patterns)
- **Modern CSS** — `https://moderncss.dev/` (modern CSS techniques explained)
