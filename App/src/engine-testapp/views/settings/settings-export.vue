<template>
  <section class="settings-export" data-testid="settings-export-view">
    <h3 class="settings-export__title">{{ t('settings.export.title') }}</h3>
    <p class="settings-export__description">{{ t('settings.export.description') }}</p>

    <div class="settings-export__actions">
      <button
        class="settings-export__button"
        type="button"
        data-testid="settings-export-copy"
        @click="copyToClipboard"
      >
        {{ t('settings.export.copy') }}
      </button>
      <button
        class="settings-export__button"
        type="button"
        data-testid="settings-export-download"
        @click="downloadJson"
      >
        {{ t('settings.export.download') }}
      </button>
    </div>

    <p v-if="copied" class="settings-export__copied" data-testid="settings-export-copied">
      {{ t('settings.export.copied') }}
    </p>

    <pre class="settings-export__output" data-testid="settings-export-output">{{ jsonOutput }}</pre>
    <p class="settings-export__size" data-testid="settings-export-size">{{ jsonSizeBytes }} bytes</p>
  </section>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useSettingsStore } from '@engineTestApp/stores/settings-store'
  import { BdgSettingsExporter } from '@engine/modules/bdg-settings/bdg-settings-exporter'

  const { t } = useI18n()
  const settingsStore = useSettingsStore()
  const exporter = new BdgSettingsExporter()

  const copied = ref(false)

  const jsonOutput = computed(() =>
    JSON.stringify(exporter.export(settingsStore.settings), null, 2)
  )

  const jsonSizeBytes = computed(() => new Blob([jsonOutput.value]).size)

  async function copyToClipboard(): Promise<void> {
    await navigator.clipboard.writeText(jsonOutput.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }

  function downloadJson(): void {
    const blob = new Blob([jsonOutput.value], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'settings.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }
</script>

<style scoped>
  @use 'colors-def';

  .settings-export {
    display: grid;
    gap: 0.75rem;
  }

  .settings-export__title,
  .settings-export__description {
    margin: 0;
  }

  .settings-export__description {
    color: var(--workspace-on-surface-variant);
  }

  .settings-export__actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .settings-export__button {
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

  .settings-export__copied {
    margin: 0;
    color: var(--workspace-success);
  }

  .settings-export__output {
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

  .settings-export__size {
    margin: 0;
    font-size: 0.8125rem;
    color: var(--workspace-on-surface-variant);
    text-align: right;
  }

  @media (max-width: 640px) {
    .settings-export__button {
      width: 100%;
    }
  }
</style>
