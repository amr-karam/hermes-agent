# UX/UI Wireframes & Mockups

This section provides professional wireframe templates, interactive mockup examples, and accessibility-compliant interface patterns for portfolio presentations.

## Wireframe Design Philosophy

Wireframes communicate structure and information architecture without visual noise. They should:
- Show information hierarchy clearly
- Identify key interaction points
- Demonstrate responsive behavior
- Maintain accessibility-first design

## Wireframe Template Types

### Type A: Landing Page Wireframe

```
+----------------------------------+
|          [Logo]        [Nav]     | <- Header (fixed, 60px)
+----------------------------------+
|                                  |
|  [Hero Headline]         [Hero   | <- Hero Section (min 80vh)
|   Subtitle Text]         Image]  |
|                                  |
+----------------------------------+
| [Features: 3-col grid]           | <- Features Section
| [Card] [Card] [Card]             |
+----------------------------------+
| [Project Showcase: 2-col]        | <- Portfolio Section
| [Project 1] [Project 2]         |
+----------------------------------+
| [About / Bio: 2-col]            | <- About Section
| [Image] [Text]                  |
+----------------------------------+
|         [Footer: 4-col]          | <- Footer (3 sections)
+----------------------------------+
```

### Type B: Product Dashboard Wireframe

```
+----------------------------------+
| [Sidebar: 4 nav items] [Header]  | <- Layout with sidebar
+----------------------------------+
|                                  |
|  [KPI Cards: 4-col]              | <- Metrics Overview
|  [KPI] [KPI] [KPI] [KPI]        |
|                                  |
|  [Data Table: full-width]        | <- Data Table (sortable)
|  [Col1] [Col2] [Col3] ...        |
|                                  |
+----------------------------------+
```

### Type C: Mobile App Wireframe

```
+------------------+
| [Status Bar]     | <- iOS Status Bar (44px)
+------------------+
| [Header: Title]  | <- Header (56px, sticky)
+------------------+
|                  |
| [Hero Image]     | <- Hero (200-300px)
| [Headline]       |
| [Subheadline]    |
|                  |
+------------------+
| [Content: List]  | <- Scrolling content
| [Card 1]         |
| [Card 2]         |
+------------------+
| [Bottom Nav: 5]  | <- Tab Bar (49px, fixed)
+------------------+
```

## Mockup Examples

### Example 1: Portfolio Website Mockup (Desktop)

```html
<!-- Main Container -->
<main class="portfolio-container">
  
  <!-- Hero Section -->
  <section class="hero" aria-label="Portfolio introduction">
    <h1 class="display-2xl">Jane Doe</h1>
    <p class="body-xl">Senior Product Designer · UX/UI · Brand</p>
    <a href="#work" class="btn btn-primary">View Selected Work</a>
  </section>
  
  <!-- Work Section -->
  <section class="work" aria-label="Portfolio projects">
    <h2>Selected Work</h2>
    <div class="grid grid-2">
      <article class="project-card">
        <img src="preview-1.jpg" alt="EcoFlow App Redesign - mobile interface" loading="lazy">
        <h3>EcoFlow App</h3>
        <p>Mobile app redesign for sustainable living</p>
      </article>
      <article class="project-card">
        <img src="preview-2.jpg" alt="Dashboard Analytics Platform" loading="lazy">
        <h3>Analytics Platform</h3>
        <p>Enterprise dashboard with data visualization</p>
      </article>
    </div>
  </section>
  
</main>
```

### Example 2: Wireframe Component Pattern

```html
<!-- Card Component -->
<div class="card" role="region" aria-label="Project Card: EcoFlow App">
  <div class="card-media" aria-hidden="true">
    <img src="project-preview.jpg" alt="" loading="lazy"/>
  </div>
  <div class="card-body">
    <h3>EcoFlow App</h3>
    <p>Mobile app for eco-conscious users</p>
    <div class="card-meta">
      <span>UX Design</span>
      <span>UI Design</span>
      <span>Brand</span>
    </div>
  </div>
</div>
```

## Accessibility Considerations for Wireframes

| Element | Requirement | Implementation |
|--------|-------------|----------------|
| Navigation | Skip links | `<a href="#main">Skip to content</a>` |
| Images | Alt text | Descriptive alt, decorative empty |
| Headings | Hierarchy | H1 > H2 > H3, sequential |
| Forms | Labels | Visible, associated via `for` |
| Color | Contrast | 4.5:1 minimum for text |
| Focus | Visibility | Visible focus ring, 2px+ |
| Touch | Size | Min 44px targets |

## Implementation Template

```css
/* Wireframe container */
.wireframe-container {
  background: #0f172a;
  color: #f8fafc;
  border-radius: 1rem;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

/* Header */
.wireframe-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #1e293b;
  border-bottom: 1px solid #334159;
}

/* Content area */
.wireframe-content {
  padding: 2rem;
  min-height: 500px;
  background: #020617;
}

/* Component blocks */
.wireframe-block {
  background: rgba(255,255,255,0.05);
  border: 1px dashed rgba(255,255,255,0.15);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

/* Component label */
.block-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}
```

## Wireframe Tools Reference

| Tool | Best For | Integration |
|------|----------|-------------|
| Figma / FigJam | Collaborative wireframes | Export to HTML/Markdown |
| Whimsical | Quick low-fidelity | Screenshot to portfolio |
| Balsamiq | Structured wireframes | CSV/JSON export |
| Miro / Mural | Team collaboration | Embed in portfolio |

---

*This section references the UI/UX Pro Max skill (design-system, prototype patterns) and the Design Portfolio Automation template.*
