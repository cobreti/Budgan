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
              :to="{ name: 'workspace-create', params: { locale: localeParam } }"
              class="workspace-view__menu-item"
              :class="{
                'workspace-view__menu-item--active': route.name === 'workspace-create'
              }"
            >
              {{ t('workspace.menu.currentWorkspace') }}
            </RouterLink>
          </li>
          <li>
            <RouterLink
              v-if="hasCurrentWorkspace"
              :to="{ name: 'workspace-accounts', params: { locale: localeParam } }"
              class="workspace-view__menu-item"
              :class="{
                'workspace-view__menu-item--active': route.name === 'workspace-accounts'
              }"
            >
              {{ t('workspace.menu.accounts') }}
            </RouterLink>
            <span
              v-else
              class="workspace-view__menu-item workspace-view__menu-item--disabled"
              aria-disabled="true"
            >
              {{ t('workspace.menu.accounts') }}
            </span>
          </li>
          <li>
            <RouterLink
              v-if="hasCurrentWorkspace"
              :to="{ name: 'workspace-csv-selection', params: { locale: localeParam } }"
              class="workspace-view__menu-item"
              :class="{
                'workspace-view__menu-item--active': route.name === 'workspace-csv-selection'
              }"
            >
              {{ t('workspace.menu.csvSelection') }}
            </RouterLink>
            <span
              v-else
              class="workspace-view__menu-item workspace-view__menu-item--disabled"
              aria-disabled="true"
            >
              {{ t('workspace.menu.csvSelection') }}
            </span>
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
  import { useWorkspaceStore } from '../../stores/workspace-store'

  const { t } = useI18n()
  const route = useRoute()
  const workspaceStore = useWorkspaceStore()

  const hasCurrentWorkspace = computed(() => workspaceStore.currentWorkspace !== null)

  const localeParam = computed(() => {
    const locale = route.params.locale
    return typeof locale === 'string' ? locale : 'en'
  })
</script>

<style scoped>
  @use 'colors-def';

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
    color: var(--workspace-header-text);
  }

  .workspace-view__layout {
    display: grid;
    grid-template-columns: 16rem minmax(0, 1fr);
    gap: 1rem;
    align-items: start;
  }

  .workspace-view__menu {
    border: 1px solid var(--workspace-menu-border);
    border-radius: 1rem;
    background-color: var(--workspace-menu-background);
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
    border: 1px solid var(--workspace-menu-item-border);
    border-radius: 0.625rem;
    color: var(--workspace-menu-item-text);
    background-color: var(--workspace-menu-item-background);
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
  }

  .workspace-view__menu-item--active {
    border-color: var(--workspace-menu-item-active-border);
    background-color: var(--workspace-menu-item-active-background);
    color: var(--workspace-menu-item-active-text);
  }

  .workspace-view__menu-item--disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .workspace-view__panel {
    display: grid;
    gap: 1rem;
    padding: 1.5rem;
    border: 1px solid var(--workspace-panel-border);
    border-radius: 1rem;
    background-color: var(--workspace-panel-background);
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
