<template>
  <section class="workspace-json-data-view">
    <div
      v-if="!workspaceStore.parsedJson"
      class="workspace-json-data-view__status"
      data-testid="workspace-json-status"
    >
      <p class="workspace-json-data-view__status-text">Select a CSV file to view JSON data.</p>
    </div>

    <template v-if="workspaceStore.parsedJson">
      <pre
        v-if="workspaceStore.appliedMapping"
        class="workspace-json-data-view__output"
        data-testid="workspace-mapping-output"
      ><code>{{ formattedAppliedMapping }}</code></pre>

      <div class="workspace-json-data-view__controls">
        <button
          class="workspace-json-data-view__button"
          type="button"
          data-testid="workspace-toggle-json"
          @click="workspaceStore.toggleJsonVisibility"
        >
          {{ workspaceStore.isJsonVisible ? t('workspace.hideJson') : t('workspace.showJson') }}
        </button>
      </div>

      <pre
        v-if="workspaceStore.isJsonVisible"
        class="workspace-json-data-view__output"
        data-testid="workspace-json-output"
      ><code>{{ formattedJson }}</code></pre>
    </template>
  </section>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
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
  @use 'colors-def';

  .workspace-json-data-view {
    display: grid;
    gap: 1rem;
  }

  .workspace-json-data-view__status {
    padding: 1rem;
    border-radius: 0.75rem;
    border: 1px solid var(--json-view-status-empty-border);
    background-color: var(--json-view-status-empty-background);
  }

  .workspace-json-data-view__status-text {
    margin: 0;
    color: var(--json-view-status-empty-text);
    font-weight: 500;
  }

  .workspace-json-data-view__controls {
    display: flex;
  }

  .workspace-json-data-view__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.75rem;
    padding: 0.75rem 1.2rem;
    border: 1px solid var(--json-view-button-border);
    border-radius: 999px;
    background-color: var(--json-view-button-background);
    color: var(--json-view-button-text);
    font: inherit;
    cursor: pointer;
  }

  .workspace-json-data-view__output {
    margin: 0;
    padding: 1rem;
    overflow-x: auto;
    border-radius: 0.75rem;
    background-color: var(--json-view-output-background);
    color: var(--json-view-output-text);
    font-size: 0.875rem;
    line-height: 1.5;
  }

  @media (max-width: 640px) {
    .workspace-json-data-view__button {
      width: 100%;
    }
  }
</style>
