import { injectable } from 'inversify'
import type { Workspace } from './Workspace'
import * as fflate from 'fflate'
import { WorkspaceFolders } from './workspace-types'

@injectable()
export class WorkspaceImpl implements Workspace {
    public readonly filename: string
    private _contents: fflate.Zippable | null = null

    constructor(
        public readonly handle: FileSystemFileHandle
    ) {
        if (handle.kind !== 'file') {
            throw new Error('Workspace handle must be a file')
        }
        this.filename = handle.name
    }

    public async getContents(): Promise<fflate.Unzipped> {
        if (!this._contents) {
            const file = await this.handle.getFile()
            const arrayBuffer = await file.arrayBuffer()
            if (arrayBuffer.byteLength === 0) {
                this._contents = {
                    [`${WorkspaceFolders.RawFiles.name}/`]: [new Uint8Array(), { level: 0 }],
                    [`${WorkspaceFolders.Accounts.name}/`]: [new Uint8Array(), { level: 0 }],
                    'test.txt': fflate.strToU8('hello world')
                }
                await this.save()
            } else {
                // Ensure we have a clean Uint8Array from the ArrayBuffer
                const buf = new Uint8Array(arrayBuffer)
                this._contents = fflate.unzipSync(buf)
            }
        }
        return this._contents as fflate.Unzipped
    }

    public async save(): Promise<void> {
        if (!this._contents) {
            return
        }
        const data = fflate.zipSync(this._contents)
        await this.persist(data)
    }

    private async persist(data: Uint8Array): Promise<void> {
        const writable = await (this.handle as any).createWritable()
        await writable.write(data)
        await writable.close()
    }
}
