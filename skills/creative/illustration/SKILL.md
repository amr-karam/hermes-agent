---
name: illustration
description: Illustration design covering SVG techniques.
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [design, illustration, visual, character, pattern, svg]
    related_skills: [design-md, popular-web-designs]
    category: creative
---

# Illustration Skill

Illustration design skill covering SVG illustration techniques, brand illustration systems, character design basics, pattern creation, hand-drawn vs. vector styles, illustration in web design, and creating cohesive visual narratives.

## When to Use

- User asks for illustration style selection or creation
- User needs character design guidance
- User wants pattern design or seamless patterns
- User has SVG illustration optimization questions
- User needs consistency across illustrations

## Prerequisites

- SVG knowledge or illustration tool proficiency
- Understanding of design tokens (colors, typography from design-md)
- Terminal access for optimization tooling (SVGO)

## How to Run

```bash
# Reference design tokens from design-md
hermes skills content design-md

# Use svgomg for optimization
# https://jakearchibald.github.io/svgomg/

# For on-brand consistency, reference the DESIGN.md tokens
```

## Quick Reference

- **Style types:** Flat, Line art, Glyph, Hand-drawn, 3D Isometric, Low-poly
- **Character grid:** 8-head grid system
- **Color limit:** 4–6 colors per illustration for consistency
- **Perspective:** Single viewpoint across entire set (front, 3/4, side)

## Procedure

1. **Define illustration style** — Choose from flat, line art, glyph, hand-drawn, 3D isometric, or low-poly based on brand
2. **Establish character anatomy** — Use 8-head grid, define proportions, exaggeration points
3. **Build expression library** — Create 6 core expressions at consistent complexity
4. **Develop palette** — Limit to 4–6 colors using design tokens
5. **Create scene composition** — Consider layering, lighting direction, depth cues
6. **Optimize for web** — Remove hidden layers, simplify paths, round coordinates, use CSS variables
7. **Build pattern system** — Ensure seamless tiling, consistent spacing, organic variation
8. **Document style guide** — Include color swatches, stroke weights, spacing rules

## Pitfalls

- **Complex details at small sizes** — What works large may break at 16×16
- **Inconsistent perspective** — All characters must use the same viewpoint
- **Color palette overload** — Too many colors breaks consistency
- **Performance issues** — Large illustrations impact page load
- **Missing fallbacks** — Provide PNG alternatives for older browsers

## Verification

- All characters use same eye size/style relative to head
- Palette consistent across entire illustration set
- Perspective view (front, 3/4, side) consistent throughout
- Views work at intended display sizes (web, mobile, print)
- SVG optimized: ≤200 bytes (20×20), ≤300 bytes (24×24 simple)
- Color variables match DESIGN.md tokens
- Pattern tiles seamlessly at all sizes