<template>
  <v-card
    class="account-card"
    variant="outlined"
    :to="{ name: 'account', params: { locale: localeParam, accountId: account.id } }"
    :data-testid="`account-card-${account.id}`"
  >
    <v-card-text class="account-card__body">
      <span class="account-card__name">{{ account.name }}</span>
      <span class="account-card__meta">{{ t('accounts.segments', account.segments.length) }}</span>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import type { BdgAccount } from '@engine/modules/bdg-workspace/bdg-account'

defineProps<{
  account: BdgAccount
}>()

const { t } = useI18n()
const route = useRoute()

const localeParam = computed(() => {
  const l = route.params.locale
  return typeof l === 'string' ? l : 'en'
})
</script>

<style scoped>
@use '@budgan/assets/colors-def.scss';

.account-card {
  border-color: var(--bdg-secondary) !important;
  transition: box-shadow 0.15s ease;
}

.account-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.account-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.account-card__name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--bdg-on-surface);
}

.account-card__meta {
  font-size: 0.75rem;
  opacity: 0.6;
  color: var(--bdg-on-surface);
}
</style>

