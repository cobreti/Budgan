<template>
  <section class="settings-column-mappings" data-testid="settings-column-mappings-view">
    <h3 class="settings-column-mappings__title">{{ t('settings.columnMappings.title') }}</h3>
    <p class="settings-column-mappings__description">{{ t('settings.columnMappings.description') }}</p>

    <div
      class="settings-column-mappings__status"
      :class="{
        'settings-column-mappings__status--applied': workspaceStore.appliedMapping,
        'settings-column-mappings__status--empty': !workspaceStore.appliedMapping
      }"
      data-testid="settings-mapping-status"
    >
      <p class="settings-column-mappings__status-text">
        {{
          workspaceStore.appliedMapping
            ? t('settings.columnMappings.statusApplied')
            : t('settings.columnMappings.statusEmpty')
        }}
      </p>
    </div>

    <CsvColumnMapping v-if="workspaceStore.parsedJson" />

    <p
      v-else
      class="settings-column-mappings__no-csv"
      data-testid="settings-mapping-no-csv"
    >
      {{ t('settings.columnMappings.noCsv') }}
    </p>
  </section>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import { useWorkspaceStore } from '../../stores/workspace-store'
  import CsvColumnMapping from '../../components/csv-column-mapping/csv-column-mapping.vue'

  const { t } = useI18n()
  const workspaceStore = useWorkspaceStore()
</script>

<style scoped>
  @use 'colors-def';

  .settings-column-mappings {
    display: grid;
    gap: 0.75rem;
  }

  .settings-column-mappings__title,
  .settings-column-mappings__description,
  .settings-column-mappings__no-csv {
    margin: 0;
  }

  .settings-column-mappings__description,
  .settings-column-mappings__no-csv {
    color: var(--workspace-on-surface-variant);
  }

  .settings-column-mappings__status {
    padding: 1rem;
    border-radius: 0.75rem;
    border: 1px solid;
  }

  .settings-column-mappings__status--applied {
    background-color: var(--column-mapping-status-applied-background);
    border-color: var(--column-mapping-status-applied-border);
  }

  .settings-column-mappings__status--empty {
    background-color: var(--column-mapping-status-empty-background);
    border-color: var(--column-mapping-status-empty-border);
  }

  .settings-column-mappings__status-text {
    margin: 0;
    font-weight: 500;
  }

  .settings-column-mappings__status--applied .settings-column-mappings__status-text {
    color: var(--column-mapping-status-applied-text);
  }

  .settings-column-mappings__status--empty .settings-column-mappings__status-text {
    color: var(--column-mapping-status-empty-text);
  }
</style>

