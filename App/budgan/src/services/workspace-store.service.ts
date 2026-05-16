import { inject, Injectable, InjectionToken, Signal, signal, WritableSignal } from '@angular/core';
import { Workspace } from '../engine/workspace';
import { ID_GENERATOR_SERVICE, IdGeneratorService } from './id-generator.service';

export interface WorkspaceStoreService {
  readonly workspace: Signal<Workspace | null>;
  createWorkspace(name: string): void;
  renameWorkspace(id: string, name: string): void;
  deleteWorkspace(id: string): void;
}

export const WORKSPACE_STORE_SERVICE =
  new InjectionToken<WorkspaceStoreService>('WorkspaceStoreService');

@Injectable({ providedIn: 'root' })
export class WorkspaceStoreServiceImpl implements WorkspaceStoreService {
  private readonly _idGenerator = inject<IdGeneratorService>(ID_GENERATOR_SERVICE);
  private readonly _workspace: WritableSignal<Workspace | null> = signal(null);

  get workspace(): Signal<Workspace | null> { return this._workspace; }

  createWorkspace(name: string): void {
    this._workspace.set(new Workspace(this._idGenerator.generateId(), name));
  }

  renameWorkspace(id: string, name: string): void {
    const current = this._workspace();
    if (current?.id === id) {
      // New Workspace instance required: Angular Signals use reference equality.
      this._workspace.set(new Workspace(id, name));
    }
  }

  deleteWorkspace(id: string): void {
    if (this._workspace()?.id === id) {
      this._workspace.set(null);
    }
  }
}
