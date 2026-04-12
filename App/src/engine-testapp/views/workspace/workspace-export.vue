<template>
  <section class="workspace-export" data-testid="workspace-export-view">
    <h3 class="workspace-export__title">{{ t('workspace.export.title') }}</h3>
    <p class="workspace-export__description">{{ t('workspace.export.description') }}</p>

    <div class="workspace-export__actions">
      <button
        class="workspace-export__button"
        type="button"
        data-testid="workspace-export-copy"
        @click="copyToClipboard"
      >
        {{ t('workspace.export.copy') }}
      </button>
      <button
        class="workspace-export__button"
        type="button"
        data-testid="workspace-export-download"
        @click="downloadJson"
      >
        {{ t('workspace.export.download') }}
      </button>
    </div>

    <p v-if="copied" class="workspace-export__copied" data-testid="workspace-export-copied">
      {{ t('workspace.export.copied') }}
    </p>

    <pre class="workspace-export__output" data-testid="workspace-export-output">{{ jsonOutput }}</pre>
    <p class="workspace-export__size" data-testid="workspace-export-size">{{ jsonSizeBytes }} bytes</p>
  </section>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useWorkspaceStore } from '@engineTestApp/stores/workspace-store'
  import { BdgWorkspaceExporter } from '@engine/modules/bdg-workspace/bdg-workspace-exporter'

  const { t } = useI18n()
  const workspaceStore = useWorkspaceStore()
  const exporter = new BdgWorkspaceExporter()

  const copied = ref(false)

  const jsonOutput = computed(() => {
    if (!workspaceStore.currentWorkspace) return '{}'
    return JSON.stringify(exporter.export(workspaceStore.currentWorkspace), null, 2)
  })

  const jsonSizeBytes = computed(() => new Blob([jsonOutput.value]).size)

  async function copyToClipboard(): Promise<void> {
    await navigator.clipboard.writeText(jsonOutput.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }

  function downloadJson(): void {
    const name = workspaceStore.currentWorkspace?.name ?? 'workspace'
    const blob = new Blob([jsonOutput.value], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${name}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }
</script>

<style scoped>
  @use 'colors-def';

  .workspace-export {
    display: grid;
    gap: 0.75rem;
  }

  .workspace-export__title,
  .workspace-export__description {
    margin: 0;
  }

  .workspace-export__description {
    color: var(--workspace-on-surface-variant);
  }

  .workspace-export__actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .workspace-export__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.75rem;
    padding: 0.75rem 1.2rem;
    border: 1px solid var(--workspace-outline);
    border-radius: 999px;
    background-color: var(--workspace-surface);
    color: var(--workspace-on-surface);
    font: inherit;
    cursor: pointer;
  }

  .workspace-export__copied {
    margin: 0;
    color: var(--workspace-success);
  }

  .workspace-export__size {
    margin: 0;
    font-size: 0.8125rem;
    color: var(--workspace-on-surface-variant);
    text-align: right;
  }

  .workspace-export__output {
    margin: 0;
    padding: 1rem;
    border: 1px solid var(--workspace-outline);
    border-radius: 0.625rem;
    background-color: var(--workspace-surface-variant-alpha-05);
    color: var(--workspace-on-surface);
    font-size: 0.8125rem;
    overflow-x: auto;
    white-space: pre;
  }

  @media (max-width: 640px) {
    .workspace-export__button {
      width: 100%;
    }
  }
</style>
