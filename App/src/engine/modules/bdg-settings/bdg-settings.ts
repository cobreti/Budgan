import type { BdgColumnMapping } from '@engine/modules/bdg-settings/bdg-column-mapping.ts'
import type { BdgSettingsService } from '@engine/modules/bdg-storage/bdg-settings.service.ts'

export abstract class BdgSettings {
  abstract getColumnMappings(): Promise<BdgColumnMapping[]>
  abstract updateColumnMapping(mapping: BdgColumnMapping): Promise<void>
  abstract addColumnMapping(mapping: BdgColumnMapping): Promise<void>
  abstract removeColumnMapping(id: string): Promise<void>
}

export class BdgSettingsImpl extends BdgSettings {

  // private _columnMappings: BdgColumnMapping[] = []
  private _settingsService: BdgSettingsService
  private readonly _workspaceId: string

  constructor(workspaceId: string, settingsService: BdgSettingsService) {
    super()

    this._workspaceId = workspaceId
    this._settingsService = settingsService
  }

  getColumnMappings(): Promise<BdgColumnMapping[]> {
    return this._settingsService.get(this._workspaceId)
  }

  async updateColumnMapping(mapping: BdgColumnMapping): Promise<void> {

    await this._settingsService.update(this._workspaceId, mapping)

    // const index = this._columnMappings.findIndex((m) => m.id === mapping.id)
    // if (index !== -1) {
    //   this._columnMappings[index] = mapping
    // } else {
    //   throw new Error(`Mapping with id ${mapping.id} not found`)
    // }
  }

  async addColumnMapping(mapping: BdgColumnMapping): Promise<void> {

    await this._settingsService.save(this._workspaceId, mapping)

    // const exists = this._columnMappings.some((m) => m.id === mapping.id)
    // if (exists) {
    //   throw new Error(`Mapping with id ${mapping.id} already exists`)
    // }
    // this._columnMappings.push(mapping)
  }

  async removeColumnMapping(id: string): Promise<void> {

    await this._settingsService.remove(this._workspaceId, id)

    // const index = this._columnMappings.findIndex((m) => m.id === id)
    // if (index !== -1) {
    //   this._columnMappings.splice(index, 1)
    // } else {
    //   throw new Error(`Mapping with id ${id} not found`)
    // }
  }
}
