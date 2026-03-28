<template>
  <section class="workspace-column-mapping-page">
    <p
      v-if="workspaceStore.appliedMapping"
      class="workspace-column-mapping-page__success"
      data-testid="workspace-mapping-applied-message"
    >
      Mapping is applied.
    </p>

    <CsvColumnMapping v-if="workspaceStore.parsedJson" />
    <p v-else class="workspace-column-mapping-page__hint">
      Select a CSV file to configure mapping.
    </p>
  </section>
</template>

<script setup lang="ts">
  import CsvColumnMapping from '../../components/csv-column-mapping/csv-column-mapping.vue'
  import { useWorkspaceStore } from '../../stores/workspace-store'

  const workspaceStore = useWorkspaceStore()
</script>

<style scoped>
  @use 'colors-def';

  .workspace-column-mapping-page {
    display: grid;
    gap: 0.75rem;
  }

  .workspace-column-mapping-page__success {
    margin: 0;
    padding: 0.625rem 0.75rem;
    border: 1px solid var(--column-mapping-success-border);
    border-radius: 0.625rem;
    background-color: var(--column-mapping-success-background);
    color: var(--column-mapping-success-text);
    font-weight: 600;
  }

  .workspace-column-mapping-page__hint {
    margin: 0;
    color: var(--column-mapping-hint-text);
  }
</style>
