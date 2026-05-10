<template>
  <PageLayout :description="t('workspace.description')" nav-label="Workspace sections">
    <template #menu>
      <li>
        <RouterLink
          :to="{ name: 'workspace-create', params: { locale: localeParam } }"
          class="page-layout__menu-item"
          :class="{
            'page-layout__menu-item--active': route.name === 'workspace-create'
          }"
        >
          {{ t('workspace.menu.currentWorkspace') }}
        </RouterLink>
      </li>
      <li>
        <RouterLink
          v-if="hasCurrentWorkspace"
          :to="{ name: 'workspace-export', params: { locale: localeParam } }"
          class="page-layout__menu-item"
          :class="{
            'page-layout__menu-item--active': route.name === 'workspace-export'
          }"
          data-testid="workspace-menu-export"
        >
          {{ t('workspace.menu.export') }}
        </RouterLink>
        <span
          v-else
          class="page-layout__menu-item page-layout__menu-item--disabled"
          aria-disabled="true"
          data-testid="workspace-menu-export-disabled"
        >
          {{ t('workspace.menu.export') }}
        </span>
      </li>
      <li>
        <RouterLink
          v-if="hasCurrentWorkspace"
          :to="{ name: 'workspace-accounts', params: { locale: localeParam } }"
          class="page-layout__menu-item"
          :class="{
            'page-layout__menu-item--active': route.name === 'workspace-accounts'
          }"
        >
          {{ t('workspace.menu.accounts') }}
        </RouterLink>
        <span
          v-else
          class="page-layout__menu-item page-layout__menu-item--disabled"
          aria-disabled="true"
        >
          {{ t('workspace.menu.accounts') }}
        </span>
      </li>
      <li>
        <RouterLink
          v-if="hasSelectedAccount"
          :to="{ name: 'workspace-segments', params: { locale: localeParam } }"
          class="page-layout__menu-item"
          :class="{
            'page-layout__menu-item--active': route.name === 'workspace-segments'
          }"
          data-testid="workspace-menu-segments"
        >
          {{ t('workspace.menu.segments') }}
        </RouterLink>
        <span
          v-else
          class="page-layout__menu-item page-layout__menu-item--disabled"
          aria-disabled="true"
          data-testid="workspace-menu-segments-disabled"
        >
          {{ t('workspace.menu.segments') }}
        </span>
      </li>
    </template>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'
  import { useWorkspaceStore } from '../../stores/workspace-store'
  import PageLayout from '@engineTestApp/components/page-layout.vue'

  const { t } = useI18n()
  const route = useRoute()
  const workspaceStore = useWorkspaceStore()

  const hasCurrentWorkspace = computed(() => workspaceStore.currentWorkspace !== null)
  const hasSelectedAccount = computed(() => workspaceStore.selectedAccountId !== null)

  const localeParam = computed(() => {
    const locale = route.params.locale
    return typeof locale === 'string' ? locale : 'en'
  })
</script>
