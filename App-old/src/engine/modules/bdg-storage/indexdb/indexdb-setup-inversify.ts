import type { ContainerModuleLoadOptions } from 'inversify'
import { IndexDbStorageService } from '@engine/modules/bdg-storage/indexdb/indexdb-storage.services.ts'

export function setupIndexDbInversify(options: ContainerModuleLoadOptions) {
  options
    .bind<IndexDbStorageService>(IndexDbStorageService.bindingTypeId)
    .to(IndexDbStorageService)
    .inSingletonScope();
}
