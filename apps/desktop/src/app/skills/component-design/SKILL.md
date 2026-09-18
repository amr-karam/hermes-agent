---
name: component-design
description: Component design skill for UI libraries and design systems. Covers compound components, state management, accessibility patterns, variant authoring, token-based styling, component API design, and Figma-to-code workflows for React, Vue, and vanilla CSS.
---

# Component Design

## Component Philosophy

### What Makes a Good Component

1. **Single Responsibility** — Each component has one clear job
2. **Composition Over Configuration** — Build flexibility through composition, not endless props
3. **Accessibility First** — Every component is born accessible
4. **Themeable by Default** — Works in light mode, dark mode, and brand variants
5. **Self-Documenting** — The API tells you how to use it

### Component States

Every interactive component needs states:

```
Default → Hover → Focus → Active → Disabled → Loading → Error

Example Button:
  ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐    ┌──────────┐
  │ Button │    │ Button │    │ Button │    │ Button │    │ Disabled │
  └────────┘    └────┬───┘    └────┬───┘    └────┬───┘    └──────────┘
                    ↓              ↓              ↓
                 Hover          Focus          Active

Plus: Loading (spinner) and Error (red border)
```

## Component Architecture

### Compound Components

```jsx
// ✅ Good: composition over configuration
<Tabs>
  <Tabs.List>
    <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
    <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="profile">Profile content</Tabs.Content>
  <Tabs.Content value="settings">Settings content</Tabs.Content>
</Tabs>

// ❌ Bad: too many props
<Tabs
  triggers={["profile", "settings"]}
  content={{profile: "...", settings: "..."}}
  activeTab="profile"
  onTabChange={...}
  triggerVariant="rounded"
  triggerSize="md"
  contentPadding="lg"
/>
```

### Variant-Based Design

```jsx
// Use variants for consistent styling
<Button variant="primary" size="md">
  Click me
</Button>

// Internally maps to:
// variant: primary | secondary | outline | ghost | danger
// size: sm | md | lg | icon
// state: default | hover | focus | active | disabled | loading
```

### Token-Based Styling

```css
/* Design tokens → CSS variables → component variants */

/* Tokens */
--color-button-primary-bg: var(--color-brand-500);
--color-button-primary-hover: var(--color-brand-600);

/* Component styles */
.button--primary {
  background: var(--color-button-primary-bg);
  border: 1px solid var(--color-button-primary-bg);
}

.button--primary:hover {
  background: var(--color-button-primary-hover);
  border-color: var(--color-button-primary-hover);
}
```

## Core Components

### Button System

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-weight: 600;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    opacity 0.15s ease;
  gap: 0.5rem;

  outline-offset: 2px;
  outline: 2px solid transparent;
}

.btn:focus-visible {
  outline: 2px solid var(--color-focus);
}

/* Sizes */
.btn-sm { padding: 0.375rem 0.75rem; font-size: 0.875rem; }
.btn-md { padding: 0.625rem 1rem; font-size: 1rem; }
.btn-lg { padding: 0.875rem 1.5rem; font-size: 1.125rem; }

/* Variants */
.btn-primary {
  background: var(--color-brand-500);
  color: var(--color-on-brand);
}
.btn-primary:hover {
  background: var(--color-brand-600);
}
.btn-primary:active {
  transform: scale(0.98);
}

.btn-secondary {
  background: var(--color-neutral-100);
  color: var(--color-neutral-900);
  border: 1px solid var(--color-neutral-300);
}

.btn-outline {
  background: transparent;
  color: var(--color-brand-500);
  border: 1px solid var(--color-brand-500);
}

.btn-ghost {
  background: transparent;
  color: var(--color-neutral-700);
}
.btn-ghost:hover {
  background: var(--color-neutral-100);
}

/* States */
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-loading {
  pointer-events: none;
}
```

### Form Inputs

```css
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* Required asterisk */
.form-label[required]::after {
  content: " *";
  color: var(--color-state-error);
}

.form-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--color-border-input);
  border-radius: 0.375rem;
  font-family: inherit;
  font-size: 1rem;
  background: var(--color-input-bg);
  color: var(--color-text-primary);
  transition: border-color 0.15s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-brand-500);
  box-shadow: 0 0 0 2px var(--color-brand-200);
}

.form-input:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

/* Error state */
.form-input.error {
  border-color: var(--color-state-error);
}

.form-input.error:focus {
  box-shadow: 0 0 0 2px var(--color-state-error-200);
}

