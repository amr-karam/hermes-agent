---
name: web-animation
description: Web animation and transition design skill covering motion design principles, CSS animation techniques, easing curves, performance optimization, and creative timing for web interfaces. Use when designing animations, transitions, micro-interactions, loading states, page transitions, staggered reveals, or motion choreography for web applications and interfaces.
---

# Web Animation

## Motion Design Philosophy

Animation serves the user, not the designer's ego. Every motion has a job:

1. **Orient** — help users understand spatial relationships and state changes
2. **Confirm** — acknowledge user actions and provide feedback
3. **Guide** — direct attention to what matters next
4. **Express** — reinforce brand personality through movement quality

## The Five Principles of Motion

### 1. Respect the User

```
- Honor prefers-reduced-motion and accessibility
- Keep animations fast (100-300ms for micro-interactions)
- Don't animate things while the user is typing
- Allow users to dismiss or pause non-essential motion
```

### 2. Maintain Context

```
- Use shared element transitions to show continuity between states
- Animate from the trigger point (ripple, expand-from-click)
- Keep persistent elements in place while content transitions
- Show where elements come from and where they go
```

### 3. Create Hierarchy

```
- Animate in order of importance (primary → secondary → tertiary)
- Use staggered delays (20-50ms per element) for lists
- Heavier/larger elements move slower (mass metaphor)
- Related elements animate together as a unit
```

### 4. Provide Feedback

```
- Immediate response (0-50ms) to every user action
- Visual state change on hover, press, focus
- Loading states for anything >100ms
- Success/error confirmation for completed actions
```

### 5. Enhance, Don't Distract

```
- No decorative animation during critical tasks
- Subtle animations (10-20% property changes)
- Animations should feel inevitable, not surprising
- Remove motion that doesn't serve the user's goal
```

## Timing & Easing

### Duration Scale

```
Instant (0-50ms):   Keyboard focus, hover state changes
Fast (100-200ms):   Button states, toggle switches, inline expansion
Medium (200-300ms): Modal dialogs, page transitions, form reveals
Slow (300-500ms):   Page loads, onboarding sequences
```

### Custom Easing Curves

```css
/* Anticipate — slight reverse before moving forward */
anticipate { animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1.4); }

/* Overshoot — go past target then bounce back */
bounce { animation-timing-function: cubic-bezier(0.25, 1.5, 0.5, 1); }

/* Smooth — natural acceleration and deceleration */
standard { animation-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1); }

/* Sharp — quick start, slow finish */
emphasized { animation-timing-function: cubic-bezier(0.2, 0, 0, 1); }

/* Gentle — slow start, quick finish */
gentle { animation-timing-function: cubic-bezier(0.1, 0.9, 0.2, 1); }

/* Elastic — bouncy, playful */
elastic { animation-timing-function: cubic-bezier(0.68, -0.55, 0.26, 1.55); }
```

### JavaScript Easing Libraries

```javascript
// Using GSAP for complex easing
gsap.to('.element', {
  duration: 0.5,
  y: 100,
  ease: 'power3.inOut',  // Equivalent to cubic-bezier(0.65, 0.05, 0.36, 1)
  stagger: {
    each: 0.1,          // 100ms delay between each
    from: 'start',      // Start from first element
    grid: 'auto',       // Auto-grid stagger
  }
})

// Custom elastic easing
gsap.registerPlugin(MotionPathPlugin)
gsap.to('.element', {
  duration: 1.5,
  motionPath: {
    path: 'M0 0 L100 100 L200 0',
    alignOrigin: 0.5,
  },
  ease: 'elastic.out(1, 0.3)'
})
```

## CSS Animation Techniques

### Staggered List Animations

