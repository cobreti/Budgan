import { inject } from 'inversify'
import { InversifyUtils } from '@inversify/inversify-utils'
import { BdgWorkspaceImpl, type BdgWorkspace } from './bdg-workspace'
import type { BdgAccount } from './bdg-account'
import { IdGenerator } from '@engine/services/IdGenerator'
import type { BdgColumnMapping } from '@engine/modules/bdg-settings/bdg-column-mapping'
import { BdgStorageService } from '@engine/modules/bdg-storage/bdg-storage.services.ts'

export abstract class BdgWorkspaceFactory {
  static readonly bindingTypeId: string = InversifyUtils.createBindingId('WorkspaceFactory')

  abstract createWorkspace(): BdgWorkspace
  abstract reconstructWorkspace(
    id: string,
    name: string,
    accounts: BdgAccount[],
    columnMappings?: BdgColumnMapping[],
  ): BdgWorkspace
}

export class BdgWorkspaceFactoryImpl extends BdgWorkspaceFactory {
  private idGenerator: IdGenerator
  private storageService: BdgStorageService

  constructor(@inject(IdGenerator.bindingTypeId) idGenerator: IdGenerator,
              @inject(BdgStorageService.bindingTypeId) storageService: BdgStorageService) {
    super()
    this.idGenerator = idGenerator
    this.storageService = storageService
  }

  createWorkspace(): BdgWorkspace {
    return new BdgWorkspaceImpl(this.idGenerator, this.storageService, this.idGenerator.generateId())
  }

  reconstructWorkspace(
    id: string,
    name: string,
    accounts: BdgAccount[],
    columnMappings: BdgColumnMapping[] = [],
  ): BdgWorkspace {
    const workspace = new BdgWorkspaceImpl(this.idGenerator, this.storageService, id)
    workspace.name = name
    for (const account of accounts) {
      workspace.loadAccount(account)
    }
    for (const mapping of columnMappings) {
      workspace.settings.addColumnMapping(mapping)
    }
    return workspace
  }
}
