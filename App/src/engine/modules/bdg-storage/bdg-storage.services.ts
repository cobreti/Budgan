import type { BdgSettingsService } from '@engine/modules/bdg-storage/bdg-settings.service.ts'
import { InversifyUtils } from '@inversify/inversify-utils.ts'

export abstract class BdgStorageService {
  static readonly bindingTypeId: string = InversifyUtils.createBindingId('bdg-storage-service')

  abstract getSettingsService(): BdgSettingsService
}
