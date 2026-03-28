<template>
  <section class="workspace-column-mapping-page">
    <div
      class="workspace-column-mapping-page__status"
      :class="{
        'workspace-column-mapping-page__status--applied': workspaceStore.appliedMapping,
        'workspace-column-mapping-page__status--empty': !workspaceStore.appliedMapping
      }"
      data-testid="workspace-mapping-status"
    >
      <p class="workspace-column-mapping-page__status-text">
        {{
          workspaceStore.appliedMapping
            ? 'Mapping is applied.'
            : 'Select a CSV file to configure mapping.'
        }}
      </p>
    </div>

    <CsvColumnMapping v-if="workspaceStore.parsedJson" />
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

  .workspace-column-mapping-page__status {
    padding: 1rem;
    border-radius: 0.75rem;
    border: 1px solid;
  }

  .workspace-column-mapping-page__status--applied {
    background-color: var(--column-mapping-status-applied-background);
    border-color: var(--column-mapping-status-applied-border);
  }

  .workspace-column-mapping-page__status--empty {
    background-color: var(--column-mapping-status-empty-background);
    border-color: var(--column-mapping-status-empty-border);
  }

  .workspace-column-mapping-page__status-text {
    margin: 0;
    font-weight: 500;
  }

  .workspace-column-mapping-page__status--applied .workspace-column-mapping-page__status-text {
    color: var(--column-mapping-status-applied-text);
  }

  .workspace-column-mapping-page__status--empty .workspace-column-mapping-page__status-text {
    color: var(--column-mapping-status-empty-text);
  }
</style>
