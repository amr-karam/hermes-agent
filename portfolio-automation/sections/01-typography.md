# Typography System Guidelines

Professional typography is the foundation of every great design portfolio. This section establishes the typographic hierarchy, usage rules, and visual consistency standards for portfolio presentation.

## Font Pairing Strategy

### Primary Font Pairings

| Heading Font | Body Font | Best For |
|-------------|---------|----------|
| **Inter** (Bold) | Inter (Regular) | Modern SaaS, Tech |
| **Playfair Display** | Inter | Editorial, Creative |
| **Space Grotesk** | Inter | Futuristic, Bold |
| **Crimson Pro** | Inter | Elegant, Traditional |
| **DM Sans** | DM Sans | Clean, Minimalist |

### Implementation

```css
/* Google Fonts import */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

/* Font stack */
:root {
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-secondary: 'Playfair Display', Georgia, serif;
}
```

## Type Scale & Hierarchy

### Display Hierarchy

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `display-2xl` | 3.75rem (60px) | 1.1 | 700 | Hero titles |
| `display-xl` | 3rem (48px) | 1.1 | 700 | Section headers |
| `display-lg` | 2.25rem (36px) | 1.2 | 700 | Project titles |
| `display-md` | 1.875rem (30px) | 1.2 | 700 | Case study headers |

### Heading Hierarchy

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `h1` | 1.25rem (20px) | 1.4 | 700 | Page titles |
| `h2` | 1.125rem (18px) | 1.4 | 600 | Section titles |
| `h3` | 1rem (16px) | 1.4 | 600 | Subsection headers |
| `h4` | 0.875rem (14px) | 1.4 | 600 | Component titles |

### Body Text

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `body-xl` | 1.125rem (18px) | 1.6 | 400 | Pull quotes, testimonials |
| `body-lg` | 1.0625rem (17px) | 1.6 | 400 | Subheadings, captions |
| `body-md` | 1rem (16px) | 1.6 | 400 | Primary body copy |
| `body-sm` | 0.875rem (14px) | 1.5 | 400 | Secondary text, comments |
| `body-xs` | 0.75rem (12px) | 1.4 | 400 | Metadata, dates |

## Line Length & Readability

### Optimal Measure

| Context | Characters | Pixels (16px) |
|---------|------------|---------------|
| Mobile | 35-45 | 560-720 |
| Tablet | 45-65 | 720-1040 |
| Desktop | 60-75 | 960-1200 |

### Implementation

```css
.container {
  max-width: 65ch; /* ~650-700px */
  margin: 0 auto;
  padding: 0 1rem;
}
```

## Letter Spacing & Tracking

### Default Values

| Element Type | Letter Spacing |
|-------------|----------------|
| Display Text | -0.02em |
| Headings | -0.01em to -0.005em |
| Body Text | 0.005em |
| UI Elements | 0.05em (uppercase) |
| Code/Misc | 0 |

### Best Practices

```css
/* Heading tracking */
h1, h2, h3 {
  letter-spacing: -0.02em;
}

/* Body tracking */
p, li, td {
  letter-spacing: 0.005em;
}

/* UI tracking */
.btn, .nav-link {
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
```

## Responsive Typography

### Fluid Typography

```css
/* Fluid heading sizes */
.h1-fluid {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
}

.h2-fluid {
  font-size: clamp(1.25rem, 3.5vw, 2rem);
}
```

### Breakpoint Adjustments

| Breakpoint | Max Font Size | Line Height |
|------------|---------------|-------------|
| Mobile (< 640px) | Display: 2.5rem | 1.1 |
| Tablet (640-1024px) | Display: 3rem | 1.1 |
| Desktop (> 1024px) | Display: 3.75rem | 1.1 |

## Typography Implementation Checklist

- [ ] Use system font stack as fallback
- [ ] Load fonts with `font-display: swap`
- [ ] Set appropriate `line-height` per element
- [ ] Maintain consistent `letter-spacing`
- [ ] Use `clamp()` for fluid sizing
- [ ] Test with reduced motion enabled
- [ ] Verify contrast ratios (4.5:1 minimum)
- [ ] Test readability at multiple zoom levels
- [ ] Use semantic HTML heading order
- [ ] Maintain visual hierarchy in DOM order

## Typography Tokens (CSS Custom Properties)

```css
:root {
  /* Font sizes */
  --size-display-2xl: clamp(2.5rem, 4vw, 3.75rem);
  --size-display-xl: clamp(1.75rem, 3vw, 3rem);
  --size-display-lg: clamp(1.5rem, 2.5vw, 2.25rem);
  --size-display-md: clamp(1.25rem, 2vw, 1.875rem);
  --size-h1: 1.25rem;
  --size-h2: 1.125rem;
  --size-h3: 1rem;
  --size-h4: 0.875rem;
  --size-body-lg: 1.125rem;
  --size-body-md: 1rem;
  --size-body-sm: 0.875rem;
  --size-body-xs: 0.75rem;
  
  /* Line heights */
  --lh-display: 1.1;
  --lh-heading: 1.2;
  --lh-body: 1.6;
  --lh-label: 1.3;
  
  /* Font weights */
  --weight-regular: 400;
  --weight-medium: 500;
  --weight-semibold: 600;
  --weight-bold: 700;
}
```

## Usage Examples

### Hero Section Typography

```html
<h1 class="display-xl">Jane Doe</h1>
<p class="body-lg">Senior Product Designer</p>
<a href="#work" class="btn btn-primary">View My Work</a>
```

### Case Study Header

```html
<h2 class="h1">EcoFlow App Redesign</h2>
<p class="body-md color-text-secondary">A sustainable mobile app experience for eco-conscious users</p>
```

### Section Header

```html
<div class="section-kicker">Let's Create Together</div>
<h2 class="display-lg">My Portfolio</h2>
<p class="body-lg">Explore my work across UX, UI, and brand design</p>
```