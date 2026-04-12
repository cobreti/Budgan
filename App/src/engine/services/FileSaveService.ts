import 'reflect-metadata'
import { injectable } from 'inversify'
import { InversifyUtils } from '@inversify/inversify-utils.ts'

export abstract class FileSaveService {
  static readonly bindingTypeId: string = InversifyUtils.createBindingId('file-save-service')

  abstract saveJson(handle: FileSystemFileHandle, content: unknown): Promise<void>
}

@injectable()
export class FileSaveServiceImpl extends FileSaveService {
  async saveJson(handle: FileSystemFileHandle, content: unknown): Promise<void> {
    const json = JSON.stringify(content, null, 2)
    const writable = await handle.createWritable()
    await writable.write(json)
    await writable.close()
  }
}
