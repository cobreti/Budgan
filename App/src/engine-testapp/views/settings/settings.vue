<template>
  <PageLayout :description="t('settings.description')" nav-label="Settings sections">
    <template #menu>
      <li>
        <RouterLink
          :to="{ name: 'settings-column-mappings', params: { locale: localeParam } }"
          class="page-layout__menu-item"
          :class="{ 'page-layout__menu-item--active': route.name === 'settings-column-mappings' }"
          data-testid="settings-menu-column-mappings"
        >
          {{ t('settings.menu.columnMappings') }}
        </RouterLink>
      </li>
      <li>
        <RouterLink
          :to="{ name: 'settings-export', params: { locale: localeParam } }"
          class="page-layout__menu-item"
          :class="{ 'page-layout__menu-item--active': route.name === 'settings-export' }"
          data-testid="settings-menu-export"
        >
          {{ t('settings.menu.export') }}
        </RouterLink>
      </li>
    </template>
  </PageLayout>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRoute } from 'vue-router'
  import PageLayout from '@engineTestApp/components/page-layout.vue'

  const { t } = useI18n()
  const route = useRoute()

  const localeParam = computed(() => {
    const locale = route.params.locale
    return typeof locale === 'string' ? locale : 'en'
  })
</script>
