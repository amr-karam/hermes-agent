---
name: icon-design
description: Icon design covering SVG best practices.
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [design, icon, svg, ui, accessibility, component]
    related_skills: [popular-web-designs, design-md]
    category: creative
---

# Icon Design Skill

Icon design skill covering SVG best practices, icon grid systems, visual weight and consistency, icon families, sizing standards, accessibility for icons, and building cohesive icon libraries.

## When to Use

- User asks for SVG icon creation or optimization tips
- User needs icon grid system guidance (24×24 standard)
- User has accessibility concerns with icons
- User wants to build or audit an icon library
- User needs sizing standards for different contexts

## Prerequisites

- Basic SVG knowledge (path data, viewBox)
- Terminal access for optimization tooling
- Design tool (Figma, Illustrator, or SVG editor)

## How to Run

```bash
# Access design-md for design token schemas
hermes skills content design-md

# Use svgomg for optimization (external tool)
# https://jakearchibald.github.io/svgomg/

# For React components, see design system patterns
```

## Quick Reference

- **Grid:** 24×24 industry standard (Figma, Material, SF Symbols)
- **Stroke:** ~6-7% of icon size (1.5px at 24×24)
- **Optimization:** ≤300 bytes (simple) / ≤500 bytes (complex) at 24×24
- **Accessibility:** `aria-hidden="true"` for decorative, `aria-label` for interactive

## Procedure

1. **Define icon requirements** — List icons needed, context (toolbar, nav, button), size constraints
2. **Establish visual language** — Stroke weight, corner radius, perspective, detail level
3. **Design on grid** — Use 24×24 grid for standard icons, 20×20 for compact, 16×16 minimum
4. **Apply optical corrections** — Align by eye, not just mathematically
5. **Create SVG markup** — Use `currentColor` for fill/stroke, clean paths, remove metadata
6. **Optimize** — Round to 2 decimal places, remove unnecessary points, compress with SVGO
7. **Test accessibility** — Ensure contrast, distinguishable at 16×16
8. **Document** — Add to sprite, update library documentation

## Pitfalls

- **Math alignment ≠ optical alignment** — Circles centered mathematically may look off
- **Path too complex at small sizes** — Details disappear at 16×16
- **Forgetting to theme** — Use `currentColor` so icons inherit from CSS
- **Inconsistent families** — Stroke weight varies across icons in the same set
- **Accessibility missed** — Interactive icons need `aria-label`, decorative need `aria-hidden`

## Verification

- All icons align to their respective grids
- Visual weight consistent across the set
- File sizes under threshold (simple ≤100 bytes at 12×12, ≤500 bytes at 24×24)
- Accessible via screen reader (or properly hidden if decorative)
- Works on light and dark backgrounds
- Sprite includes all variants (outline, fill, duotone)