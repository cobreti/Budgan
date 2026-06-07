import type { BdgSettingsService } from '@engine/modules/bdg-storage/bdg-settings.service.ts'
import type { BdgColumnMapping } from '@engine/modules/bdg-settings/bdg-column-mapping.ts'
import type {
  ColumnMappingEntry,
  IndexDBDatabase
} from '@engine/modules/bdg-storage/indexdb/indexdb-database-impl.ts'
import Dexie from 'dexie'

export class IndexDbSettingsService implements BdgSettingsService {
  constructor(private _database: IndexDBDatabase) {}

  async save(workspaceId: string, columnMapping: BdgColumnMapping): Promise<void> {
    const columnMappingEntry: ColumnMappingEntry = {
      id: columnMapping.id,
      workspaceId: workspaceId,
      name: columnMapping.name,
      columnMapping: columnMapping.columnMapping
    }

    this._database.columnMapping.add(columnMappingEntry)
  }

  async update(workspaceId: string, columnMapping: BdgColumnMapping): Promise<void> {
    const columnMappingEntry: ColumnMappingEntry = {
      id: columnMapping.id,
      workspaceId: workspaceId,
      name: columnMapping.name,
      columnMapping: columnMapping.columnMapping
    }

    this._database.columnMapping.put(columnMappingEntry)
  }

  async remove(workspaceId: string, columnMappingId: string): Promise<void> {
    this._database.columnMapping.delete(columnMappingId)
  }
}
