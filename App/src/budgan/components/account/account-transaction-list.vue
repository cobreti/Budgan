<template>
  <div class="account-transaction-list" data-testid="account-transaction-list">
    <div class="account-transaction-list__header" data-testid="account-transaction-list-header">
      <span class="account-transaction-list__cell account-transaction-list__cell--card">
        {{ t('account.transactionList.colCardNumber') }}
      </span>
      <span class="account-transaction-list__cell account-transaction-list__cell--date">
        {{ t('account.transactionList.colDate') }}
      </span>
      <span class="account-transaction-list__cell account-transaction-list__cell--description">
        {{ t('account.transactionList.colDescription') }}
      </span>
      <span class="account-transaction-list__cell account-transaction-list__cell--amount">
        {{ t('account.transactionList.colAmount') }}
      </span>
    </div>

    <p
      v-if="rows.length === 0"
      class="account-transaction-list__empty"
      data-testid="account-transaction-list-empty"
    >
      {{ t('account.transactionList.noTransactions') }}
    </p>

    <div
      v-for="(row, index) in rows"
      :key="row.key"
      class="account-transaction-list__row"
      :class="index % 2 === 0 ? 'account-transaction-list__row--even' : 'account-transaction-list__row--odd'"
      :data-testid="`account-transaction-list-row-${row.key}`"
    >
      <span class="account-transaction-list__cell account-transaction-list__cell--card">
        {{ row.cardNumber }}
      </span>
      <span class="account-transaction-list__cell account-transaction-list__cell--date">
        {{ row.dateTransactionAsString }}
      </span>
      <span class="account-transaction-list__cell account-transaction-list__cell--description">
        {{ row.description }}
        <v-icon
          v-if="row.duplicateOf"
          class="account-transaction-list__duplicate-icon"
          icon="mdi-content-copy"
          size="14"
          :aria-label="t('account.transactionList.duplicateWarning')"
          data-testid="account-transaction-list-duplicate-icon"
        />
      </span>
      <span
        class="account-transaction-list__cell account-transaction-list__cell--amount"
        :class="row.amount >= 0
          ? 'account-transaction-list__cell--amount-positive'
          : 'account-transaction-list__cell--amount-negative'"
      >
        {{ row.amount.toFixed(2) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { BdgAccountSegment } from '@engine/modules/bdg-workspace/bdg-account-segment'

const props = defineProps<{
  segments: BdgAccountSegment[]
}>()

const { t } = useI18n()

const rows = computed(() => props.segments.flatMap((s) => s.rows))
</script>

<style scoped>
@use '@budgan/assets/colors-def.scss';

.account-transaction-list {
  width: 100%;
  font-size: 0.875rem;
  color: var(--bdg-on-surface);
  border: 1px solid var(--bdg-secondary);
  border-radius: 8px;
  overflow: hidden;
}

.account-transaction-list__header,
.account-transaction-list__row {
  display: grid;
  grid-template-columns: minmax(9rem, auto) minmax(8rem, auto) 1fr minmax(7rem, auto);
  gap: 0 0.75rem;
  align-items: center;
  padding: 0.375rem 0.75rem;
}

.account-transaction-list__header {
  font-weight: 600;
  background-color: var(--bdg-surface);
  border-bottom: 1px solid var(--bdg-secondary);
  position: sticky;
  top: 0;
  z-index: 1;
}

.account-transaction-list__row--even {
  background-color: var(--bdg-background);
}

.account-transaction-list__row--odd {
  background-color: var(--bdg-surface);
}

.account-transaction-list__cell--amount {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.account-transaction-list__cell--amount-positive {
  color: var(--bdg-accent);
}

.account-transaction-list__cell--amount-negative {
  color: var(--bdg-error);
}

.account-transaction-list__duplicate-icon {
  margin-left: 0.3rem;
  opacity: 0.45;
  vertical-align: middle;
}

.account-transaction-list__empty {
  margin: 0.75rem;
  opacity: 0.6;
}
</style>

