import { injectable } from 'inversify'
import type { WorkspaceFactory } from './WorkspaceFactory'
import type { Workspace } from '@engine/modules/Workspace/Workspace.ts'
import { WorkspaceImpl } from '@engine/modules/Workspace/WorkspaceImpl.ts'


@injectable()
export class WorkspaceFactoryImpl implements WorkspaceFactory {
    create(): Workspace {
        return new WorkspaceImpl()
    }
}
