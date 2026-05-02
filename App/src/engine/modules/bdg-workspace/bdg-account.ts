import moment from 'moment'
import type { BdgAccountSegment } from './bdg-account-segment'
import type { CsvContentSegment } from './csv-content-segment'

/**
 * A user-provided balance anchor: the known real-world account balance on a specific date.
 * Example: "On 2026-01-15 my bank statement showed $3,450.00."
 * Used as the starting point to back-calculate the reference balance.
 */
export type BdgAccountBalanceSnapshot = {
  amount: number
  dateAsString: string
  date: Date
}

/**
 * A derived starting balance used to compute the running balance from the very first transaction.
 * Its date is always 1 calendar day before the earliest transaction in the account, so adding
 * all non-duplicate transactions in chronological order from this point yields the correct
 * balance at any later date.
 *
 * Calculated as:
 *   referenceBalance.amount = balanceSnapshot.amount − sum(all non-duplicate transactions ≤ snapshot date)
 *
 * Never persisted — always recalculated from the snapshot and the current segments.
 * Null when no balance snapshot is set or when the account has no transactions yet.
 */
export type BdgAccountReferenceBalance = {
  amount: number
  dateAsString: string
  date: Date
}

export interface BdgAccount {
  id: string
  name: string
  columnMappingId: string
  segments: BdgAccountSegment[]
  addSegment(segment: BdgAccountSegment): void
  removeSegment(segmentId: string): void
  csvContentSegments: CsvContentSegment[]
  addCsvContentSegment(segment: CsvContentSegment): void
  getCsvContentSegment(segmentId: string): CsvContentSegment | undefined
  balanceSnapshot: BdgAccountBalanceSnapshot | null
  referenceBalance: BdgAccountReferenceBalance | null
  setBalanceSnapshot(amount: number, dateAsString: string): void
  clearBalanceSnapshot(): void
}

export class BdgAccountImpl implements BdgAccount {
  private readonly _id: string
  private _name: string
  private _columnMappingId: string
  private _segments: BdgAccountSegment[] = []
  private _csvContentSegments: CsvContentSegment[] = []
  private _balanceSnapshot: BdgAccountBalanceSnapshot | null = null
  private _referenceBalance: BdgAccountReferenceBalance | null = null

  constructor(id: string, name: string, columnMappingId: string) {
    this._id = id
    this._name = name
    this._columnMappingId = columnMappingId
  }

  get id(): string {
    return this._id
  }

  get name(): string {
    return this._name
  }

  set name(value: string) {
    this._name = value
  }

  get columnMappingId(): string {
    return this._columnMappingId
  }

  set columnMappingId(value: string) {
    this._columnMappingId = value
  }

  get segments(): BdgAccountSegment[] {
    return this._segments
  }

  addSegment(segment: BdgAccountSegment): void {
    const existingKeys = new Set<string>()
    for (const s of this._segments) {
      for (const r of s.rows) {
        existingKeys.add(r.key)
      }
    }

    for (const row of segment.rows) {
      if (existingKeys.has(row.key)) {
        row.duplicateOf = row.key
      }
    }

    this._segments.push(segment)
    this._recalculateReferenceBalance()
  }

  removeSegment(segmentId: string): void {
    this._segments = this._segments.filter((s) => s.id !== segmentId)
    this._recalculateReferenceBalance()
  }

  get balanceSnapshot(): BdgAccountBalanceSnapshot | null {
    return this._balanceSnapshot
  }

  get referenceBalance(): BdgAccountReferenceBalance | null {
    return this._referenceBalance
  }

  setBalanceSnapshot(amount: number, dateAsString: string): void {
    this._balanceSnapshot = { amount, dateAsString, date: moment(dateAsString).toDate() }
    this._recalculateReferenceBalance()
  }

  clearBalanceSnapshot(): void {
    this._balanceSnapshot = null
    this._referenceBalance = null
  }

  private _recalculateReferenceBalance(): void {
    if (!this._balanceSnapshot) {
      this._referenceBalance = null
      return
    }

    const rows = this._segments
      .flatMap((s) => s.rows)
      .filter((r) => !r.duplicateOf && r.dateTransaction !== undefined)

    if (rows.length === 0) {
      this._referenceBalance = null
      return
    }

    const minTime = Math.min(...rows.map((r) => r.dateTransaction!.getTime()))
    const refMoment = moment(minTime).subtract(1, 'day')

    const snapshotTime = this._balanceSnapshot.date.getTime()
    const txSum = rows
      .filter((r) => r.dateTransaction!.getTime() <= snapshotTime)
      .reduce((acc, r) => acc + r.amount, 0)

    this._referenceBalance = {
      amount: this._balanceSnapshot.amount - txSum,
      dateAsString: refMoment.format('YYYY-MM-DD'),
      date: refMoment.toDate(),
    }
  }

  get csvContentSegments(): CsvContentSegment[] {
    return this._csvContentSegments
  }

  addCsvContentSegment(segment: CsvContentSegment): void {
    this._csvContentSegments.push(segment)
  }

  getCsvContentSegment(segmentId: string): CsvContentSegment | undefined {
    return this._csvContentSegments.find((s) => s.segmentId === segmentId)
  }
}
