<template>
  <div v-if="account" data-testid="account-statements-view">
    <div class="account-statements-balance">
      <div class="account-statements-balance__snapshot">
        <span class="account-statements-balance__label">{{ t('account.balanceSnapshot.title') }}</span>
        <div class="account-statements-balance__fields">
          <input
            class="account-statements-balance__input"
            type="number"
            step="0.01"
            :placeholder="t('account.balanceSnapshot.amountLabel')"
            data-testid="snapshot-amount-input"
            v-model="snapshotAmountStr"
          />
          <input
            class="account-statements-balance__input"
            type="date"
            data-testid="snapshot-date-input"
            v-model="snapshotDateStr"
          />
          <button
            class="account-statements-balance__btn"
            data-testid="snapshot-save-btn"
            :disabled="!canSave"
            @click="onSave"
          >
            {{ t('account.balanceSnapshot.save') }}
          </button>
          <button
            v-if="account.balanceSnapshot"
            class="account-statements-balance__btn account-statements-balance__btn--clear"
            data-testid="snapshot-clear-btn"
            @click="onClear"
          >
            {{ t('account.balanceSnapshot.clear') }}
          </button>
        </div>
      </div>
      <div class="account-statements-balance__reference">
        <span class="account-statements-balance__label">{{ t('account.referenceBalance.title') }}</span>
        <span class="account-statements-balance__value" data-testid="reference-balance-value">
          {{ referenceBalanceText }}
        </span>
      </div>
    </div>
    <AccountSegmentList
      :segments="account.segments"
      :account-id="account.id"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useWorkspaceStore } from '@budgan/stores/workspace-store.ts'
import AccountSegmentList from '@budgan/components/account/account-segment-list.vue'

const route = useRoute()
const { t } = useI18n()
const workspaceStore = useWorkspaceStore()

const account = computed(() => {
  const id = route.params.accountId
  const accountId = typeof id === 'string' ? id : null
  return workspaceStore.workspace?.accounts.find((a) => a.id === accountId) ?? null
})

const snapshotAmountStr = ref(account.value?.balanceSnapshot?.amount?.toString() ?? '')
const snapshotDateStr = ref(account.value?.balanceSnapshot?.dateAsString ?? '')

watch(
  () => account.value?.balanceSnapshot,
  (snapshot) => {
    snapshotAmountStr.value = snapshot?.amount?.toString() ?? ''
    snapshotDateStr.value = snapshot?.dateAsString ?? ''
  },
)

const canSave = computed(() => {
  const amount = parseFloat(snapshotAmountStr.value)
  return !isNaN(amount) && snapshotDateStr.value.length > 0
})

function onSave(): void {
  if (!account.value || !canSave.value) return
  workspaceStore.setAccountBalanceSnapshot(
    account.value.id,
    parseFloat(snapshotAmountStr.value),
    snapshotDateStr.value,
  )
}

function onClear(): void {
  if (!account.value) return
  workspaceStore.clearAccountBalanceSnapshot(account.value.id)
}

const referenceBalanceText = computed(() => {
  const ref = account.value?.referenceBalance
  if (!ref) return t('account.referenceBalance.notSet')
  return `${ref.dateAsString}  ${ref.amount.toFixed(2)}`
})
</script>

<style scoped>
@use '@budgan/assets/colors-def.scss';

.account-statements-balance {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.account-statements-balance__snapshot,
.account-statements-balance__reference {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--bdg-secondary);
  border-radius: 8px;
  background-color: var(--bdg-surface);
}

.account-statements-balance__label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.5;
}

.account-statements-balance__fields {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.account-statements-balance__input {
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--bdg-secondary);
  border-radius: 6px;
  background-color: var(--bdg-background, var(--bdg-surface));
  color: var(--bdg-on-surface);
  font-size: 0.85rem;
}

.account-statements-balance__input:focus {
  outline: none;
  border-color: var(--bdg-primary);
}

.account-statements-balance__btn {
  padding: 0.3rem 0.75rem;
  border: 1px solid var(--bdg-primary);
  border-radius: 6px;
  background-color: var(--bdg-primary);
  color: var(--bdg-on-primary, #fff);
  font-size: 0.8rem;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.account-statements-balance__btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.account-statements-balance__btn--clear {
  background-color: transparent;
  color: var(--bdg-on-surface);
  border-color: var(--bdg-secondary);
}

.account-statements-balance__btn--clear:hover {
  border-color: var(--bdg-error);
  color: var(--bdg-error);
}

.account-statements-balance__value {
  font-size: 0.875rem;
  font-weight: 600;
}
</style>
