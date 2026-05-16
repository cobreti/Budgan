import { inject, Injectable, InjectionToken } from '@angular/core';
import { Workspace } from '../engine/workspace';
import { ID_GENERATOR_SERVICE, IdGeneratorService } from './id-generator.service';

export interface WorkspaceFactoryService {
  createWorkspace(name: string): Workspace;
}

export const WORKSPACE_FACTORY_SERVICE =
  new InjectionToken<WorkspaceFactoryService>('WorkspaceFactoryService');

@Injectable({ providedIn: 'root' })
export class WorkspaceFactoryServiceImpl implements WorkspaceFactoryService {
  private idGenerator = inject<IdGeneratorService>(ID_GENERATOR_SERVICE);

  createWorkspace(name: string): Workspace {
    return new Workspace(this.idGenerator.generateId(), name);
  }
}
