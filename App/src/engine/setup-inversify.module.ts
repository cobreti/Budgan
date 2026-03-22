import { ContainerModule, type ContainerModuleLoadOptions } from 'inversify'
import { FileReaderFactoryImpl, ReaderFactory } from '@engine/services/FileReaderFactory'
import { IdGenerator, IdGeneratorImpl } from '@engine/services/IdGenerator'
import { CsvToBankAccount, CsvToBankAccountImpl } from '@engine/services/CsvToBankAccount.ts'

export const engineModule = new ContainerModule((options: ContainerModuleLoadOptions) => {
    options.bind<ReaderFactory>(ReaderFactory.bindingTypeId).to(FileReaderFactoryImpl)
    options.bind<IdGenerator>(IdGenerator.bindingTypeId).to(IdGeneratorImpl)
    options.bind<CsvToBankAccount>(CsvToBankAccount.bindingTypeId).to(CsvToBankAccountImpl)
})
