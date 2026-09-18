---
name: accessibility-design
description: Digital accessibility design skill covering WCAG 2.1/2.2 compliance, ARIA patterns, inclusive color and typography, keyboard navigation, screen reader testing, semantic HTML, and accessible component design for web interfaces.
---

# Accessibility Design

## Inclusive Design Mindset

### The Three Pillars

**Perceivable** — Information is presented in ways users can perceive
- Visual alternatives for non-text content
- Captions for audio content
- Color is never the only indicator

**Operable** — Interface components are navigable
- Keyboard access for all functionality
- Adequate time for users to read and use content
- Seizure-safe design (no flashing)

**Understandable** — Information and operation are understandable
- Predictable navigation and labeling
- Consistent navigation across pages
- Error prevention and recovery help

## WCAG 2.1/2.2 Levels

```
A (Minimum) — Essential for basic accessibility
AA (Standard)   — Standard accessibility requirements (most common target)
AAA (Enhanced)  — Best effort — some guidelines cannot apply to all content

Key success criteria for AA compliance:
  1.1.1 Non-text Content — Alt text, decorative images marked as such
  1.3.1 Info and Relationships — Proper heading structure, lists
  1.4.3 Contrast (AA) — 4.5:1 for normal text, 3:1 for large text
  1.4.4 Resize Text — Up to 200% without loss of content
  1.4.10 Reflow — No horizontal scrolling at 320px width
  1.4.11 Non-text Contrast — 3:1 for graphics and UI components
  1.4.12 Text Spacing — No clipping at 1.5× line height, 0.5rem word spacing
  2.1.1 Keyboard — All functionality via keyboard
  2.1.2 No Keyboard Trap — Keyboard focus can leave any component
  2.4.1 Bypass Blocks — Skip link to main content
  2.4.2 Page Title — Unique, descriptive titles
  2.4.3 Focus Order — Tab order matches visual layout
  2.5.1 Pointer Gestures — Single-pointer alternatives
  2.5.2 Pointer Cancellation — Down-event activation not required
  4.1.2 Name, Role, Value — All UI components have proper semantics
```

## Semantic HTML

### Document Structure

```html
<!-- ✅ Proper document outline -->
<body>
  <a href="#main" class="skip-link">Skip to main content</a>

  <header role="banner">
    <nav aria-label="Primary navigation">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  </header>

  <main id="main" role="main">
    <article>
      <header>
        <h1>Article Title</h1>
        <p>Published <time datetime="2024-01-15">January 15, 2024</time></p>
      </header>
      <section aria-labelledby="section-1">
        <h2 id="section-1">Section Title</h2>
        <p>Content...</p>
      </section>
    </article>
  </main>

  <aside role="complementary" aria-labelledby="related-heading">
    <h2 id="related-heading">Related Content</h2>
  </aside>

  <footer role="contentinfo">
    <p>&copy; 2024 Company Name</p>
  </footer>
</body>
```

### Heading Hierarchy

```html
<!-- ✅ Single H1 per page, proper hierarchy -->
<h1>Main Page Title</h1>          <!-- Required: one H1 -->
<h2>Section Title</h2>             <!-- First section -->
<h3>Subsection Title</h3>         <!-- Within H2 section -->
<h2>Another Section</h2>           <!-- Second section -->
<h3>Subsection</h3>               <!-- Within H2 section -->

<!-- ❌ Don't skip levels -->
<h1>Page Title</h1>
<h3>Subsection</h3>   <!-- ⚠️ Missing H2! */

<!-- ❌ Don't use headings for visual styling only */
<h2 class="subtitle">This should be a paragraph</h2>
```

### Lists for Related Content

```html
<!-- Navigation lists -->
<nav aria-label="Table of contents">
  <ul>
    <li><a href="#section-1">Introduction</a></li>
    <li><a href="#section-2">Methodology</a></li>
    <li><a href="#section-3">Results</a></li>
  </ul>
</nav>

<!-- Descriptive lists -->
<dl>
  <dt>Product</dt>
  <dd>Acme Widget Pro</dd>

  <dt>Price</dt>
  <dd>$49.99</dd>

  <dt>Availability</dt>
  <dd>In stock</dd>
</dl>
```

## Images & Media

### Alt Text Guidelines

```html
<!-- Decorative images — empty alt -->
<img src="decoration.png" alt="" role="presentation">

<!-- Informative images — describe what's shown -->
<img src="sales-chart.png" alt="Q4 sales increased 25% over Q3">

<!-- Functional images — describe the action -->
<img src="print-icon.png" alt="Print this page" onclick="window.print()">

<!-- Complex images — short alt + long description -->
<img src="floorplan.png"
     alt="Building floor plan"
     longdesc="#floorplan-description">

<!-- Grouped images — use figure/figcaption -->
<figure>
  <img src="team-photo.jpg" alt="Engineering team at annual retreat">
  <figcaption>The engineering team at our 2024 retreat in Asheville, NC.</figcaption>
</figure>
```

