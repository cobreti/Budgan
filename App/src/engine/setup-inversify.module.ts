import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify'
import { FileReaderFactoryImpl, ReaderFactory } from '@engine/services/FileReaderFactory'
import { IdGenerator, IdGeneratorImpl } from '@engine/services/IdGenerator'
import {
  BdgWorkspaceFactory,
  BdgWorkspaceFactoryImpl
} from './modules/bdg-workspace/bdg-workspace-factory'

export const engineModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<ReaderFactory>(ReaderFactory.bindingTypeId).to(FileReaderFactoryImpl)
  options.bind<IdGenerator>(IdGenerator.bindingTypeId).to(IdGeneratorImpl)
  options
    .bind<BdgWorkspaceFactory>(BdgWorkspaceFactory.bindingTypeId)
    .to(BdgWorkspaceFactoryImpl)
    .inSingletonScope()
})
