import 'reflect-metadata'
import { injectable } from 'inversify'
import { InversifyUtils } from '@inversify/inversify-utils.ts'

export abstract class FileReadService {
  static readonly bindingTypeId: string = InversifyUtils.createBindingId('FileReadService')

  abstract readAsBytes(handle: FileSystemFileHandle): Promise<Uint8Array>
}

@injectable()
export class FileReadServiceImpl extends FileReadService {
  async readAsBytes(handle: FileSystemFileHandle): Promise<Uint8Array> {
    const file = await handle.getFile()
    return new Uint8Array(await file.arrayBuffer())
  }
}
