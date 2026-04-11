export interface BdgAccountSegmentRow {
  cardNumber: string
  description: string
  dateTransactionAsString: string
  dateInscriptionAsString?: string
  dateTransaction?: Date
  dateInscription?: Date
  amount: number
}

export class BdgAccountSegment {
  private readonly _name: string
  private readonly _dateStartAsString: string
  private readonly _dateEndAsString: string
  private readonly _dateStart: Date
  private readonly _dateEnd: Date
  private readonly _rows: BdgAccountSegmentRow[]

  constructor(name: string, rows: BdgAccountSegmentRow[]) {
    if (rows.length === 0) {
      throw new Error('BdgAccountSegment: rows cannot be empty')
    }

    this._name = name
    this._rows = rows

    // Prepopulate dateTransaction on each row from dateTransactionAsString before finding min/max
    for (const row of this._rows) {
      if (!row.dateTransaction) {
        const parsed = new Date(row.dateTransactionAsString)
        if (!isNaN(parsed.getTime())) {
          row.dateTransaction = parsed
        }
      }
    }

    const dates = this._rows
      .map(r => r.dateTransaction)
      .filter((d): d is Date => d !== undefined)

    const minTime = Math.min(...dates.map(d => d.getTime()))
    const maxTime = Math.max(...dates.map(d => d.getTime()))

    const minRow = this._rows.find(r => r.dateTransaction?.getTime() === minTime)
    const maxRow = this._rows.find(r => r.dateTransaction?.getTime() === maxTime)

    // Use the original string from the matching row; fall back to ISO string if needed
    this._dateStartAsString = minRow?.dateTransactionAsString ?? new Date(minTime).toISOString()
    this._dateEndAsString = maxRow?.dateTransactionAsString ?? new Date(maxTime).toISOString()

    // Set dateStart / dateEnd by parsing the resolved strings
    this._dateStart = new Date(this._dateStartAsString)
    this._dateEnd = new Date(this._dateEndAsString)
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

