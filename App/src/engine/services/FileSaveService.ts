import 'reflect-metadata'
import { injectable } from 'inversify'
import { InversifyUtils } from '@inversify/inversify-utils.ts'
import { unzip, zip } from 'fflate'

export enum ZipEntry {
  Workspace = 'Workspace.json',
  Settings = 'Settings.json',
}

export const CSV_SOURCES_PREFIX = 'CsvSources/'

export abstract class FileSaveService {
  static readonly bindingTypeId: string = InversifyUtils.createBindingId('file-save-service')

  abstract saveJson(handle: FileSystemFileHandle, content: unknown): Promise<void>
  abstract saveWorkspace(
    handle: FileSystemFileHandle,
    workspaceContent: unknown,
    settingsContent: unknown,
    csvSources?: Record<string, { filename: string; content: string }>,
  ): Promise<void>
}

@injectable()
export class FileSaveServiceImpl extends FileSaveService {
  async saveJson(handle: FileSystemFileHandle, content: unknown): Promise<void> {
    const json = JSON.stringify(content, null, 2)
    const writable = await handle.createWritable()
    await writable.write(json)
    await writable.close()
  }

  async saveWorkspace(
    handle: FileSystemFileHandle,
    workspaceContent: unknown,
    settingsContent: unknown,
    csvSources?: Record<string, { filename: string; content: string }>,
  ): Promise<void> {
    const entries = await this._readExistingZipEntries(handle)
    const encoder = new TextEncoder()
    entries[ZipEntry.Workspace] = encoder.encode(JSON.stringify(workspaceContent, null, 2))
    entries[ZipEntry.Settings] = encoder.encode(JSON.stringify(settingsContent, null, 2))
    if (csvSources) {
      for (const [segmentId, source] of Object.entries(csvSources)) {
        entries[`${CSV_SOURCES_PREFIX}${segmentId}`] = encoder.encode(source.content)
      }
    }
    const result = await this._zipEntries(entries)
    const writable = await handle.createWritable()
    await writable.write(result.buffer as ArrayBuffer)
    await writable.close()
  }

  private _readExistingZipEntries(handle: FileSystemFileHandle): Promise<Record<string, Uint8Array>> {
    return new Promise(async (resolve, reject) => {
      let file: File
      try {
        file = await handle.getFile()
      } catch {
        resolve({})
        return
      }

      if (file.size === 0) {
        resolve({})
        return
      }

      const buffer = new Uint8Array(await file.arrayBuffer())
      unzip(buffer, (err, data) => {
        if (err) reject(err)
        else resolve(data as Record<string, Uint8Array>)
      })
    })
  }

  private _zipEntries(entries: Record<string, Uint8Array>): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      zip(entries, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }
}
