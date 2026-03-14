
const themeVariables = {
  onSurfaceVariantColor: 'rgba(var(--v-theme-on-surface-variant))',
  primaryDarken1: 'rgba(var(--v-theme-primary-darken-1))',
  secondaryDarken1: 'rgba(var(--v-theme-secondary-darken-1))',
  onPrimaryDarken1: 'rgba(var(--v-theme-on-primary-darken-1))',
  borderColor: 'rgba(var(--v-border-color))',
}

export function useThemeColors() {
  return {
    surfaceVariant: themeVariables.onSurfaceVariantColor,
    separator: themeVariables.borderColor
  }
}

