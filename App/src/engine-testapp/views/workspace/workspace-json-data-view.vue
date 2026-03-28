<template>
  <section class="workspace-json-data-view">
    <pre
      v-if="workspaceStore.appliedMapping"
      class="workspace-json-data-view__output"
      data-testid="workspace-mapping-output"
    ><code>{{ formattedAppliedMapping }}</code></pre>

    <div v-if="workspaceStore.parsedJson" class="workspace-json-data-view__controls">
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
      v-if="workspaceStore.parsedJson && workspaceStore.isJsonVisible"
      class="workspace-json-data-view__output"
      data-testid="workspace-json-output"
    ><code>{{ formattedJson }}</code></pre>

    <p v-if="!workspaceStore.parsedJson" class="workspace-json-data-view__hint">
      Select a CSV file to view JSON data.
    </p>
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
  .workspace-json-data-view {
    display: grid;
    gap: 1rem;
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
    border: 1px solid #cbd5e1;
    border-radius: 999px;
    background-color: #ffffff;
    color: #0f172a;
    font: inherit;
    cursor: pointer;
  }

  .workspace-json-data-view__output {
    margin: 0;
    padding: 1rem;
    overflow-x: auto;
    border-radius: 0.75rem;
    background-color: #0f172a;
    color: #e2e8f0;
    font-size: 0.875rem;
    line-height: 1.5;
  }

  .workspace-json-data-view__hint {
    margin: 0;
    color: #4b5563;
  }

  @media (max-width: 640px) {
    .workspace-json-data-view__button {
      width: 100%;
    }
  }
</style>
