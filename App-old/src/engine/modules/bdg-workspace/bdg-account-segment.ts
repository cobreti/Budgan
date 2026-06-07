import moment from 'moment'

function parseLocalDate(value: string): Date | undefined {
  const m = moment(value)
  return m.isValid() ? m.toDate() : undefined
}

export interface BdgAccountSegmentRow {
  key: string
  cardNumber: string
  description: string
  dateInscriptionAsString: string
  dateTransactionAsString?: string
  dateInscription?: Date
  dateTransaction?: Date
  amount: number
  duplicateOf?: string
}

export function computeRowKey(row: Omit<BdgAccountSegmentRow, 'key'>): string {
  return `${row.cardNumber}|${row.dateInscriptionAsString}|${row.amount}|${row.description}`
}

export interface BdgAccountSegment {
  id: string
  name: string
  dateStartAsString: string
  dateEndAsString: string
  dateStart: Date
  dateEnd: Date
  rows: BdgAccountSegmentRow[]
}

export class BdgAccountSegmentImpl implements BdgAccountSegment {
  private readonly _id: string
  private readonly _name: string
  private readonly _dateStartAsString: string
  private readonly _dateEndAsString: string
  private readonly _dateStart: Date
  private readonly _dateEnd: Date
  private readonly _rows: BdgAccountSegmentRow[]

  constructor(id: string, name: string, rows: BdgAccountSegmentRow[]) {
    if (rows.length === 0) {
      throw new Error('BdgAccountSegment: rows cannot be empty')
    }

    this._id = id
    this._name = name
    this._rows = rows

    // Prepopulate dateInscription on each row from dateInscriptionAsString before finding min/max
    for (const row of this._rows) {
      if (!row.dateInscription) {
        const parsed = parseLocalDate(row.dateInscriptionAsString)
        if (parsed !== undefined) {
          row.dateInscription = parsed
        }
      }
    }

    const dates = this._rows
      .map(r => r.dateInscription)
      .filter((d): d is Date => d !== undefined)

    const minTime = Math.min(...dates.map(d => d.getTime()))
    const maxTime = Math.max(...dates.map(d => d.getTime()))

    const minRow = this._rows.find(r => r.dateInscription?.getTime() === minTime)
    const maxRow = this._rows.find(r => r.dateInscription?.getTime() === maxTime)

    // Use the original string from the matching row; fall back to ISO string if needed
    this._dateStartAsString = minRow?.dateInscriptionAsString ?? new Date(minTime).toISOString()
    this._dateEndAsString = maxRow?.dateInscriptionAsString ?? new Date(maxTime).toISOString()

    // Set dateStart / dateEnd by parsing the resolved strings
    this._dateStart = parseLocalDate(this._dateStartAsString) ?? new Date(minTime)
    this._dateEnd = parseLocalDate(this._dateEndAsString) ?? new Date(maxTime)
  }

  get id(): string {
    return this._id
  }

  get name(): string {
    return this._name
  }

  get dateStartAsString(): string {
    return this._dateStartAsString
  }

  get dateEndAsString(): string {
    return this._dateEndAsString
  }

  get dateStart(): Date {
    return this._dateStart
  }

  get dateEnd(): Date {
    return this._dateEnd
  }

  get rows(): BdgAccountSegmentRow[] {
    return this._rows
  }
}

