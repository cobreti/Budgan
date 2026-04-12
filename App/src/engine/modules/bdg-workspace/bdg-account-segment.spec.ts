import { describe, expect, test } from 'vitest'
import { BdgAccountSegmentImpl, type BdgAccountSegmentRow } from './bdg-account-segment'

const baseRow: BdgAccountSegmentRow = {
  cardNumber: '1234',
  description: 'Coffee',
  dateTransactionAsString: '2024-03-15',
  amount: -4.2,
}

describe('BdgAccountSegment', () => {
  test('stores and exposes the id passed to the constructor', () => {
    const segment = new BdgAccountSegmentImpl('segment-id-1', 'March', [baseRow])
    expect(segment.id).toBe('segment-id-1')
  })

  test('stores and exposes the name passed to the constructor', () => {
    const segment = new BdgAccountSegmentImpl('segment-id-2', 'March Statement', [baseRow])
    expect(segment.name).toBe('March Statement')
  })

  test('throws when rows array is empty', () => {
    expect(() => new BdgAccountSegmentImpl('segment-id-3', 'Empty', [])).toThrow(
      'BdgAccountSegment: rows cannot be empty',
    )
  })

  test('derives dateStartAsString and dateEndAsString from row dates', () => {
    // Use fresh objects (not baseRow spread) — the segment constructor mutates rows by
    // assigning dateTransaction, so spreading baseRow after another test has run would
    // carry over the stale dateTransaction value, causing all rows to compare equal.
    const makeRow = (date: string, amount: number): BdgAccountSegmentRow => ({
      cardNumber: '1234',
      description: 'Coffee',
      dateTransactionAsString: date,
      amount,
    })
    const rows = [makeRow('2024-03-01', -1), makeRow('2024-03-15', -2), makeRow('2024-03-31', -3)]
    const segment = new BdgAccountSegmentImpl('segment-id-4', 'March', rows)
    expect(segment.dateStartAsString).toBe('2024-03-01')
    expect(segment.dateEndAsString).toBe('2024-03-31')
  })

  test('exposes rows unchanged', () => {
    const segment = new BdgAccountSegmentImpl('segment-id-5', 'March', [baseRow])
    expect(segment.rows).toHaveLength(1)
    expect(segment.rows[0].description).toBe('Coffee')
  })
})
