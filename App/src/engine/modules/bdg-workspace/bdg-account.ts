import type { BdgAccountSegment } from './bdg-account-segment'
import type { CsvContentSegment } from './csv-content-segment'

export interface BdgAccount {
  id: string
  name: string
  columnMappingId: string
  segments: BdgAccountSegment[]
  addSegment(segment: BdgAccountSegment): void
  csvContentSegments: CsvContentSegment[]
  addCsvContentSegment(segment: CsvContentSegment): void
  getCsvContentSegment(segmentId: string): CsvContentSegment | undefined
}

export class BdgAccountImpl implements BdgAccount {
  private readonly _id: string
  private _name: string
  private _columnMappingId: string
  private _segments: BdgAccountSegment[] = []
  private _csvContentSegments: CsvContentSegment[] = []

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
    this._segments.push(segment)
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
