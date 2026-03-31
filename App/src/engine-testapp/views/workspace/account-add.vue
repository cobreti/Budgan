<template>
  <section class="account-add" data-testid="account-add-view">
    <h3 class="account-add__title">{{ t('workspace.account.add.title') }}</h3>
    <p class="account-add__description">{{ t('workspace.account.add.description') }}</p>

    <form class="account-add__form" @submit.prevent="createAccount">
      <label class="account-add__label" for="account-name">
        {{ t('workspace.account.add.nameLabel') }}
      </label>
      <input
        id="account-name"
        v-model="accountName"
        class="account-add__input"
        data-testid="account-add-name"
        type="text"
        :placeholder="t('workspace.account.add.namePlaceholder')"
      />

      <p v-if="errorMessage" class="account-add__error" data-testid="account-add-error">
        {{ errorMessage }}
      </p>
      <p
        v-if="createdAccount"
        class="account-add__success"
        data-testid="account-add-success"
      >
        {{ t('workspace.account.add.success', { accountName: createdAccount.name, accountId: createdAccount.id }) }}
      </p>

      <button class="account-add__button" type="submit" data-testid="account-add-submit">
        {{ t('workspace.account.add.submit') }}
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
      errorMessage.value = t('workspace.account.add.nameRequired')
      return
    }

    const currentWorkspace = workspaceStore.currentWorkspace
    if (!currentWorkspace) {
      createdAccount.value = null
      errorMessage.value = t('workspace.account.add.error')
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
      errorMessage.value = t('workspace.account.add.error')
    }
  }
</script>

<style scoped>
  .account-add {
    display: grid;
    gap: 0.75rem;
  }

  .account-add__title,
  .account-add__description {
    margin: 0;
  }

  .account-add__description {
    color: rgb(var(--v-theme-on-surface-variant));
  }

  .account-add__form {
    display: grid;
    gap: 0.75rem;
  }

  .account-add__label {
    font-weight: 600;
    color: rgb(var(--v-theme-on-surface));
  }

  .account-add__input {
    min-height: 2.75rem;
    padding: 0.65rem 0.75rem;
    border: 1px solid rgb(var(--v-theme-outline));
    border-radius: 0.625rem;
    background-color: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-on-surface));
    font: inherit;
  }

  .account-add__button {
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

  .account-add__error,
  .account-add__success {
    margin: 0;
  }

  .account-add__error {
    color: rgb(var(--v-theme-error));
  }

  .account-add__success {
    color: rgb(var(--v-theme-success));
  }

  @media (max-width: 640px) {
    .account-add__button {
      width: 100%;
    }
  }
</style>
