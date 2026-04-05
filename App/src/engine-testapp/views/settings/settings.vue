<template>
  <section class="settings-view">
    <header class="settings-view__header">
      <p>{{ t('settings.description') }}</p>
    </header>

    <div class="settings-view__layout">
      <aside class="settings-view__menu" aria-label="Settings sections">
        <ul class="settings-view__menu-list">
          <li>
            <RouterLink
              :to="{ name: 'settings-column-mappings', params: { locale: localeParam } }"
              class="settings-view__menu-item"
              :class="{ 'settings-view__menu-item--active': route.name === 'settings-column-mappings' }"
              data-testid="settings-menu-column-mappings"
            >
              {{ t('settings.menu.columnMappings') }}
            </RouterLink>
          </li>
        </ul>
      </aside>

      <div class="settings-view__panel">
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
  @use 'colors-def';

  .settings-view {
    display: grid;
    gap: 1.5rem;
    max-width: 72rem;
  }

  .settings-view__header {
    display: grid;
    gap: 0.5rem;
  }

  .settings-view__header p {
    margin: 0;
    color: var(--workspace-header-text);
  }

  .settings-view__layout {
    display: grid;
    grid-template-columns: 16rem minmax(0, 1fr);
    gap: 1rem;
    align-items: start;
  }

  .settings-view__menu {
    border: 1px solid var(--workspace-menu-border);
    border-radius: 1rem;
    background-color: var(--workspace-menu-background);
    box-shadow: 0 16px 40px -28px rgba(15, 23, 42, 0.45);
    padding: 1rem;
  }

  .settings-view__menu-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.625rem;
  }

  .settings-view__menu-item {
    display: block;
    padding: 0.6rem 0.75rem;
    border: 1px solid var(--workspace-menu-item-border);
    border-radius: 0.625rem;
    color: var(--workspace-menu-item-text);
    background-color: var(--workspace-menu-item-background);
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
  }

  .settings-view__menu-item--active {
    border-color: var(--workspace-menu-item-active-border);
    background-color: var(--workspace-menu-item-active-background);
    color: var(--workspace-menu-item-active-text);
  }

  .settings-view__panel {
    display: grid;
    gap: 1rem;
    padding: 1.5rem;
    border: 1px solid var(--workspace-panel-border);
    border-radius: 1rem;
    background-color: var(--workspace-panel-background);
    box-shadow: 0 16px 40px -28px rgba(15, 23, 42, 0.45);
  }

  @media (max-width: 640px) {
    .settings-view__layout {
      grid-template-columns: 1fr;
    }

    .settings-view__menu {
      padding: 0.875rem;
    }
  }
</style>

