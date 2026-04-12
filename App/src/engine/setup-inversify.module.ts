import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify'
import { FileReaderFactoryImpl, ReaderFactory } from '@engine/services/FileReaderFactory'
import { IdGenerator, IdGeneratorImpl } from '@engine/services/IdGenerator'
import {
  BdgWorkspaceFactory,
  BdgWorkspaceFactoryImpl
} from './modules/bdg-workspace/bdg-workspace-factory'
import { BdgSettings, BdgSettingsImpl } from '@engine/modules/bdg-settings/bdg-settings.ts'
import {
  CsvContentImporter,
  CsvContentImporterImpl,
} from '@engine/modules/csv-import/csv-content-importer'

export const engineModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
  options.bind<ReaderFactory>(ReaderFactory.bindingTypeId).to(FileReaderFactoryImpl)
  options.bind<IdGenerator>(IdGenerator.bindingTypeId).to(IdGeneratorImpl)
  options
    .bind<BdgWorkspaceFactory>(BdgWorkspaceFactory.bindingTypeId)
    .to(BdgWorkspaceFactoryImpl)
    .inSingletonScope()
  options
    .bind<BdgSettings>(BdgSettings.bindingTypeId)
    .to(BdgSettingsImpl)
    .inSingletonScope()
  options.bind<CsvContentImporter>(CsvContentImporter.bindingTypeId).to(CsvContentImporterImpl)
})
