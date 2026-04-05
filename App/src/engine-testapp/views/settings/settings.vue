<template>
  <section class="settings-view" data-testid="settings-view">
    <h2 class="settings-view__title">{{ t('settings.title') }}</h2>
    <p class="settings-view__description">{{ t('settings.description') }}</p>
  </section>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()
</script>

<style scoped>
  @use 'colors-def';

  .settings-view {
    display: grid;
    gap: 0.75rem;
    max-width: 72rem;
  }

  .settings-view__title {
    margin: 0;
    color: var(--workspace-on-surface);
  }

  .settings-view__description {
    margin: 0;
    color: var(--workspace-on-surface-variant);
  }
</style>

