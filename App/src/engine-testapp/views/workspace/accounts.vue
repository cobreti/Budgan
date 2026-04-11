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

      <label class="accounts__label accounts__label--required" for="account-mapping">
        {{ t('workspace.account.accounts.columnMappingLabel') }}
      </label>
      <select
        id="account-mapping"
        v-model="selectedMappingId"
        class="accounts__select"
        data-testid="accounts-mapping-select"
      >
        <option value="" disabled>{{ t('workspace.account.accounts.columnMappingPlaceholder') }}</option>
        <option
          v-for="mapping in columnMappings"
          :key="mapping.id"
          :value="mapping.id"
        >
          {{ mapping.name }}
        </option>
      </select>
      <p v-if="columnMappings.length === 0" class="accounts__hint" data-testid="accounts-no-mappings">
        {{ t('workspace.account.accounts.noMappings') }}
      </p>

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

    <hr class="accounts__separator" />

    <div class="accounts__list-section">
      <h4 class="accounts__list-title">{{ t('workspace.account.accounts.listTitle') }}</h4>
      <ul v-if="accounts.length > 0" class="accounts__list">
        <li
          v-for="account in accounts"
          :key="account.id"
          class="accounts__list-item"
          :class="{ 'accounts__list-item--selected': selectedAccountId === account.id }"
          :data-testid="`accounts-item-${account.id}`"
        >
          <button
            class="accounts__check"
            type="button"
            :aria-label="selectedAccountId === account.id
              ? t('workspace.account.accounts.unselect')
              : t('workspace.account.accounts.select')"
            :aria-pressed="selectedAccountId === account.id"
            :data-testid="`accounts-select-${account.id}`"
            @click="toggleSelectAccount(account.id)"
          >
            <span
              class="mdi accounts__check-icon"
              :class="selectedAccountId === account.id
                ? 'mdi-check-circle accounts__check-icon--selected'
                : 'mdi-check-circle-outline'"
            />
          </button>

          <div class="accounts__list-item-body">
            <div class="accounts__list-item-main">
              <span class="accounts__list-item-name">{{ account.name }}</span>
              <span class="accounts__list-item-id">({{ account.id }})</span>
            </div>
            <div class="accounts__list-item-footer">
              <span
                class="accounts__list-item-mapping"
                data-testid="accounts-item-mapping"
              >
                {{ t('workspace.account.accounts.columnMappingLabel') }}: {{ mappingNameById(account.columnMappingId) }}
              </span>
              <button
                class="accounts__remove-button"
                type="button"
                :data-testid="`accounts-remove-${account.id}`"
                @click="removeAccount(account.id)"
              >
                {{ t('workspace.account.accounts.remove') }}
              </button>
            </div>
          </div>
        </li>
      </ul>
      <p v-else class="accounts__list-empty">
        {{ t('workspace.account.accounts.noAccounts') }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useWorkspaceStore } from '@engineTestApp/stores/workspace-store'
  import { useSettingsStore } from '@engineTestApp/stores/settings-store'
  import type { BdgAccount } from '@engine/modules/bdg-workspace/bdg-account'

  const { t } = useI18n()
  const workspaceStore = useWorkspaceStore()
  const settingsStore = useSettingsStore()

  const accountName = ref('')
  const selectedMappingId = ref('')
  const createdAccount = ref<{ id: string; name: string } | null>(null)
  const errorMessage = ref('')

  const accounts = computed<BdgAccount[]>(() => workspaceStore.currentWorkspace?.accounts ?? [])
  const selectedAccountId = computed(() => workspaceStore.selectedAccountId)
  const columnMappings = computed(() => settingsStore.columnMappings)

  function mappingNameById(id: string): string {
    return columnMappings.value.find((m) => m.id === id)?.name ?? id
  }

  function toggleSelectAccount(accountId: string): void {
    if (workspaceStore.selectedAccountId === accountId) {
      workspaceStore.clearSelectedAccount()
    } else {
      workspaceStore.setSelectedAccount(accountId)
    }
  }

  function removeAccount(accountId: string): void {
    workspaceStore.removeAccountFromCurrentWorkspace(accountId)
  }

  function createAccount(): void {
    const trimmedAccountName = accountName.value.trim()

    if (!trimmedAccountName) {
      createdAccount.value = null
      errorMessage.value = t('workspace.account.accounts.nameRequired')
      return
    }

    if (!selectedMappingId.value) {
      createdAccount.value = null
      errorMessage.value = t('workspace.account.accounts.columnMappingRequired')
      return
    }

    if (!workspaceStore.currentWorkspace) {
      createdAccount.value = null
      errorMessage.value = t('workspace.account.accounts.error')
      return
    }

    try {
      const account = workspaceStore.createAccountInCurrentWorkspace(trimmedAccountName, selectedMappingId.value)

      createdAccount.value = {
        id: account.id,
        name: account.name
      }
      errorMessage.value = ''
      accountName.value = ''
      selectedMappingId.value = ''
    } catch {
      createdAccount.value = null
      errorMessage.value = t('workspace.account.accounts.error')
    }
  }
