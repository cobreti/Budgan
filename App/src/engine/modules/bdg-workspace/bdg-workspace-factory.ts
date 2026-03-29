import { inject } from 'inversify'
import { InversifyUtils } from '@/inversify/inversify-utils'
import { BdgWorkspaceImpl, type BdgWorkspace } from './bdg-workspace'
import { IdGenerator } from '@/engine/services/IdGenerator'

export abstract class BdgWorkspaceFactory {
  static readonly bindingTypeId: string = InversifyUtils.createBindingId('WorkspaceFactory')

  abstract createWorkspace(): BdgWorkspace
}

export class BdgWorkspaceFactoryImpl extends BdgWorkspaceFactory {
  private idGenerator: IdGenerator

  constructor(@inject(IdGenerator.bindingTypeId) idGenerator: IdGenerator) {
    super()
    this.idGenerator = idGenerator
  }

  createWorkspace(): BdgWorkspace {
    return new BdgWorkspaceImpl(this.idGenerator, this.idGenerator.generateId())
  }
}
