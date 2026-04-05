export interface BdgAccount {
  id: string
  name: string
  columnMappingId: string
}

export class BdgAccountImpl implements BdgAccount {
  private readonly _id: string
  private _name: string
  private _columnMappingId: string

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
}
