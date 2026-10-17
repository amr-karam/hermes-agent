# Web Design Layouts & Landing Pages

Professional web design showcases modern responsive layouts, component systems, and interactive landing page patterns for portfolio presentation.

## Layout System

### Grid System

```css
/* Responsive grid */
.grid-2 { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
.grid-3 { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
.grid-4 { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Section spacing */
.section { padding: 6rem 0; }
.section-compact { padding: 4rem 0; }
.section-hero { min-height: 90vh; display: flex; align-items: center; padding: 8rem 0; }
```

## Landing Page Template

### Hero Section

```html
<section class="hero-section" aria-label="Portfolio introduction">
  <div class="container">
    <div class="hero-grid">
      <div class="hero-text">
        <span class="badge">Portfolio 2026</span>
        <h1 class="display-2xl">Jane Doe</h1>
        <p class="hero-subtitle">Senior Product Designer creating sustainable, human-centered digital experiences.</p>
        <div class="hero-actions">
          <a href="#work" class="btn btn-primary">Explore Work</a>
          <a href="#about" class="btn btn-secondary">About Me</a>
        </div>
      </div>
      <div class="hero-visual">
        <div class="visual-card">
          <div class="visual-icon">🎨</div>
          <h3 class="visual-title">Creative Direction</h3>
          <p class="visual-desc">Brand strategy, visual identity, and design systems</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

### Work Showcase Section

```html
<section id="work" class="portfolio-section" aria-label="Selected projects">
  <div class="container">
    <div class="section-header">
      <h2>Selected Work</h2>
      <p>Case studies from UX, UI, and brand design projects</p>
    </div>
    
    <div class="grid grid-2">
      <article class="case-study-card">
        <div class="card-image" role="img" aria-label="EcoFlow App interface preview">
          <img src="work-eco-flow.jpg" alt="EcoFlow mobile app design" loading="lazy">
        </div>
        <div class="card-body">
          <h3>EcoFlow App</h3>
          <p>Mobile app redesign for eco-conscious users. Brand identity, UX, UI design.</p>
          <div class="card-tags">
            <span class="tag">UX</span>
            <span class="tag">UI</span>
            <span class="tag">Brand</span>
          </div>
        </div>
      </article>
      
      <article class="case-study-card">
        <div class="card-image" role="img" aria-label="Dashboard analytics preview">
          <img src="work-dashboard.jpg" alt="Enterprise dashboard design" loading="lazy">
        </div>
        <div class="card-body">
          <h3>Analytics Dashboard</h3>
          <p>Enterprise data visualization platform. Design system and interaction design.</p>
          <div class="card-tags">
            <span class="tag">UI</span>
            <span class="tag">Design System</span>
          </div>
        </div>
      </article>
    </div>
  </div>
</section>
```

### Services / Capabilities Section

```html
<section id="capabilities" class="portfolio-section alt" aria-label="Services">
  <div class="container">
    <div class="section-header">
      <h2>Capabilities</h2>
      <p>What I bring to design projects</p>
    </div>
    
    <div class="grid grid-3">
      <article class="capability-card">
        <h3>UX Research & Strategy</h3>
        <p>User interviews, journey mapping, wireframing, and information architecture.</p>
      </article>
      <article class="capability-card">
        <h3>UI Design & Prototyping</h3>
        <p>Responsive interfaces, interactive prototypes, component libraries.</p>
      </article>
      <article class="capability-card">
        <h3>Brand Identity</h3>
        <p>Logo design, color systems, typography, and visual language.</p>
      </article>
    </div>
  </div>
</section>
```

### About Section

```html
<section id="about" class="portfolio-section" aria-label="About the designer">
  <div class="container">
    <div class="two-column">
      <div>
        <img src="photo-portrait.jpg" alt="Jane Doe, Senior Product Designer" style="border-radius: 1rem; max-width: 400px;">
      </div>
      <div>
        <h2>About</h2>
        <h3>Creating meaningful digital experiences</h3>
        <p>I'm Jane Doe, a senior product designer with 8+ years of experience in UX, UI, and brand design. I believe design should be both beautiful and functional — solving real problems while creating emotional connections.</p>
        <p>Based in San Francisco, I work with startups and enterprise clients on product design, design systems, and brand strategy.</p>
        <a href="#contact" class="btn btn-primary">Get in Touch</a>
      </div>
    </div>
  </div>
</section>
```

## Component Library Patterns

### Button Component

```html
<button class="btn btn-primary" type="button">Primary Action</button>
<button class="btn btn-secondary" type="button">Secondary Action</button>
<button class="btn btn-outline" type="button">Outline Action</button>

<style>
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  text-decoration: none;
}
.btn-primary { background: #0f172a; color: #fff; }
.btn-primary:hover { background: #1e293b; transform: translateY(-2px); }
.btn-secondary { background: #f8fafc; color: #0f172a; border: 1px solid #e2e8f0; }
.btn-secondary:hover { background: #f1f5f9; }
</style>
```

### Card Component

```html
<article class="portfolio-card" aria-label="Project card">
  <div class="card-image" role="img" aria-label="Project preview">
    <img src="project.jpg" alt="Project preview" loading="lazy">
  </div>
  <div class="card-body">
    <h3>Project Title</h3>
    <p>Project description</p>
    <div class="tags">
      <span class="tag">Category</span>
    </div>
  </div>
</article>
```

### Testimonial / Quote Component

```html
<blockquote class="testimonial" aria-label="Client testimonial">
  <p>"Jane's attention to detail and strategic thinking transformed our product. She's a rare combination of creative vision and executional excellence."</p>
  <footer>
    <cite>— Sarah Mitchell, VP Design at EcoTech</cite>
  </footer>
</blockquote>

<style>
.testimonial {
  padding: 2rem 2.5rem;
  background: var(--color-bg-tertiary);
  border-left: 4px solid var(--color-accent-500);
  border-radius: 0 0.5rem 0.5rem 0;
  font-size: 1.125rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
}
.testimonial p { font-style: italic; }
.testimonial footer { margin-top: 1rem; font-size: 0.875rem; color: var(--color-text-tertiary); }
</style>
```

## Responsive Design Patterns

### Mobile-First Approach

```css
/* Base styles (mobile) */
.container { padding: 1rem; }
.hero-title { font-size: 2.5rem; }
.grid { grid-template-columns: 1fr; }

/* Tablet (768px+) */
@media (min-width: 768px) {
  .container { padding: 1.5rem; }
  .hero-title { font-size: 3rem; }
  .grid-2 { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .container { max-width: 1200px; margin: 0 auto; }
  .hero-title { font-size: 3.75rem; }
  .grid-3 { grid-template-columns: repeat(3, 1fr); }
  .two-column { grid-template-columns: 1fr 1fr; gap: 4rem; }
}
```

---

*Web design patterns reference ui-ux-pro-max design-system recommendations for responsive layout, typography, and accessibility compliance.*
