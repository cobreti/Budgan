import 'reflect-metadata'
import { injectable } from 'inversify'
import { InversifyUtils } from '@inversify/inversify-utils.ts'

export abstract class ReaderFactory {
    static readonly bindingTypeId: string = InversifyUtils.createBindingId('FileReaderFactory')

    abstract createReader(): FileReader
}

@injectable()
export class FileReaderFactoryImpl extends ReaderFactory {
    createReader(): FileReader {
        return new FileReader()
    }
}
