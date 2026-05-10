<template>
  <v-select
    :model-value="currentLocale"
    :items="supportedLocales"
    variant="plain"
    density="compact"
    hide-details
    class="language-switcher"
    data-testid="language-switcher-select"
    aria-label="Language"
    @update:model-value="onLocaleChange"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

type SupportedLocale = 'en' | 'fr'
const supportedLocales: readonly SupportedLocale[] = ['en', 'fr']

const route = useRoute()
const router = useRouter()

const currentLocale = computed<SupportedLocale>(() => {
  const locale = route.params.locale
  return locale === 'fr' ? 'fr' : 'en'
})

function isSupportedLocale(value: unknown): value is SupportedLocale {
  return typeof value === 'string' && supportedLocales.includes(value as SupportedLocale)
}

function onLocaleChange(value: unknown): void {
  if (!isSupportedLocale(value) || value === currentLocale.value) {
    return
  }

  if (route.name) {
    router.push({
      name: route.name,
      params: { ...route.params, locale: value },
      query: route.query,
      hash: route.hash,
    })
    return
  }

  router.push({ name: 'home', params: { locale: value } })
}
</script>

<style scoped>
@use '@budgan/assets/colors-def.scss';

.language-switcher {
  width: 4rem;
}
</style>
