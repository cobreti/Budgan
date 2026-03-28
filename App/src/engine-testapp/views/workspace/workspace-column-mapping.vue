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
  .workspace-column-mapping-page {
    display: grid;
    gap: 0.75rem;
  }

  .workspace-column-mapping-page__success {
    margin: 0;
    padding: 0.625rem 0.75rem;
    border: 1px solid #99f6e4;
    border-radius: 0.625rem;
    background-color: #f0fdfa;
    color: #134e4a;
    font-weight: 600;
  }

  .workspace-column-mapping-page__hint {
    margin: 0;
    color: #4b5563;
  }
</style>