### Color Contrast

```css
/* Use CSS color-contrast() (relatively new support) or pre-computed values */

/* Pre-computed accessible pairs */
.text-primary {
  color: var(--color-text-primary);       /* #111827 on white */
  background: var(--color-background);     /* #FFFFFF */
  /* Contrast ratio: 15.2:1 — exceeds AAA */
}

.text-secondary {
  color: var(--color-text-secondary);     /* #4B5563 on white */
  /* Contrast ratio: 4.5:1 — meets AA */
}

/* For large text (≥18pt bold or ≥14pt bold), 3:1 is acceptable */
.text-large {
  color: var(--color-text-tertiary);       /* #6B7280 on white */
  font-size: 1.25rem;
  font-weight: 700;
  /* Contrast ratio: ~3:1 is acceptable for large text */
}
```

## Keyboard Navigation

### Focus Management

```css
/* Visible focus indicator — don't remove it */
*:focus {
  /* You can customize, but don't remove entirely */
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

/* Focus-visible for better UX (only shows on keyboard) */
*:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
  border-radius: 2px;
}

/* Skip link for bypassing navigation */
.skip-link {
  position: absolute;
  top: -2rem;
  left: 0.5rem;
  background: var(--color-accent);
  color: var(--color-on-accent);
  padding: 0.5rem;
  border-radius: 0.25rem;
  z-index: 100;
  transition: top 0.2s ease;
}

.skip-link:focus {
  top: 0.5rem;
}
```

### Taborder Control

```html
<!-- Natural tab order — follows DOM order -->
<form>
  <input type="text" id="name" required>
  <label for="name">Name</label>

  <input type="email" id="email" required>
  <label for="email">Email</label>

  <button type="submit">Submit</button>
</form>

<!-- Manual tab order only when DOM order doesn't work -->
<div role="group" aria-labelledby="delivery-heading">
  <h3 id="delivery-heading">Delivery method</h3>
  <input type="radio" id="standard" name="delivery" tabindex="0">
  <label for="standard">Standard (5–7 days)</label>

  <input type="radio" id="express" name="delivery" tabindex="0">
  <label for="express">Express (1–2 days)</label>
</div>

<!-- ❌ Avoid positive tabindex values — creates confusing order -->
<div tabindex="1">First</div>
<div tabindex="2">Second</div>  <!-- This is wrong! */
```

## ARIA Patterns

### When to Use ARIA

```html
<!-- ✅ Use native HTML first, ARIA only when needed -->
<!-- Native button (preferred) -->
<button>Submit</button>

<!-- Custom button requires ARIA -->
<div role="button" tabindex="0"
     aria-pressed="false"
     onclick="toggle()">
  Toggle
</div>

<!-- Landmark roles -->
<div role="banner">Header content</div>
<div role="navigation" aria-label="Primary">Nav</div>
<div role="main">Main content</div>
<div role="complementary">Sidebar</div>
<div role="contentinfo">Footer</div>

<!-- Live regions for dynamic updates -->
<div aria-live="polite" aria-atomic="true">
  {{ statusMessage }}
</div>

<!-- Alert — immediate, important -->
<div role="alert" aria-live="assertive">
  Error: Please fill in all required fields.
</div>
```

### ARIA Design Patterns

```html
<!-- Tabs pattern -->
<div class="tabs" role="tablist" aria-label="Tab navigation">
  <button role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">
    Overview
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2">
    Details
  </button>
</div>
<div id="panel-1" role="tabpanel" aria-labelledby="tab-1" tabindex="0">
  Overview content
</div>
<div id="panel-2" role="tabpanel" aria-labelledby="tab-2" tabindex="0" hidden>
  Details content
</div>

<!-- Disclosure pattern (accordion) -->
<div class="accordions">
  <h3>
    <button
      aria-expanded="false"
      aria-controls="accordion-body-1"
      id="accordion-header-1">
      What is your return policy?
    </button>
  </h3>
  <div
    id="accordion-body-1"
    role="region"
    aria-labelledby="accordion-header-1"
    hidden>
    You can return items within 30 days...
  </div>
</div>
```

## Accessible Forms

### Label Association