.form-helper {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.form-error {
  font-size: 0.75rem;
  color: var(--color-state-error);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
```

### Navigation Components

```css
/* Breadcrumbs */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: "/";
  color: var(--color-text-tertiary);
  margin-right: 0.5rem;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.tab-trigger {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  font-weight: 500;
  transition: border-color 0.15s ease;
}

.tab-trigger.active {
  border-color: var(--color-brand-500);
  color: var(--color-brand-600);
}

.tab-trigger:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

/* Accordion */
.accordion-item + .accordion-item {
  margin-top: 0.5rem;
  border-top: 1px solid var(--color-border);
}

.accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.accordion-trigger {
  width: 100%;
  padding: 1rem;
  text-align: left;
  background: var(--color-surface);
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.accordion-trigger[aria-expanded="true"] .accordion-icon {
  transform: rotate(180deg);
}

.accordion-content {
  overflow: hidden;
  height: 0;
  transition: height 0.2s ease-out;
}

.accordion-content[aria-hidden="false"] {
  height: auto;
}
```

### Cards

```css
.card {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  box-shadow: var(--color-shadow);
  overflow: hidden;
}

.card-header {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
}

.card-body {
  flex: 1;
  padding: 1rem;
}

.card-footer {
  padding: 1rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* Interactive card */
.card:hover {
  box-shadow: var(--color-shadow-hover);
  transform: translateY(-2px);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
```

### Modal Dialogs

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.modal {
  background: var(--color-surface);
  border-radius: 0.75rem;
  max-width: 32rem;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* Prevent body scroll when modal is open */
body.modal-open {
  overflow: hidden;
}
```

## Accessibility Patterns

### ARIA for Components

```html
<!-- Tab panel pattern -->
<div role="tablist" aria-label="Tabs">
  <button role="tab" aria-selected="true" aria-controls="panel-1">Tab 1</button>
  <button role="tab" aria-selected="false" aria-controls="panel-2">Tab 2</button>
</div>
<div id="panel-1" role="tabpanel" aria-labelledby="tab-1">Content</div>
<div id="panel-2" role="tabpanel" hidden aria-labelledby="tab-2">Content</div>

<!-- Accordion pattern -->
<div class="accordion">
  <h3>
    <button
      aria-expanded="false"
      aria-controls="accordion-content-1"
      id="accordion-trigger-1">
      Section 1
    </button>
  </h3>
  <div
    id="accordion-content-1"
    role="region"
    aria-labelledby="accordion-trigger-1"
    hidden>
    Content here
  </div>
</div>
```

### Focus Trapping

```css
/* Modal focus trap */
.modal-overlay {
  focus-trap: modal;
}

/* Custom focus trap implementation */
.js-focus-trap {
  position: fixed;
  inset: 0;
  z-index: -1;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
```

## Component API Design

### Naming Conventions

```
Components: PascalCase
  Button, Card, TextInput, ModalDialog

Props/Attributes: camelCase
  onClick, isLoading, variant

CSS Classes: kebab-case
  .btn-primary, .form-input, .card-header

CSS Variables: kebab-case with prefix
  --btn-primary-bg, --form-input-border
```

### Component Variants

```jsx
// React component with variant system
const Button = ({
  variant = 'primary',  // primary, secondary, outline, ghost, danger
  size = 'md',          // sm, md, lg, icon
  loading = false,
  disabled = false,
  iconAfter = null,
  iconBefore = null,
  children,
  ...props
}) => {
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
  }

  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
    icon: 'btn-icon',
  }

  return (
    <button
      className={`btn ${variantClasses[variant]} ${sizeClasses[size]}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && iconBefore && iconBefore}
      {loading ? <Spinner /> : iconBefore}
      {children}
      {loading ? null : iconAfter}
    </button>
  )
}
```

## Design Token Integration

### Token Mapping

```css
:root {
  /* Brand tokens */
  --color-brand-950: #312e81;
  --color-brand-900: #3730a3;
  --color-brand-700: #4338ca;
  --color-brand-500: #6366f1;
  --color-brand-300: #a5b4fc;
  --color-brand-50:  #eef2ff;

  /* Semantic tokens */
  --color-button-primary-bg: var(--color-brand-500);
  --color-button-primary-hover: var(--color-brand-600);
  --color-button-primary-text: var(--color-neutral-50);

  /* Component tokens */
  --color-button-primary-border: var(--color-button-primary-bg);
  --color-button-primary-focus-ring: var(--color-brand-200);
  --color-button-primary-active-bg: var(--color-brand-700);
}
```

### Dark Mode

```css
button[data-theme="dark"] .btn {
  --color-button-primary-bg: var(--color-brand-400);
  --color-button-primary-hover: var(--color-brand-300);
  --color-button-primary-text: var(--color-neutral-900);
}
```

## Component Testing

### Accessibility Testing

```jsx
// Jest + React Testing Library
test('button has accessible name', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
})

// Focus management
test('modal traps focus', () => {
  render(<Modal />, { container: document.body })
  expect(document.activeElement).toBe(screen.getByRole('button', { name: /close/i }))
})
```

### Visual Testing

```jsx
// Storybook stories for component library
export const Primary = {
  args: {
    variant: 'primary',
    children: 'Primary Button'
  }
}

export const Loading = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Loading...'
  }
}
```

## Tools & Resources

- **Storybook** — `https://storybook.js.org/` (component development environment)
- **Figma to Code** — `https://www.figma.com/developers`
- **Radix UI** — `https://www.radix-ui.com/` (accessible component primitives)
- **Headless UI** — `https://headlessui.com/` (unstyled accessible components)
- **shadcn/ui** — `https://ui.shadcn.com/` (copy-paste React components)
- **Tailwind UI** — `https://tailwindui.com/` (official Tailwind components)
- **Component Kitchen Sink** — `https://ui.neobanana.org/`
