import Dexie, { EntityTable } from 'dexie';
import { Injectable } from '@angular/core';
import { WorkspaceModel } from '../Models/workspace.model';

export type WorkspaceEntity = EntityTable<WorkspaceModel, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class IndexdbService extends Dexie {
  workspaceTable!: WorkspaceEntity;

  constructor() {
    super('budgan');
    this.version(1)
    .stores({
      workspaces: '&id, &name'
    });

    this.workspaceTable = this.table('workspaces');

    this.open();
  }
}