```css
@layer animations {
  .list-item {
    opacity: 0;
    transform: translateY(20px);
    animation: slideIn 0.5s ease-out forwards;
    animation-fill-mode: both;
  }

  /* Stagger using nth-child */
  .list-item:nth-child(1) { animation-delay: 0ms; }
  .list-item:nth-child(2) { animation-delay: 50ms; }
  .list-item:nth-child(3) { animation-delay: 100ms; }
  .list-item:nth-child(4) { animation-delay: 150ms; }
  .list-item:nth-child(5) { animation-delay: 200ms; }
  /* ... or use SCSS @for loop */
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Loading Skeletons

```css
.skeleton {
  background: linear-gradient(90deg,
    #f0f0f0 0%,
    #e0e0e0 50%,
    #f0f0f0 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Hover States with Depth

```css
.card {
  transition:
    transform 0.2s ease-out,
    box-shadow 0.2s ease-out,
    border-color 0.2s ease-out;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.08),
    0 4px 24px rgba(0, 0, 0, 0.12);
}

.card:active {
  transform: translateY(-2px);
}
```

### Toggle Switch Animation

```css
.toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: #ccc;
  transition: 0.3s;
  border-radius: 9999px;
}

.slider::before {
  content: "";
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background: #4F46E5;
}

input:checked + .slider::before {
  transform: translateX(24px);
}
```

## Animation Composition

### Page Load Sequence

```css
/* Orchestrated entrance animation */
.page-load {
  opacity: 0;
  transform: translateY(20px);
  animation: pageLoad 0.8s ease-out forwards;
}

@keyframes pageLoad {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header loads first, then content, then footer */
.header {
  animation-delay: 0ms;
  animation-duration: 0.5s;
}
.content {
  animation-delay: 200ms;
  animation-duration: 0.5s;
}
.footer {
  animation-delay: 400ms;
  animation-duration: 0.5s;
}
```

### Modal Dialog Animation

```css
.modal-overlay {
  opacity: 0;
  transition: opacity 0.3s ease-out;
}

.modal-overlay:not(.hidden) {
  opacity: 1;
}

.modal-content {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
  transition:
    opacity 0.3s ease-out,
    transform 0.3s cubic-bezier(0.34, 1.56, 0.68, 1);
}

.modal-content:not(.hidden) {
  opacity: 1;
  transform: scale(1) translateY(0);
}
```

### Shared Element Transitions (View Transitions API)

```css
/* Modern browser native transitions */
::view-transition-old(root) {
  animation: fade-out 0.3s ease-out;
}

::view-transition-new(root) {
  animation: fade-in 0.3s ease-out 0.3s both;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

## Performance Optimization

### GPU-Accelerated Properties

```css
/* ✅ Animate these (GPU-accelerated, no layout recalculation) */
.element {
  will-change: transform, opacity;
  transform: translateZ(0);  /* Force GPU layer */
}

/* ❌ Avoid animating these (triggers layout/reflow) */
.element {
  /* width, height, margin, padding, left, top */
  /* These cause the browser to recalculate layout */
}
```

### Animation Performance Checklist

```
□ Use transform and opacity for animations (not width/height)
□ Set will-change: transform for elements that will animate
□ Avoid layout thrashing — batch DOM reads and writes
□ Use animation-composition: accumulate for additive animations
□ Prefer CSS animations over JavaScript for simple transitions
□ Use requestAnimationFrame for JavaScript-driven animations
□ Keep animation frames under 3ms (60fps target)
□ Use contain: layout to isolate expensive animations
□ Reduce motion for low-end devices (saveReducedMotion)
```

### JavaScript Performance Pattern

```javascript
// ✅ Correct: batch DOM reads and writes
function animateElement(el) {
  // Read phase (batch all reads)
  const startRect = el.getBoundingClientRect()
  const windowHeight = window.innerHeight

  // Write phase (batch all writes)
  requestAnimationFrame(() => {
    el.style.transform = `translateY(${windowHeight - startRect.top}px)`
  })
}

// ❌ Wrong: interleaved read/write causes thrashing
function badAnimate(el) {
  const rect = el.getBoundingClientRect()  // Read
  el.style.top = '100px'                   // Write
  const newRect = el.getBoundingClientRect() // Read (forces layout!)
}
```

## Creative Motion Patterns

### Text Animation: Typewriter

```css
.typewriter {
  overflow: hidden;
  border-right: 3px solid #4F46E5;
  white-space: nowrap;
  width: 0;
  animation: type 3.5s steps(40, end) forwards;
}

@keyframes type {
  0% { width: 0; }
  100% { width: 100%; }
}
```

### Text Animation: Word-by-Word Reveal

```css
.reveal-by-word {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.25em;
}

.reveal-by-word .word {
  opacity: 0;
  transform: translateY(20px);
  display: inline-block;
  animation: wordReveal 0.5s ease-out forwards;
}

.reveal-by-word .word:nth-child(1) { animation-delay: 0ms; }
.reveal-by-word .word:nth-child(2) { animation-delay: 50ms; }
.reveal-by-word .word:nth-child(3) { animation-delay: 100ms; }
/* etc. */

@keyframes wordReveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Morphing Shapes (SVG)

```html
<svg viewBox="0 0 100 100" class="morph-shape">
  <path d="M50,5 L95,25 V75 L50,95 L5,75 V25 Z" />
</svg>

<style>
.morph-shape path {
  transition: d 0.5s cubic-bezier(0.34, 1.56, 0.68, 1);
}

.morph-shape:hover path {
  d: path("M50,15 A35,35 0 1,1 50,85 A35,35 0 1,1 50,15");
}
</style>
```

### Parallax Scrolling

```css
.parallax-container {
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.parallax-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.parallax-back {
  transform: translateZ(-1px) scale(2);
  /* Creates a subtle depth illusion */
}

.parallax-base {
  transform: translateZ(0);
}

.parallax-speed {
  transform: translateZ(-2px) scale(3);
  /* Moves slower — further back */
}
```

## Motion Quality

### The Illusion of Life

```
Squash & Stretch:
  - Compress a button slightly on press (scale to 0.95)
  - Expand a modal with a slight overshoot

Anticipation:
  - Move opposite slightly before the main action
  - Example: a bouncing ball dips down before going up

Staging:
  - Make important actions larger/louder in duration
  - Use screen direction consistently (left → right = progress)

Straight Ahead vs. Pose-to-Pose:
  - Straight ahead: frame-by-frame animation (complex paths)
  - Pose-to-pose: keyframes with automated in-betweening (CSS animations)
  - Use both: CSS for transitions, JavaScript for custom curves
```

### Physics-Based Motion

```javascript
// Spring-based animation using Popmotion
import { animate } from 'popmotion'

animate(element, {
  y: 0,
  opacity: 1
}, {
  type: 'spring',
  stiffness: 300,
  damping: 20,
  restDelta: 0.5
})
```

## Accessibility

### Reduced Motion

```css
/* Always include this */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Focus Animation

```css
/* Don't remove focus — enhance it */
*:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
  animation: none;
}
```

### Loading State Accessibility

```css
.loading-skeleton {
  /* Screen readers get "Loading..." text */
}

.loading-skeleton::after {
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
```

## Tooling & Libraries

### CSS-First (Recommended for most use cases)

```css
/* CSS animations — lightweight, performant */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Framer Motion (React)

```jsx
import { motion, AnimatePresence } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
  transition={{
    duration: 0.3,
    ease: [0.34, 0.18, 0.25, 0.95]
  }}
/>
```

### GSAP (Complex Sequences)

```javascript
gsap.timeline({ defaults: { ease: 'power3.out' } })
  .to('.headline', { y: 0, opacity: 1, duration: 1 })
  .to('.subhead', { y: 0, opacity: 1, duration: 0.8 }, '-=0.5')
  .to('.cta', { scale: 1, opacity: 1, duration: 0.5 }, '-=0.3')
```

## Animation Showcases for Inspiration

### Award-Winning Animation Sites

These sites are recognized by Awwwards, FWA, and CSS Awards for exceptional motion design:

```
1.  Bruno Simon Portfolio — https://bruno-simon.com/
    Animation: Three.js 3D physics, interactive car configurator,
    scroll-linked 3D transforms, WebGL particle systems
    Techniques: GSAP + Three.js, custom easing, spring physics
    Why study: Masterclass in 3D web animation and interaction

2.  Lusion v3 — https://lusion.co.jp/
    Animation: Fluid blob morphing, continuous SVG paths,
    scroll-driven narrative, custom cursor with ripple effect
    Techniques: SVG path animation, GSAP timeline, custom easing
    Why study: Seamless flow between sections, organic motion

3.  Noomo Agency — https://noomoagencies.com/
    Animation: Horizontal parallax layers, staggered reveals,
    3D transforms, magnetic hover interactions
    Techniques: CSS 3D, Intersection Observer, GSAP ScrollTrigger
    Why study: Sophisticated parallax without performance hitches

4.  Active Theory — https://active-theory.com/
    Animation: WebGL particle systems, WebGL distortion,
    shader-based transitions, scroll-mapped 3D scenes
    Techniques: Three.js, custom shaders, GSAP
    Why study: Pushing WebGL boundaries for interactive storytelling

5.  Merci Michel — https://merci-michel.com/
    Animation: SVG masking animations, path drawing,
    parallax depth, scroll-triggered reveals
    Techniques: SVG + CSS animation, GSAP ScrollTrigger
    Why study: Clean, purposeful animations that enhance UX

6.  Dogstudio — https://dogstudio.co/
    Animation: Typewriter effects, SVG path drawing,
    morphing shapes, parallax on scroll
    Techniques: GSAP, SplitText, SVG animation
    Why study: Bold, playful animations with perfect timing

7.  Hello Monday — https://hellomonday.com/
    Animation: Page transitions, micro-interactions,
    text animations, hover states
    Techniques: Framer Motion, CSS transitions, custom easing
    Why study: Production-quality animation in React ecosystem

8.  Build in Amsterdam — https://buildinamsterdam.com/
    Animation: Storytelling animations, progress indicators,
    SVG transitions, scroll-jacking
    Techniques: GSAP, ScrollMagic, SVG animation
    Why study: Narrative-driven animation that guides the user

9.  Monks — https://madebymonks.com/
    Animation: Loading sequences, interactive demos,
    canvas animations, WebGL effects
    Techniques: Canvas API, Three.js, GSAP
    Why study: Balancing complexity with loading performance

10. The First The Last — https://thefirstthelast.studio/
    Animation: Minimalist transitions, text reveal,
    scroll-linked progress, subtle micro-interactions
    Techniques: Framer Motion, CSS animations
    Why study: Less is more — meaningful animation everywhere
```

### Motion Studio Agencies to Follow

```
Design Studios Known for Motion Excellence:

  — Lusion (.co.jp)          — Experimental, blob morphing, organic motion
  — Active Theory (active-theory.com) — WebGL, shaders, 3D storytelling
  — Merci Michel (merci-michel.com)   — SVG, clean transitions, agency site
  — Dogstudio (dogstudio.co)          — Playful, typographic animation
  — Hello Monday (hellomonday.com)    — Digital agency motion mastery
  — Build in Amsterdam (buildinamsterdam.com) — Narrative-driven animation
  — The First The Last (thefirstthelast.studio) — Minimalist precision
  — Upland (upland.co)               — Interactive storytelling
  — Media.Monks (mediamonks.com)     — Production-scale motion
  — RESN (resn.com)                  — Bold, experimental interactions
  — UNIT9 (unit9.com)                — Creative technology pioneers
  — Your Majesty (yourmajesty.com)   — Brand-driven animation
```

### CodePen Animation Inspiration

```
Search CodePen for these terms to find cutting-edge examples:

  "GSAP scroll animation"    — ScrollTrigger techniques
  "Three.js carousel"        — 3D carousel implementations
  "CSS fluid animation"      — Pure CSS morphing
  "canvas particle system"   — Performance particle effects
  "SVG path animation"       — Vector animation techniques
  "Framer Motion gallery"    — React transition galleries
  "GreenSock timeline"       — Complex coordinated animations
```
