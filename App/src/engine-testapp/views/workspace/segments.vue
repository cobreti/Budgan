<template>
  <section class="segments" data-testid="segments-view">
    <h3 class="segments__title">{{ t('workspace.segments.title') }}</h3>
    <p class="segments__description">{{ t('workspace.segments.description') }}</p>
  </section>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()
</script>

<style scoped>
  @use 'colors-def';

  .segments {
    display: grid;
    gap: 0.75rem;
  }

  .segments__title,
  .segments__description {
    margin: 0;
  }

  .segments__description {
    color: var(--workspace-on-surface-variant);
  }
</style>
