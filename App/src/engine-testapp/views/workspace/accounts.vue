<template>
  <section class="accounts" data-testid="accounts-view">
    <h3 class="accounts__title">{{ t('workspace.account.accounts.title') }}</h3>
    <p class="accounts__description">{{ t('workspace.account.accounts.description') }}</p>

    <form class="accounts__form" @submit.prevent="createAccount">
      <label class="accounts__label" for="account-name">
        {{ t('workspace.account.accounts.nameLabel') }}
      </label>
      <input
        id="account-name"
        v-model="accountName"
        class="accounts__input"
        data-testid="accounts-name"
        type="text"
        :placeholder="t('workspace.account.accounts.namePlaceholder')"
      />

      <p v-if="errorMessage" class="accounts__error" data-testid="accounts-error">
        {{ errorMessage }}
      </p>
      <p
        v-if="createdAccount"
        class="accounts__success"
        data-testid="accounts-success"
      >
        {{ t('workspace.account.accounts.success', { accountName: createdAccount.name, accountId: createdAccount.id }) }}
      </p>

      <button class="accounts__button" type="submit" data-testid="accounts-submit">
        {{ t('workspace.account.accounts.submit') }}
      </button>
    </form>
  </section>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useWorkspaceStore } from '../../stores/workspace-store'
  import container from '../../../inversify/setup-inversify'
  import { IdGenerator } from '../../../engine/services/IdGenerator'
  import { BdgWorkspaceImpl } from '../../../engine/modules/bdg-workspace/bdg-workspace'

  const { t } = useI18n()
  const workspaceStore = useWorkspaceStore()

  const accountName = ref('')
  const createdAccount = ref<{ id: string; name: string } | null>(null)
  const errorMessage = ref('')

  function createAccount(): void {
    const trimmedAccountName = accountName.value.trim()

    if (!trimmedAccountName) {
      createdAccount.value = null
      errorMessage.value = t('workspace.account.accounts.nameRequired')
      return
    }

    const currentWorkspace = workspaceStore.currentWorkspace
    if (!currentWorkspace) {
      createdAccount.value = null
      errorMessage.value = t('workspace.account.accounts.error')
      return
    }

    try {
      const idGenerator = container.get<IdGenerator>(IdGenerator.bindingTypeId)
      const workspace = new BdgWorkspaceImpl(idGenerator, currentWorkspace.id)
      workspace.name = currentWorkspace.name
      
      const account = workspace.createAccount(trimmedAccountName)
      
      createdAccount.value = {
        id: account.id,
        name: account.name
      }
      errorMessage.value = ''
      accountName.value = ''
    } catch {
      createdAccount.value = null
      errorMessage.value = t('workspace.account.accounts.error')
    }
  }
</script>

<style scoped>
  .accounts {
    display: grid;
    gap: 0.75rem;
  }

  .accounts__title,
  .accounts__description {
    margin: 0;
  }

  .accounts__description {
    color: rgb(var(--v-theme-on-surface-variant));
  }

  .accounts__form {
    display: grid;
    gap: 0.75rem;
  }

  .accounts__label {
    font-weight: 600;
    color: rgb(var(--v-theme-on-surface));
  }

  .accounts__input {
    min-height: 2.75rem;
    padding: 0.65rem 0.75rem;
    border: 1px solid rgb(var(--v-theme-outline));
    border-radius: 0.625rem;
    background-color: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    font: inherit;
  }

  .accounts__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.75rem;
    padding: 0.75rem 1.2rem;
    border: 1px solid rgb(var(--v-theme-outline));
    border-radius: 999px;
    background-color: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    font: inherit;
    cursor: pointer;
  }

  .accounts__error,
  .accounts__success {
    margin: 0;
  }

  .accounts__error {
    color: rgb(var(--v-theme-error));
  }

  .accounts__success {
    color: rgb(var(--v-theme-success));
  }

  @media (max-width: 640px) {
    .accounts__button {
      width: 100%;
    }
  }
</style>
