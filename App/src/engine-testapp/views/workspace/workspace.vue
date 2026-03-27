<template>
  <section class="workspace-view">
    <header class="workspace-view__header">
      <h2>{{ t('workspace.title') }}</h2>
      <p>{{ t('workspace.description') }}</p>
    </header>

    <div class="workspace-view__panel">
      <CsvSelection @csv-content-selected="onCsvContentSelected" />

      <CsvColumnMapping
        v-if="parsedJson"
        :csv-content="parsedJson"
        @mapping-applied="onMappingApplied"
        @mapping-reset="onMappingReset"
      />

      <pre
        v-if="appliedMapping"
        class="workspace-view__json-output"
        data-testid="workspace-mapping-output"
      ><code>{{ formattedAppliedMapping }}</code></pre>

      <div v-if="parsedJson" class="workspace-view__json-controls">
        <button
          class="workspace-view__secondary-button"
          type="button"
          data-testid="workspace-toggle-json"
          @click="toggleJsonVisibility"
        >
          {{ isJsonVisible ? t('workspace.hideJson') : t('workspace.showJson') }}
        </button>
      </div>

      <pre
        v-if="parsedJson && isJsonVisible"
        class="workspace-view__json-output"
        data-testid="workspace-json-output"
      ><code>{{ formattedJson }}</code></pre>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import CsvColumnMapping from '../../components/csv-column-mapping/csv-column-mapping.vue'
  import CsvSelection from '../../components/csv-selection/csv-selection.vue'
  import { type CsvColumnMapping as AppliedCsvColumnMapping } from '../../../engine/modules/csv-import/csv-column-content'
  import { type CsvContentExtractionResult } from '../../../engine/modules/csv-import/csv-content-extractor'

  const { t } = useI18n()
  const parsedJson = ref<CsvContentExtractionResult | null>(null)
  const appliedMapping = ref<AppliedCsvColumnMapping | null>(null)
  const isJsonVisible = ref(false)

  const formattedAppliedMapping = computed(() => {
    if (!appliedMapping.value) {
      return ''
    }

    return JSON.stringify(appliedMapping.value, null, 2)
  })

  const formattedJson = computed(() => {
    if (!parsedJson.value) {
      return ''
    }

    return JSON.stringify(parsedJson.value, null, 2)
  })

  function onCsvContentSelected(result: CsvContentExtractionResult | null): void {
    parsedJson.value = result
    appliedMapping.value = null
    isJsonVisible.value = !!result
  }

  function onMappingApplied(mapping: AppliedCsvColumnMapping): void {
    appliedMapping.value = mapping
  }

  function onMappingReset(): void {
    appliedMapping.value = null
  }

  function toggleJsonVisibility(): void {
    isJsonVisible.value = !isJsonVisible.value
  }
</script>

<style scoped>
  .workspace-view {
    display: grid;
    gap: 1.5rem;
    max-width: 42rem;
  }

  .workspace-view__header {
    display: grid;
    gap: 0.5rem;
  }

  .workspace-view__header h2 {
    margin: 0;
  }

  .workspace-view__header p {
    margin: 0;
    color: #4b5563;
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
    .workspace-view__secondary-button {
      width: 100%;
    }
  }
</style>
