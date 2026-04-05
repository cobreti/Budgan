<template>
  <section class="settings-column-mappings" data-testid="settings-column-mappings-view">
    <h3 class="settings-column-mappings__title">{{ t('settings.columnMappings.title') }}</h3>
    <p class="settings-column-mappings__description">{{ t('settings.columnMappings.description') }}</p>
  </section>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()
</script>

<style scoped>
  @use 'colors-def';

  .settings-column-mappings {
    display: grid;
    gap: 0.75rem;
  }

  .settings-column-mappings__title,
  .settings-column-mappings__description {
    margin: 0;
  }

  .settings-column-mappings__description {
    color: var(--workspace-on-surface-variant);
  }
</style>

