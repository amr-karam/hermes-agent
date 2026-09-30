import { useEffect } from 'react'

import { useTheme } from '@/themes/context'

/**
 * Carbon Theme Provider
 *
 * Maps Hermes theme tokens to Carbon Design System CSS custom properties.
 * Carbon uses a specific set of CSS variables for theming that we map from our
 * theme system. This provider runs on the client and updates the document's
 * root element with the appropriate Carbon CSS variables based on the current
 * Hermes theme.
 */
export function CarbonThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, themeName, renderedMode } = useTheme()

  useEffect(() => {
    const root = document.documentElement
    const colors = theme.colors

    const carbonVars: Record<string, string> = {
      '--cds-color-background': colors.background || '#ffffff',
      '--cds-color-background-inverse': colors.foreground || '#161616',
      '--cds-color-text-primary': colors.foreground || '#161616',
      '--cds-color-text-secondary': colors.mutedForeground || '#525252',
      '--cds-color-text-inverse': colors.primaryForeground || '#ffffff',
      '--cds-color-text-placeholder': colors.mutedForeground || '#8d8d8d',
      '--cds-color-text-on-color': colors.primaryForeground || '#ffffff',
      '--cds-color-text-on-color-inverse': colors.background || '#161616',
      '--cds-color-border-subtle': colors.muted || '#e0e0e0',
      '--cds-color-border-strong': colors.border || '#161616',
      '--cds-color-border-inverse': colors.background || '#ffffff',
      '--cds-color-border-interactive': colors.ring || '#0f62fe',
      '--cds-color-interactive': colors.primary || '#0f62fe',
      '--cds-color-interactive-hover': colors.primary || '#0043ce',
      '--cds-color-interactive-active': colors.primary || '#002d9c',
      '--cds-color-interactive-selected': colors.secondary || '#c6d9ff',
      '--cds-color-interactive-selected-hover': colors.secondary || '#a8c7ff',
      '--cds-color-focus': colors.ring || '#0f62fe',
      '--cds-color-focus-inverse': colors.primaryForeground || '#ffffff',
      '--cds-color-support-error': colors.destructive || '#da1e28',
      '--cds-color-support-success': '#198038',
      '--cds-color-support-warning': '#f1c21b',
      '--cds-color-support-info': colors.primary || '#0f62fe',
      '--cds-color-container': colors.card || '#f4f4f4',
      '--cds-color-container-hover': colors.muted || '#e0e0e0',
      '--cds-color-container-active': colors.muted || '#d1d1d1',
      '--cds-color-container-selected': colors.secondary || '#c6d9ff',
      '--cds-color-container-selected-hover': colors.secondary || '#a8c7ff',
      '--cds-color-container-inverse': colors.popover || '#2d2d2d',
      '--cds-color-overlay': 'rgba(0, 0, 0, 0.4)',
      '--cds-color-overlay-inverse': 'rgba(255, 255, 255, 0.1)',
      '--cds-shadow-1': '0 1px 2px rgba(0, 0, 0, 0.05)',
      '--cds-shadow-2': '0 2px 4px rgba(0, 0, 0, 0.1)',
      '--cds-shadow-3': '0 4px 8px rgba(0, 0, 0, 0.15)',
      '--cds-shadow-4': '0 8px 16px rgba(0, 0, 0, 0.2)',
      '--cds-spacing-xs': '4px',
      '--cds-spacing-sm': '8px',
      '--cds-spacing-md': '16px',
      '--cds-spacing-lg': '24px',
      '--cds-spacing-xl': '32px',
      '--cds-radius-sm': '4px',
      '--cds-radius-md': '8px',
      '--cds-radius-lg': '12px',
      '--cds-radius-xl': '16px',
      '--cds-font-family':
        theme.typography?.fontSans || '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      '--cds-font-family-mono': theme.typography?.fontMono || '"IBM Plex Mono", "SF Mono", "Fira Code", monospace',
      '--cds-font-size-xs': '12px',
      '--cds-font-size-sm': '14px',
      '--cds-font-size-md': '16px',
      '--cds-font-size-lg': '20px',
      '--cds-font-size-xl': '24px',
      '--cds-font-size-2xl': '32px',
      '--cds-font-weight-normal': '400',
      '--cds-font-weight-medium': '500',
      '--cds-font-weight-semibold': '600',
      '--cds-font-weight-bold': '700',
      '--cds-line-height': '1.5'
    }

    Object.entries(carbonVars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
    root.setAttribute('data-carbon-theme', renderedMode === 'dark' ? 'dark' : 'light')

    return () => {
      Object.keys(carbonVars).forEach(key => {
        root.style.removeProperty(key)
      })
      root.removeAttribute('data-carbon-theme')
    }
  }, [theme, themeName, renderedMode])

  return <>{children}</>
}
