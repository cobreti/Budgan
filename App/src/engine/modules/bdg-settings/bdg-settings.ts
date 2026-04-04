import { InversifyUtils } from '@inversify/inversify-utils.ts'
import type { BdgColumnMapping } from '@engine/modules/bdg-settings/bdg-column-mapping.ts'

export abstract class BdgSettings {
  static readonly bindingTypeId: string = InversifyUtils.createBindingId('BdgSettings')

  abstract get columnMappings(): BdgColumnMapping[]
}

export class BdgSettingsImpl extends BdgSettings {

  private _columnMappings: BdgColumnMapping[] = []

  constructor() {
    super()
  }

  get columnMappings(): BdgColumnMapping[] {
    return this._columnMappings
  }
}
