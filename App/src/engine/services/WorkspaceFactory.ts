import type { Workspace } from '../modules/Workspace/Workspace'
import { InversifyUtils } from '@inversify/inversify-utils.ts'

export abstract class WorkspaceFactory {
    static readonly bindingTypeId: string = InversifyUtils.createBindingId('WorkspaceFactory');

    abstract create(handle: FileSystemFileHandle): Workspace;
}
