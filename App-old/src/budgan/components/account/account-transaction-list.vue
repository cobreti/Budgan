<template>
  <div class="account-transaction-list" data-testid="account-transaction-list">
    <div class="account-transaction-list__toolbar" data-testid="account-transaction-list-toolbar">
      <button
        class="account-transaction-list__toggle-duplicates"
        :class="{ 'account-transaction-list__toggle-duplicates--active': showDuplicates }"
        type="button"
        data-testid="account-transaction-list-toggle-duplicates"
        @click="showDuplicates = !showDuplicates"
      >
        <v-icon :icon="showDuplicates ? 'mdi-content-copy' : 'mdi-content-copy-off'" size="16" />
        {{ showDuplicates ? t('account.transactionList.hideDuplicates') : t('account.transactionList.showDuplicates') }}
      </button>
    </div>

    <div
      class="account-transaction-list__header"
      :class="{ 'account-transaction-list__header--with-balance': referenceBalance }"
      data-testid="account-transaction-list-header"
    >
      <button
        class="account-transaction-list__cell account-transaction-list__sort-button account-transaction-list__cell--card"
        type="button"
        data-testid="account-transaction-list-sort-card"
        @click="toggleSort('cardNumber')"
      >
        {{ t('account.transactionList.colCardNumber') }}
        <v-icon
          v-if="sortColumn === 'cardNumber'"
          class="account-transaction-list__sort-icon"
          :icon="sortDirection === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down'"
          size="14"
        />
      </button>
      <button
        class="account-transaction-list__cell account-transaction-list__sort-button account-transaction-list__cell--date"
        type="button"
        data-testid="account-transaction-list-sort-date"
        @click="toggleSort('dateInscription')"
      >
        {{ t('account.transactionList.colDate') }}
        <v-icon
          v-if="sortColumn === 'dateInscription'"
          class="account-transaction-list__sort-icon"
          :icon="sortDirection === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down'"
          size="14"
        />
      </button>
      <button
        class="account-transaction-list__cell account-transaction-list__sort-button account-transaction-list__cell--description"
        type="button"
        data-testid="account-transaction-list-sort-description"
        @click="toggleSort('description')"
      >
        {{ t('account.transactionList.colDescription') }}
        <v-icon
          v-if="sortColumn === 'description'"
          class="account-transaction-list__sort-icon"
          :icon="sortDirection === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down'"
          size="14"
        />
      </button>
      <button
        class="account-transaction-list__cell account-transaction-list__sort-button account-transaction-list__sort-button--amount account-transaction-list__cell--amount"
        type="button"
        data-testid="account-transaction-list-sort-amount"
        @click="toggleSort('amount')"
      >
        {{ t('account.transactionList.colAmount') }}
        <v-icon
          v-if="sortColumn === 'amount'"
          class="account-transaction-list__sort-icon"
          :icon="sortDirection === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down'"
          size="14"
        />
      </button>
      <span
        v-if="referenceBalance"
        class="account-transaction-list__cell account-transaction-list__cell--balance"
        data-testid="account-transaction-list-col-balance"
      >
        {{ t('account.transactionList.colBalance') }}
      </span>
    </div>

    <p
      v-if="!hasTransactions"
      class="account-transaction-list__empty"
      data-testid="account-transaction-list-empty"
    >
      {{ t('account.transactionList.noTransactions') }}
    </p>

    <template v-for="(item, index) in iterator" :key="item.kind === 'transaction' ? item.row.key : item.kind">
      <!-- Start item: not shown in the list -->
      <template v-if="item.kind === 'start'" />

      <!-- Balance snapshot row -->
      <div
        v-else-if="item.kind === 'snapshot'"
        class="account-transaction-list__row account-transaction-list__row--snapshot"
        :class="{ 'account-transaction-list__row--with-balance': referenceBalance }"
        data-testid="account-transaction-list-snapshot-row"
      >
        <span class="account-transaction-list__cell account-transaction-list__cell--card" />
        <span class="account-transaction-list__cell account-transaction-list__cell--date">
          {{ item.dateAsString }}
        </span>
        <span class="account-transaction-list__cell account-transaction-list__cell--description account-transaction-list__cell--snapshot-label">
          {{ t('account.transactionList.balanceSnapshot') }}
        </span>
        <span class="account-transaction-list__cell account-transaction-list__cell--amount" />
        <span
          class="account-transaction-list__cell account-transaction-list__cell--balance"
          data-testid="account-transaction-list-balance-snapshot"
        >
          {{ item.amount.toFixed(2) }}
        </span>
      </div>

      <!-- Transaction row -->
      <div
        v-else
        class="account-transaction-list__row"
        :class="[
          index % 2 === 0 ? 'account-transaction-list__row--even' : 'account-transaction-list__row--odd',
          { 'account-transaction-list__row--duplicate': item.row.duplicateOf },
          { 'account-transaction-list__row--with-balance': referenceBalance },
        ]"
        :data-testid="`account-transaction-list-row-${item.row.key}`"
      >
        <span class="account-transaction-list__cell account-transaction-list__cell--card">
          {{ item.row.cardNumber }}
        </span>
        <span class="account-transaction-list__cell account-transaction-list__cell--date">
          {{ item.row.dateInscriptionAsString }}
        </span>
        <span class="account-transaction-list__cell account-transaction-list__cell--description">
          {{ item.row.description }}
          <v-icon
            v-if="item.row.duplicateOf"
            class="account-transaction-list__duplicate-icon"
            icon="mdi-content-copy"
            size="14"
            :aria-label="t('account.transactionList.duplicateWarning')"
            data-testid="account-transaction-list-duplicate-icon"
          />
        </span>
        <span
          class="account-transaction-list__cell account-transaction-list__cell--amount"
          :class="item.row.amount >= 0
            ? 'account-transaction-list__cell--amount-positive'
            : 'account-transaction-list__cell--amount-negative'"
        >
          {{ item.row.amount.toFixed(2) }}
        </span>
        <span
          v-if="referenceBalance"
          class="account-transaction-list__cell account-transaction-list__cell--balance"
          :class="item.runningBalance >= 0
            ? 'account-transaction-list__cell--amount-positive'
            : 'account-transaction-list__cell--amount-negative'"
          :data-testid="`account-transaction-list-balance-${item.row.key}`"
        >
          {{ item.runningBalance.toFixed(2) }}
        </span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { BdgAccountSegment } from '@engine/modules/bdg-workspace/bdg-account-segment'