</script>

<style scoped>
  @use 'colors-def';

  .accounts {
    display: grid;
    gap: 0.75rem;
  }

  .accounts__title,
  .accounts__description {
    margin: 0;
  }

  .accounts__description {
    color: var(--workspace-on-surface-variant);
  }

  .accounts__form {
    display: grid;
    gap: 0.75rem;
  }

  .accounts__label {
    font-weight: 600;
    color: var(--workspace-on-surface);
  }

  .accounts__label--required::after {
    content: ' *';
    color: var(--workspace-error);
  }

  .accounts__input,
  .accounts__select {
    min-height: 2.75rem;
    padding: 0.65rem 0.75rem;
    border: 1px solid var(--workspace-outline);
    border-radius: 0.625rem;
    background-color: var(--workspace-surface);
    color: var(--workspace-on-surface);
    font: inherit;
  }

  .accounts__hint {
    margin: 0;
    font-size: 0.875rem;
    color: var(--workspace-on-surface-variant);
    font-style: italic;
  }

  .accounts__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.75rem;
    padding: 0.75rem 1.2rem;
    border: 1px solid var(--workspace-outline);
    border-radius: 999px;
    background-color: var(--workspace-surface);
    color: var(--workspace-on-surface);
    font: inherit;
    cursor: pointer;
  }

  .accounts__error,
  .accounts__success {
    margin: 0;
  }

  .accounts__error {
    color: var(--workspace-error);
  }

  .accounts__success {
    color: var(--workspace-success);
  }

  .accounts__separator {
    margin: 1.5rem 0;
    border: 0;
    border-top: 1px solid var(--workspace-outline);
    opacity: 0.2;
  }

  .accounts__list-section {
    display: grid;
    gap: 0.75rem;
  }

  .accounts__list-title {
    margin: 0;
    font-weight: 600;
  }

  .accounts__list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 0.5rem;
  }

  .accounts__list-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem 0.5rem 0.25rem;
    border: 1px solid var(--workspace-outline);
    border-radius: 0.625rem;
    background-color: var(--workspace-surface-variant-alpha-05);
    transition: border-color 0.15s, background-color 0.15s;
  }

  .accounts__list-item--selected {
    border-color: var(--workspace-account-select-border);
    background-color: var(--workspace-account-select-background);
  }

  .accounts__check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    min-width: 2.75rem;
    min-height: 2.75rem;
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 50%;
  }

  .accounts__check-icon {
    font-size: 1.375rem;
    color: var(--workspace-account-check-unselected);
    transition: color 0.15s;
  }

  .accounts__check-icon--selected {
    color: var(--workspace-account-check-selected);
  }

  .accounts__list-item-body {
    display: grid;
    gap: 0.25rem;
    flex: 1;
    min-width: 0;
  }

  .accounts__list-item-main {
    display: flex;
    gap: 0.5rem;
    align-items: baseline;
  }

  .accounts__list-item-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }

  .accounts__list-item-name {
    font-weight: 600;
  }

  .accounts__list-item-id {
    color: var(--workspace-on-surface-variant);
    font-size: 0.875rem;
  }

  .accounts__list-item-mapping {
    font-size: 0.875rem;
    color: var(--workspace-on-surface-variant);
  }


  .accounts__remove-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem 0.75rem;
    border: 1px solid var(--workspace-error);
    border-radius: 999px;
    background-color: var(--workspace-error-low-emphasis);
    color: var(--workspace-error);
    font: inherit;
    font-size: 0.8125rem;
    cursor: pointer;
    white-space: nowrap;
  }

  .accounts__list-empty {
    margin: 0;
    color: var(--workspace-on-surface-variant);
    font-style: italic;
  }

  @media (max-width: 640px) {
    .accounts__button {
      width: 100%;
    }
  }
</style>
