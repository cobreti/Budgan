<template>
  <section class="workspace-view">
    <header class="workspace-view__header">
      <p>{{ t('workspace.description') }}</p>
    </header>

    <div class="workspace-view__layout">
      <aside class="workspace-view__menu" aria-label="Workspace sections">
        <ul class="workspace-view__menu-list">
          <li>
            <RouterLink
              :to="{ name: 'workspace-csv-selection', params: { locale: localeParam } }"
              class="workspace-view__menu-item"
              :class="{
                'workspace-view__menu-item--active': route.name === 'workspace-csv-selection'
              }"
            >
              CSV Selection
            </RouterLink>
          </li>
          <li>
            <RouterLink
              :to="{ name: 'workspace-column-mapping', params: { locale: localeParam } }"
              class="workspace-view__menu-item"
              :class="{
                'workspace-view__menu-item--active': route.name === 'workspace-column-mapping'
              }"
            >
              Column Mapping
            </RouterLink>
          </li>
          <li>
            <RouterLink
              :to="{ name: 'workspace-json-data-view', params: { locale: localeParam } }"
              class="workspace-view__menu-item"
              :class="{
                'workspace-view__menu-item--active': route.name === 'workspace-json-data-view'
              }"
            >
              Json Data View
            </RouterLink>
          </li>
        </ul>
      </aside>

      <div class="workspace-view__panel">
        <RouterView />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'

  const { t } = useI18n()
  const route = useRoute()

  const localeParam = computed(() => {
    const locale = route.params.locale
    return typeof locale === 'string' ? locale : 'en'
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
    display: block;
    padding: 0.6rem 0.75rem;
    border: 1px solid #dbe5ef;
    border-radius: 0.625rem;
    color: #0f172a;
    background-color: #ffffff;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
  }

  .workspace-view__menu-item--active {
    border-color: #0f766e;
    background-color: #ccfbf1;
    color: #134e4a;
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

  @media (max-width: 640px) {
    .workspace-view__layout {
      grid-template-columns: 1fr;
    }

    .workspace-view__menu {
      padding: 0.875rem;
    }
  }
</style>
