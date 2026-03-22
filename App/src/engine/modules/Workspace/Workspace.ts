import type { Unzipped } from 'fflate'
export interface Workspace {
    handle: FileSystemFileHandle
    filename: string
    getContents(): Promise<Unzipped>
    save(): Promise<void>
}
