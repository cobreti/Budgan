<template>
  <v-card
    class="account-card"
    variant="outlined"
    :to="{ name: 'account', params: { locale: localeParam, accountId: props.account.id } }"
    :data-testid="`account-card-${props.account.id}`"
  >
    <v-card-text class="account-card__body">
      <div class="account-card__content">
        <span class="account-card__name">{{ props.account.name }}</span>
        <span class="account-card__meta">{{ t('accounts.segments', props.account.segments.length) }}</span>
      </div>

      <v-btn
        class="account-card__delete"
        variant="text"
        density="comfortable"
        icon="mdi-delete-outline"
        color="error"
        :aria-label="t('accounts.delete')"
        :title="t('accounts.delete')"
        :data-testid="`account-card-delete-${props.account.id}`"
        @click.stop="removeAccount"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useWorkspaceStore } from '@budgan/stores/workspace-store.ts'
import type { BdgAccount } from '@engine/modules/bdg-workspace/bdg-account'

const props = defineProps<{
  account: BdgAccount
}>()

const { t } = useI18n()
const route = useRoute()
const workspaceStore = useWorkspaceStore()

const localeParam = computed(() => {
  const l = route.params.locale
  return typeof l === 'string' ? l : 'en'
})

function removeAccount(): void {
  workspaceStore.removeAccount(props.account.id)
}
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
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.account-card__content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
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

.account-card__delete {
  margin-inline-start: auto;
}
</style>

