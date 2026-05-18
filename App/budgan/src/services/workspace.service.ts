import { inject, Injectable, InjectionToken } from '@angular/core';
import { IndexdbService } from './indexdb.service';
import { WorkspaceModel } from '../Models/workspace.model';

export interface WorkspaceService {
  getWorkspaces(): Promise<WorkspaceModel[]>;
}

export const WORKSPACE_SERVICE = new InjectionToken<WorkspaceService>('WorkspaceService');

@Injectable({ providedIn: 'root' })
export class WorkspaceServiceImpl implements WorkspaceService {
  private readonly _indexDb = inject(IndexdbService);

  async getWorkspaces(): Promise<WorkspaceModel[]> {
    return this._indexDb.workspaceTable.toArray();
  }
}
