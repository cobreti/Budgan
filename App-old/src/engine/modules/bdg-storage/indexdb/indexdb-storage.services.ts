import { BdgStorageService } from '@engine/modules/bdg-storage/bdg-storage.services.ts'
import type { BdgSettingsService } from '@engine/modules/bdg-storage/bdg-settings.service.ts'
import { IndexDbSettingsService } from '@engine/modules/bdg-storage/indexdb/indexdb-settings.service.ts'
import { IndexdbDatabaseImpl } from './indexdb-database-impl.ts'

export class IndexDbStorageService extends BdgStorageService {
  private readonly _database: IndexdbDatabaseImpl;
  private readonly _settingsService: BdgSettingsService;

  constructor() {
    super()

    this._database = new IndexdbDatabaseImpl();
    this._settingsService = new IndexDbSettingsService(this._database)
  }

  getSettingsService(): BdgSettingsService {
    return this._settingsService;
  }
}
