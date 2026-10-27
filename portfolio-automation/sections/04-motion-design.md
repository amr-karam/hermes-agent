# Motion Design Concepts & Animation Examples

Motion design communicates purpose and creates emotional connections. This section provides animation concepts, timing guidelines, and interactive examples for portfolio presentations.

## Motion Design Principles

### Core Principles

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **Purpose** | Every animation serves a purpose | State transitions, feedback, storytelling |
| **Timing** | Duration conveys importance | Fast = simple; Slow = complex |
| **Easing** | Natural movement feels organic | Ease-out for enters, ease-in for exits |
| **Performance** | 60fps target, minimal reflow | GPU-accelerated transforms |
| **Accessibility** | Respect `prefers-reduced-motion` | Check before applying |

## Animation Timing & Easing Reference

### Duration Scale

| Duration | Best For | Example |
|----------|----------|---------|
| `fast` (100ms) | Micro-interactions | Button hover |
| `moderate` (250ms) | Component transitions | Card reveal |
| `slow` (400ms) | Section entrances | Hero fade-in |
| `slower` (700ms) | Complex choreography | Multi-step animations |

### Easing Functions

```css
/* Natural easing - recommended for motion */
:root {
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-emphasized: cubic-bezier(0.2, 0, 0, 1);
  --ease-natural: cubic-bezier(0.25, 0.1, 0.25, 1);
}
```

## Animation Preset Library

### 1. Fade In (Subtle Entrance)

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Apply: 0.3s ease-out */
.animate-fade-in {
  animation: fadeIn 0.3s var(--ease-out) forwards;
}
```

### 2. Slide Up (Content Entrance)

```css
@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Apply: 0.4s ease-out */
.animate-slide-up {
  animation: slideUp 0.4s var(--ease-out) forwards;
}
```

### 3. Scale In (Highlight Elements)

```css
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* Apply: 0.25s ease-emphasized */
.animate-scale-in {
  animation: scaleIn 0.25s var(--ease-emphasized) forwards;
}
```

### 4. Staggered Sequence (List Elements)

```css
/* CSS-only stagger */
.stagger-list > *:nth-child(1) { animation-delay: 0.1s; }
.stagger-list > *:nth-child(2) { animation-delay: 0.2s; }
.stagger-list > *:nth-child(3) { animation-delay: 0.3s; }
.stagger-list > *:nth-child(4) { animation-delay: 0.4s; }
.stagger-list > *:nth-child(5) { animation-delay: 0.5s; }

.stagger-list > * {
  animation: fadeIn 0.3s var(--ease-out) forwards;
  opacity: 0;
}
```

## Interaction Patterns

### Micro-Interactions

| Interaction | Animation Type | Duration | Easing |
|-------------|----------------|----------|--------|
| Button hover | Scale up 1.02x | 100ms | ease-out |
| Button click | Scale down 0.98x | 50ms | ease-in |
| Card hover | Lift (y: -4px), shadow increase | 200ms | ease-out |
| Input focus | Border color change, subtle glow | 150ms | ease-out |

### Loading States

```html
<!-- Skeleton Loading -->
<div class="skeleton-loader" aria-label="Loading content...">
  <div class="skeleton-row shimmer"></div>
  <div class="skeleton-row shimmer"></div>
  <div class="skeleton-row shimmer"></div>
</div>

<style>
  /* Shimmer effect */
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .shimmer {
    background: linear-gradient(90deg, 
      #f0f0f0 25%, #e4e4e4 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  
  .skeleton-row {
    height: 1.5rem;
    border-radius: 0.25rem;
    margin: 0.5rem 0;
    background: #e4e4e4;
  }
</style>
```

### Page Transitions

```css
/* Fade transition between pages */
.page-enter {
  opacity: 0;
  animation: fadeIn 0.3s ease-out forwards;
}

.page-enter-delay {
  animation-delay: 0.1s;
}
```

## Reduced Motion Accessibility

Always respect user preferences:

```css
/* Default animations */
@media (prefers-reduced-motion: no-preference) {
  .animated-element { animation: fadeIn 0.4s ease-out; }
}

/* Reduced motion - disable or simplify */
@media (prefers-reduced-motion: reduce) {
  .animated-element { animation: none; transition: none; }
  
  /* If motion conveys meaning, provide static alternative */
  .animated-element { opacity: 1; transform: none; }
}
```

```javascript
// JavaScript check
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const animationDuration = prefersReduced ? 0 : 400;
```

## GSAP Animation Presets

For complex choreography, use GSAP with pre-configured presets:

```javascript
// Basic GSAP animation (requires GSAP library)
// Reference: GSAP presets from ui-ux-pro-max skill

gsap.to(".hero-title", {
  duration: 0.8,
  y: 0,
  opacity: 1,
  ease: "power3.out",
  delay: 0.2
});

gsap.from(".hero-subtitle", {
  duration: 0.6,
  y: 10,
  opacity: 0,
  ease: "power2.out",
  delay: 0.4
});

// Stagger animation
gsap.from(".feature-card", {
  duration: 0.4,
  y: 16,
  opacity: 0,
  ease: "power2.out",
  stagger: 0.1,
  delay: 0.2
});
```

## Video & Animation Showcase

### Video Presentation Best Practices

| Element | Specification | Notes |
|---------|--------------|-------|
| Duration | 3-5 minutes | Keep concise |
| Frame Rate | 60fps | Smooth motion |
| Resolution | 1920x1080 | Full HD minimum |
| Caption | Yes | Accessibility |
| Audio | Background only | No voice needed |
| Thumbnail | First frame | Clear, readable |

### Portfolio Animation Reel Template

```html
<section class="animation-showcase" aria-label="Motion Design Examples">
  <h2>Motion Design</h2>
  
  <div class="showcase-grid">
    <article>
      <video poster="animation-1-poster.jpg" controls aria-label="Button micro-interaction animation">
        <source src="btn-hover.mp4" type="video/mp4">
        Your browser does not support video.
      </video>
      <h3>Button Interactions</h3>
      <p>Micro-interaction design for primary actions</p>
    </article>
    
    <article>
      <video poster="animation-2-poster.jpg" controls aria-label="Page transition animation">
        <source src="page-transition.mp4" type="video/mp4">
      </video>
      <h3>Page Transitions</h3>
      <p>Seamless navigation between sections</p>
    </article>
  </div>
</section>
```

---

*Animation design follows ui-ux-pro-max guidelines for GSAP presets, accessibility compliance, and motion meaning principles.*
