---
name: design-portfolio-automation
description: "Generate professional design portfolios for frontend/designer projects. Creates autonomous, portfolio-ready design sections including graphic design, UX/UI, motion design, 3D visualization, web design, and storytelling."
argument-hint: "[project-name] [client] [theme]"
license: MIT
tags:
  - design
  - portfolio
  - ux-ui
  - branding
  - web-design
  - motion-design
  - 3d-design
category: creative
---

# Design Portfolio Automation

Generate professional, autonomous design portfolios for frontend/developer projects. This skill creates a complete, standalone design showcase integrating typography, branding, wireframes, animations, 3D visuals, web layouts, and story content.

## When to Use

- Creating client presentation portfolios
- Showcasing frontend project work
- Branding and identity design systems
- UX/UI case studies with wireframes
- Motion design animation reels
- 3D product/model visualizations
- Web design landing pages
- Narrative storytelling for design projects

## Quick Start

```bash
# Generate complete portfolio
python scripts/portfolio/generate.py --project "EcoFlow App" --client "GreenTech Solutions" --theme "minimalist-sustainable"

# Generate specific section
python scripts/portfolio/generate.py --section ui-wireframes --project "Dashboard Redesign"

# Generate motion design section
python scripts/portfolio/generate.py --section motion-design --project "Onboarding Animation"
```

## Portfolio Structure

```
portfolio-automation/
├── SKILL.md                    # This file
├── templates/
│   ├── main-layout.html        # Base HTML template
│   ├── section-hero.html       # Hero section template
│   ├── case-study.html         # Case study template
│   ├── portfolio-grid.html     # Grid layout template
│   └── section-wireframe.html  # Wireframe template
├── sections/
│   ├── 01-branding.md          # Branding guidelines
│   ├── 02-typography.md        # Typography system
│   ├── 03-ux-wireframes.md     # Wireframes & mockups
│   ├── 04-motion-design.md     # Motion/animation concepts
│   ├── 05-3d-visualization.md  # 3D visual examples
│   ├── 06-web-layouts.md       # Web design layouts
│   └── 07-story-narrative.md   # Storytelling elements
├── assets/
│   ├── design-tokens.json      # Design system tokens
│   ├── color-palette.css       # CSS color variables
│   └── typography.css          # Typography utilities
└── scripts/
    └── portfolio/
        └── generate.py          # Portfolio generation script
```

## Core Features

### 1. Typography System
- Professional font pairings (heading/body/monospace)
- Responsive type scale
- Line height and spacing utilities
- Font loading optimization

### 2. Branding Guidelines
- Logo design specifications
- Color palette with semantic tokens
- Spacing and elevation systems
- Iconography guidelines

### 3. UI/UX Wireframes
- HTML wireframe templates
- Interactive prototype snippets
- Accessibility considerations
- Responsive breakpoints

### 4. Motion Design
- Animation timing and easing
- GSAP animation presets
- Loading states and micro-interactions
- Reduced motion accessibility

### 5. 3D Visualization
- Three.js integration examples
- WebGL product showcases
- Model loading and optimization
- Responsive 3D layouts

### 6. Web Design Layouts
- Modern landing page templates
- Component library showcase
- Dark/light mode variants
- Mobile-first responsive design

### 7. Storytelling Framework
- Narrative structure for case studies
- Problem/solution storytelling
- Impact and metrics presentation
- Client testimonial formats

## Integration with Hermes Workflows

This skill integrates with:
- `ui-ux-pro-max` for design system recommendations
- `design` skill for logo and brand identity
- `hyperframes` for 3D animations
- Agent orchestration for multi-agent portfolio reviews

## Usage Examples

### Generate Full Portfolio
```bash
python scripts/portfolio/generate.py \
  --project "FinTech Dashboard" \
  --client "FinLedger Inc." \
  --theme "modern-financial" \
  --output ./portfolio/
```

### Generate Specific Section
```bash
python scripts/portfolio/generate.py \
  --section wireframes \
  --project "E-commerce App" \
  --include-mobile
```

### Generate Motion Design Reel
```bash
python scripts/portfolio/generate.py \
  --section motion \
  --project "User Onboarding" \
  --gsap-presets
```

## Output Formats

- HTML5 with embedded CSS
- Markdown with frontmatter
- Interactive JSFiddle/CodePen embeds
- PDF export templates
- Image gallery grids

## Automation Features

- Self-contained portfolio (no external dependencies)
- Responsive design out of the box
- Accessibility compliant (WCAG 2.1)
- SEO-optimized HTML structure
- Dark/light mode toggle
- Copy-paste friendly CSS variables

## References

| Topic | File |
|-------|------|
| Portfolio Generator | `scripts/portfolio/generate.py` |
| Base Template | `templates/main-layout.html` |
| Design Tokens | `assets/design-tokens.json` |
| Typography System | `assets/typography.css` |
| Wireframe Section | `sections/03-ux-wireframes.md` |

## Setup

No additional setup required. Uses standard Python 3.x (built-in libraries only).

```bash
# Verify Python
python --version || python3 --version
```

## Contributing

When extending this portfolio, follow the established patterns:
1. Use semantic CSS variables
2. Maintain accessibility standards
3. Keep portfolios self-contained
4. Follow the typography scale
5. Use the spacing system consistently