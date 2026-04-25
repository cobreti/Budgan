import { InversifyUtils } from '@inversify/inversify-utils.ts'
import type { BdgColumnMapping } from '@engine/modules/bdg-settings/bdg-column-mapping.ts'

export abstract class BdgSettings {
  static readonly bindingTypeId: string = InversifyUtils.createBindingId('BdgSettings')

  abstract get columnMappings(): BdgColumnMapping[]
  abstract updateColumnMapping(mapping: BdgColumnMapping): void
  abstract addColumnMapping(mapping: BdgColumnMapping): void
  abstract removeColumnMapping(id: string): void
}

export class BdgSettingsImpl extends BdgSettings {

  private _columnMappings: BdgColumnMapping[] = []

  constructor() {
    super()
  }

  get columnMappings(): BdgColumnMapping[] {
    return this._columnMappings
  }

  updateColumnMapping(mapping: BdgColumnMapping): void {
    const index = this._columnMappings.findIndex((m) => m.id === mapping.id)
    if (index !== -1) {
      this._columnMappings[index] = mapping
    } else {
      throw new Error(`Mapping with id ${mapping.id} not found`)
    }
  }

  addColumnMapping(mapping: BdgColumnMapping): void {
    const exists = this._columnMappings.some((m) => m.id === mapping.id)
    if (exists) {
      throw new Error(`Mapping with id ${mapping.id} already exists`)
    }
    this._columnMappings.push(mapping)
  }

  removeColumnMapping(id: string): void {
    const index = this._columnMappings.findIndex((m) => m.id === id)
    if (index !== -1) {
      this._columnMappings.splice(index, 1)
    } else {
      throw new Error(`Mapping with id ${id} not found`)
    }
  }
}
