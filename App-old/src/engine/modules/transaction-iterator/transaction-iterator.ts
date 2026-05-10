import type { BdgAccountSegment, BdgAccountSegmentRow } from '@engine/modules/bdg-workspace/bdg-account-segment'
import type { BdgAccountBalanceSnapshot, BdgAccountReferenceBalance } from '@engine/modules/bdg-workspace/bdg-account'

export type TransactionSortColumn = 'cardNumber' | 'dateInscription' | 'description' | 'amount'
export type TransactionSortDirection = 'asc' | 'desc'

export type TransactionIteratorStartItem = {
  kind: 'start'
  dateAsString: string
  amount: number
}

export type TransactionIteratorTransactionItem = {
  kind: 'transaction'
  row: BdgAccountSegmentRow
  runningBalance: number
}

export type TransactionIteratorSnapshotItem = {
  kind: 'snapshot'
  dateAsString: string
  date: Date
  amount: number
}

export type TransactionIteratorItem =
  | TransactionIteratorStartItem
  | TransactionIteratorTransactionItem
  | TransactionIteratorSnapshotItem

export interface TransactionIteratorOptions {
  includeDuplicates?: boolean
  sortColumn?: TransactionSortColumn
  sortDirection?: TransactionSortDirection
}

function compareText(left: string, right: string): number {
  return left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' })
}

function compareRows(
  left: BdgAccountSegmentRow,
  right: BdgAccountSegmentRow,
  sortColumn: TransactionSortColumn,
  sortDirection: TransactionSortDirection,
): number {
  let result: number

  if (sortColumn === 'cardNumber') {
    result = compareText(left.cardNumber, right.cardNumber)
  } else if (sortColumn === 'dateInscription') {
    const leftDate = left.dateInscription?.getTime()
    const rightDate = right.dateInscription?.getTime()
    if (leftDate !== undefined && rightDate !== undefined) {
      result = leftDate - rightDate
    } else {
      result = compareText(left.dateInscriptionAsString, right.dateInscriptionAsString)
    }
  } else if (sortColumn === 'description') {
    result = compareText(left.description, right.description)
  } else {
    result = left.amount - right.amount
  }

  if (result === 0) {
    result = compareText(left.key, right.key)
  }

  return sortDirection === 'asc' ? result : -result
}

export class TransactionIterator implements Iterable<TransactionIteratorItem> {
  private readonly _segments: BdgAccountSegment[]
  private readonly _referenceBalance: BdgAccountReferenceBalance | null
  private readonly _balanceSnapshot: BdgAccountBalanceSnapshot | null
  private readonly _options: Required<TransactionIteratorOptions>

  constructor(
    segments: BdgAccountSegment[],
    referenceBalance: BdgAccountReferenceBalance | null,
    balanceSnapshot: BdgAccountBalanceSnapshot | null,
    options?: TransactionIteratorOptions,
  ) {
    this._segments = segments
    this._referenceBalance = referenceBalance
    this._balanceSnapshot = balanceSnapshot
    this._options = {
      includeDuplicates: options?.includeDuplicates ?? false,
      sortColumn: options?.sortColumn ?? 'dateInscription',
      sortDirection: options?.sortDirection ?? 'asc',
    }
  }

  [Symbol.iterator](): Iterator<TransactionIteratorItem> {
    return this._generate()
  }

  private *_generate(): Generator<TransactionIteratorItem> {
    const { includeDuplicates, sortColumn, sortDirection } = this._options

    // Phase 1 — build running balance map chronologically
    const chronoRows = this._segments
      .flatMap((s) => s.rows)
      .filter((r) => (includeDuplicates || !r.duplicateOf) && r.dateInscription instanceof Date)
      .sort((a, b) => a.dateInscription!.getTime() - b.dateInscription!.getTime())

    const runningBalanceByKey = new Map<string, number>()
    let balance = this._referenceBalance?.amount ?? 0
    for (const row of chronoRows) {
      balance = Math.round((balance + row.amount) * 100) / 100
      runningBalanceByKey.set(row.key, balance)
    }

    // Phase 2 — yield start item
    if (this._referenceBalance) {
      yield { kind: 'start', dateAsString: this._referenceBalance.dateAsString, amount: this._referenceBalance.amount }
    }

    // Phase 3 — sort all rows for display (includes rows without dateInscription for non-date sorts)
    const allRows = this._segments
      .flatMap((s) => s.rows)
      .filter((r) => includeDuplicates || !r.duplicateOf)
      .sort((a, b) => compareRows(a, b, sortColumn, sortDirection))

    // Phase 4 — yield rows, merging snapshot at the correct position
    const snapshot = this._balanceSnapshot
    let snapshotYielded = false

    if (snapshot && sortColumn !== 'dateInscription') {
      yield { kind: 'snapshot', dateAsString: snapshot.dateAsString, date: snapshot.date, amount: snapshot.amount }
      snapshotYielded = true
    }

    for (const row of allRows) {
      // When sorting by date, insert snapshot before the first row whose date passes the snapshot
      if (snapshot && !snapshotYielded && sortColumn === 'dateInscription') {
        const rowTime = row.dateInscription?.getTime()
        const snapshotTime = snapshot.date.getTime()
        const pastSnapshot = rowTime !== undefined && (
          sortDirection === 'asc' ? rowTime > snapshotTime : rowTime < snapshotTime
        )
        if (pastSnapshot) {
          yield { kind: 'snapshot', dateAsString: snapshot.dateAsString, date: snapshot.date, amount: snapshot.amount }
          snapshotYielded = true
        }
      }

      yield {
        kind: 'transaction',
        row,
        runningBalance: runningBalanceByKey.get(row.key) ?? 0,
      }
    }

    // Snapshot after all rows (date is beyond last transaction, or non-date sort with rows already yielded)
    if (snapshot && !snapshotYielded) {
      yield { kind: 'snapshot', dateAsString: snapshot.dateAsString, date: snapshot.date, amount: snapshot.amount }
    }
  }
}