```html
<!-- ✅ Explicit label -->
<label for="email">Email address</label>
<input type="email" id="email" required>

<!-- ✅ Implicit label (wrapping) -->
<label>
  Email address
  <input type="email" required>
</label>

<!-- ✅ Group of related inputs -->
<fieldset>
  <legend>Choose your delivery method</legend>
  <input type="radio" id="standard" name="delivery" value="standard">
  <label for="standard">Standard (5–7 business days)</label>

  <input type="radio" id="express" name="delivery" value="express">
  <label for="express">Express (1–2 business days)</label>
</fieldset>

<!-- ✅ Error messaging -->
<div class="form-field">
  <label for="password">Password</label>
  <input
    type="password"
    id="password"
    aria-describedby="password-error"
    aria-invalid="true"
    required>
  <span id="password-error" class="error-message">
    Password must be at least 8 characters
  </span>
</div>
```

### Form Validation

```html
<!-- ✅ Accessible error summary -->
<div role="alert" aria-labelledby="error-summary-title">
  <h2 id="error-summary-title">Please fix the following errors:</h2>
  <ul>
    <li><a href="#email">Email is required</a></li>
    <li><a href="#password">Password must be 8+ characters</a></li>
  </ul>
</div>
```

## Screen Reader Testing

### Testing Tools

```bash
# macOS — VoiceOver
Cmd + F5 to enable VoiceOver
Option + Cmd + U for rotor (navigation menu)

# Windows — NVDA
Insert + Up/Down for element reading
Insert + F7 for element list

# Windows — JAWS
Insert + Up/Down for element reading

# Browser dev tools
# Chrome DevTools → Elements → Accessibility tab
# Firefox Accessibility Inspector
```

### Screen Reader Announcements

```html
<!-- Hidden from visual users but available to screen readers */
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

/* Announce state changes */
.status-icon [data-status="loading"]::after {
  content: "Loading";
  /* Screen readers will announce this */
}
```

## Motion & Animation

### Respecting User Preferences

```css
/* Reduce motion preference */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast preference */
@media (prefers-contrast: high) {
  * {
    border-width: 2px !important;
    outline-width: 2px !important;
  }
}

/* Inverted colors preference */
@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
  }
}
```

### Reduced Motion Alternatives

```css
/* Instead of spinner animation, provide a static indicator */
.progress-spinner {
  /* Default: spinning animation */
  animation: spin 1s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .progress-spinner {
    /* Static — no animation */
    animation: none;
  }

  /* Add text alternative */
  .progress-spinner::after {
    content: "Loading...";
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
}
```

## Testing Checklist

### Automated Testing

```
□ Run axe-core or Pa11y on all pages
□ Check color contrast (WCAG 2.1 AA minimum)
□ Verify all images have alt attributes
□ Confirm valid HTML (no missing closing tags)
□ Test with JavaScript disabled
□ Validate form labels and error messages
□ Check tab order (keyboard navigation)
□ Verify ARIA attributes are valid
```

### Manual Testing

```
□ Navigate entire site with keyboard only (Tab, Shift+Tab)
□ Test all interactive elements (Enter, Space, Esc, Arrow keys)
□ Listen to page with screen reader (VoiceOver, NVDA, JAWS)
□ Check all videos have captions and transcripts
□ Test at 200% zoom (no horizontal scrolling)
□ Test on mobile (voice control, switch control)
□ Check focus is visible on all interactive elements
□ Verify skip links work
```

## Accessibility Audit Workflow

### Automated Tools

```bash
# Lighthouse CLI
lighthouse https://example.com --output=json --output-path=./report.json

# Pa11y CLI
pa11y https://example.com

# axe-core in tests
import { axe, toHaveNoViolations } from 'jest-axe'
expect(await axe(container)).toHaveNoViolations()

# Storybook accessibility addon
# addon-a11y in .storybook/main.js
```

### Manual Audit Script

```text
For each interactive component:
  1. Can I reach it with Tab?
  2. Does focus look distinctive?
  3. Can I activate it with Enter/Space?
  4. Does Esc close menus/modals?
  5. Does Arrow navigation work (where expected)?
  6. Does screen reader announce its name and role?
  7. Does screen reader announce its state (expanded, selected, etc.)?
```

## Resources & Tools

- **axe-core** — `https://www.deque.com/axe/` (automated accessibility testing)
- **Pa11y** — `https://pa11y.org/` (CLI accessibility testing)
- **WAVE** — `https://wave.webaim.org/` (web accessibility evaluation tool)
- **WebAIM Contrast Checker** — `https://webaim.org/resources/contrastchecker/`
- **Colour Contrast Analyser** — `https://developer.paciellogroup.com/resources/contrastanalyser/`
- **ARIA Authoring Practices** — `https://www.w3.org/WAI/ARIA/apg/`
- **Inclusive Components** — `https://inclusive-components.design/`
- **A11Y Project Checklist** — `https://www.a11yproject.com/checklist/`