import type { BdgAccountBalanceSnapshot, BdgAccountReferenceBalance } from '@engine/modules/bdg-workspace/bdg-account.ts'
import { TransactionIterator, type TransactionSortColumn, type TransactionSortDirection } from '@engine/modules/transaction-iterator/transaction-iterator'

const props = defineProps<{
  segments: BdgAccountSegment[]
  referenceBalance: BdgAccountReferenceBalance | null
  balanceSnapshot: BdgAccountBalanceSnapshot | null
}>()

const { t } = useI18n()

const showDuplicates = ref(false)

const sortColumn = ref<TransactionSortColumn>('dateInscription')
const sortDirection = ref<TransactionSortDirection>('desc')

function toggleSort(column: TransactionSortColumn): void {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    return
  }

  sortColumn.value = column
  sortDirection.value = 'asc'
}

const iterator = computed(() => new TransactionIterator(
  props.segments,
  props.referenceBalance,
  props.balanceSnapshot,
  {
    includeDuplicates: showDuplicates.value,
    sortColumn: sortColumn.value,
    sortDirection: sortDirection.value,
  },
))

const hasTransactions = computed(() =>
  props.segments.some((s) =>
    s.rows.some((r) => showDuplicates.value || !r.duplicateOf)
  )
)
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

.account-transaction-list__toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--bdg-secondary);
  background-color: var(--bdg-surface);
}

.account-transaction-list__toggle-duplicates {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.75rem;
  font: inherit;
  font-size: 0.75rem;
  cursor: pointer;
  border: 1px solid var(--bdg-secondary);
  border-radius: 999px;
  background: transparent;
  color: var(--bdg-on-surface);
  opacity: 0.6;
  transition: opacity 0.15s, border-color 0.15s, color 0.15s;
}

.account-transaction-list__toggle-duplicates--active {
  opacity: 1;
  border-color: var(--bdg-primary);
  color: var(--bdg-primary);
}

.account-transaction-list__header,
.account-transaction-list__row {
  display: grid;
  grid-template-columns: minmax(9rem, auto) minmax(8rem, auto) 1fr minmax(7rem, auto);
  gap: 0 0.75rem;
  align-items: center;
  padding: 0.375rem 0.75rem;
}

.account-transaction-list__header--with-balance,
.account-transaction-list__row--with-balance {
  grid-template-columns: minmax(9rem, auto) minmax(8rem, auto) 1fr minmax(7rem, auto) minmax(8rem, auto);
}

.account-transaction-list__header {
  font-weight: 600;
  background-color: var(--bdg-surface);
  border-bottom: 1px solid var(--bdg-secondary);
  position: sticky;
  top: 0;
  z-index: 1;
}

.account-transaction-list__sort-button {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  width: 100%;
  padding: 0;
  border: 0;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: transparent;
}

.account-transaction-list__sort-button--amount {
  justify-content: flex-end;
}

.account-transaction-list__sort-icon {
  opacity: 0.7;
}

.account-transaction-list__row--even {
  background-color: var(--bdg-background);
}

.account-transaction-list__row--odd {
  background-color: var(--bdg-surface);
}

.account-transaction-list__cell--amount,
.account-transaction-list__cell--balance {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.account-transaction-list__cell--balance {
  font-weight: 600;
}

.account-transaction-list__cell--amount-positive {
  color: var(--bdg-accent);
}

.account-transaction-list__cell--amount-negative {
  color: var(--bdg-error);
}

.account-transaction-list__row--snapshot {
  background-color: var(--bdg-surface);
  border-top: 1px dashed var(--bdg-secondary);
  border-bottom: 1px dashed var(--bdg-secondary);
  opacity: 0.8;
}

.account-transaction-list__cell--snapshot-label {
  font-style: italic;
  opacity: 0.7;
}

.account-transaction-list__duplicate-icon {
  margin-left: 0.3rem;
  opacity: 0.45;
  vertical-align: middle;
}

.account-transaction-list__row--duplicate {
  text-decoration: line-through;
  opacity: 0.5;
}

.account-transaction-list__empty {
  margin: 0.75rem;
  opacity: 0.6;
}
</style>

