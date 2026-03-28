<template>
  <section class="workspace-view">
    <header class="workspace-view__header">
      <p>{{ t('workspace.description') }}</p>
    </header>

    <div class="workspace-view__layout">
      <aside class="workspace-view__menu" aria-label="Workspace sections">
        <ul class="workspace-view__menu-list">
          <li class="workspace-view__menu-item">CSV Selection</li>
          <li class="workspace-view__menu-item">Column Mapping</li>
          <li class="workspace-view__menu-item">Json Data View</li>
        </ul>
      </aside>

      <div class="workspace-view__panel">
        <CsvSelection />

        <CsvColumnMapping v-if="workspaceStore.parsedJson" />

        <pre
          v-if="workspaceStore.appliedMapping"
          class="workspace-view__json-output"
          data-testid="workspace-mapping-output"
        ><code>{{ formattedAppliedMapping }}</code></pre>

        <div v-if="workspaceStore.parsedJson" class="workspace-view__json-controls">
          <button
            class="workspace-view__secondary-button"
            type="button"
            data-testid="workspace-toggle-json"
            @click="workspaceStore.toggleJsonVisibility"
          >
            {{ workspaceStore.isJsonVisible ? t('workspace.hideJson') : t('workspace.showJson') }}
          </button>
        </div>

        <pre
          v-if="workspaceStore.parsedJson && workspaceStore.isJsonVisible"
          class="workspace-view__json-output"
          data-testid="workspace-json-output"
        ><code>{{ formattedJson }}</code></pre>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import CsvColumnMapping from '../../components/csv-column-mapping/csv-column-mapping.vue'
  import CsvSelection from '../../components/csv-selection/csv-selection.vue'
  import { useWorkspaceStore } from '../../stores/workspace-store'

  const { t } = useI18n()
  const workspaceStore = useWorkspaceStore()

  const formattedAppliedMapping = computed(() => {
    if (!workspaceStore.appliedMapping) {
      return ''
    }

    return JSON.stringify(workspaceStore.appliedMapping, null, 2)
  })

  const formattedJson = computed(() => {
    if (!workspaceStore.parsedJson) {
      return ''
    }

    return JSON.stringify(workspaceStore.parsedJson, null, 2)
  })
</script>

<style scoped>
  .workspace-view {
    display: grid;
    gap: 1.5rem;
    max-width: 72rem;
  }

  .workspace-view__header {
    display: grid;
    gap: 0.5rem;
  }

  .workspace-view__header p {
    margin: 0;
    color: #4b5563;
  }

  .workspace-view__layout {
    display: grid;
    grid-template-columns: 16rem minmax(0, 1fr);
    gap: 1rem;
    align-items: start;
  }

  .workspace-view__menu {
    border: 1px solid #d1d5db;
    border-radius: 1rem;
    background: linear-gradient(180deg, #ffffff 0%, #f7fafc 100%);
    box-shadow: 0 16px 40px -28px rgba(15, 23, 42, 0.45);
    padding: 1rem;
  }

  .workspace-view__menu-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.625rem;
  }

  .workspace-view__menu-item {
    padding: 0.6rem 0.75rem;
    border: 1px solid #dbe5ef;
    border-radius: 0.625rem;
    color: #0f172a;
    background-color: #ffffff;
    font-weight: 600;
    cursor: pointer;
  }

  .workspace-view__panel {
    display: grid;
    gap: 1rem;
    padding: 1.5rem;
    border: 1px solid #d1d5db;
    border-radius: 1rem;
    background: linear-gradient(180deg, #ffffff 0%, #f7fafc 100%);
    box-shadow: 0 16px 40px -28px rgba(15, 23, 42, 0.45);
  }

  .workspace-view__secondary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.75rem;
    padding: 0.75rem 1.2rem;
    border-radius: 999px;
    font: inherit;
    cursor: pointer;
  }

  .workspace-view__secondary-button {
    border: 1px solid #cbd5e1;
    background-color: #ffffff;
    color: #0f172a;
  }

  .workspace-view__json-controls {
    display: flex;
  }

  .workspace-view__json-output {
    margin: 0;
    padding: 1rem;
    overflow-x: auto;
    border-radius: 0.75rem;
    background-color: #0f172a;
    color: #e2e8f0;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  @media (max-width: 640px) {
    .workspace-view__layout {
      grid-template-columns: 1fr;
    }

    .workspace-view__menu {
      padding: 0.875rem;
    }

    .workspace-view__secondary-button {
      width: 100%;
    }
  }
</style>
