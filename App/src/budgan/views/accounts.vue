<template>
  <div class="accounts-view">
    <h1 class="accounts-view__title" data-testid="accounts-view-title">
      {{ t('accounts.title') }}
    </h1>

    <p
      v-if="!workspaceStore.workspace"
      class="accounts-view__empty"
      data-testid="accounts-view-no-workspace"
    >
      {{ t('accounts.noWorkspace') }}
    </p>

    <div v-else class="accounts-view__list" data-testid="accounts-view-list">
      <AccountCard
        v-for="account in workspaceStore.workspace.accounts"
        :key="account.id"
        :account="account"
      />
      <AddAccountCard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useWorkspaceStore } from '@budgan/stores/workspace-store.ts'
import AccountCard from '@budgan/components/account/account-card.vue'
import AddAccountCard from '@budgan/components/account/add-account-card.vue'

const { t } = useI18n()
const workspaceStore = useWorkspaceStore()
</script>

<style scoped>
@use '@budgan/assets/colors-def.scss';

.accounts-view {
  padding: 1.5rem;
  color: var(--bdg-on-surface);
  background-color: var(--bdg-background);
  height: 100%;
}

.accounts-view__title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  color: var(--bdg-primary);
}

.accounts-view__empty {
  opacity: 0.6;
  font-size: 0.9rem;
}

.accounts-view__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
</style>



