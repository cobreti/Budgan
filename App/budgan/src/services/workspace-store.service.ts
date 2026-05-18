import { inject, Injectable, InjectionToken, Signal, signal, WritableSignal } from '@angular/core';
import { Workspace } from '../engine/workspace';
import { ID_GENERATOR_SERVICE, IdGeneratorService } from './id-generator.service';
import { IndexdbService } from './indexdb.service';

export type CreateWorkspaceResult = 'ok' | 'name-exists';

export interface WorkspaceStoreService {
  readonly workspace: Signal<Workspace | null>;
  loadWorkspaceById(id: string): Promise<boolean>;
  createWorkspace(name: string): Promise<CreateWorkspaceResult>;
  renameWorkspace(id: string, name: string): void;
  deleteWorkspace(id: string): void;
}

export const WORKSPACE_STORE_SERVICE =
  new InjectionToken<WorkspaceStoreService>('WorkspaceStoreService');

@Injectable({ providedIn: 'root' })
export class WorkspaceStoreServiceImpl implements WorkspaceStoreService {
  private readonly _idGenerator = inject<IdGeneratorService>(ID_GENERATOR_SERVICE);
  private readonly _indexdb = inject(IndexdbService);
  private readonly _workspace: WritableSignal<Workspace | null> = signal(null);

  get workspace(): Signal<Workspace | null> { return this._workspace; }

  async loadWorkspaceById(id: string): Promise<boolean> {
    const entry = await this._indexdb.workspaceTable.get(id);
    if (!entry) return false;
    this._workspace.set(new Workspace(this._indexdb, entry.id, entry.name));
    return true;
  }

  async createWorkspace(name: string): Promise<CreateWorkspaceResult> {
    const existing = await this._indexdb.workspaceTable.where('name').equals(name).count();
    if (existing > 0) return 'name-exists';

    const newWorkspace = new Workspace(this._indexdb, this._idGenerator.generateId(), name);
    await newWorkspace.create();
    this._workspace.set(newWorkspace);
    return 'ok';
  }

  renameWorkspace(id: string, name: string): void {
    const current = this._workspace();
    if (current?.id === id) {
      // New Workspace instance required: Angular Signals use reference equality.
      this._workspace.set(new Workspace(this._indexdb, id, name));
    }
  }

  deleteWorkspace(id: string): void {
    if (this._workspace()?.id === id) {
      this._workspace.set(null);
    }
  }
}
