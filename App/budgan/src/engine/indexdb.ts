import Dexie, { EntityTable } from 'dexie';
import { Injectable } from '@angular/core';
import { WorkspaceEntry } from './types';

export type WorkspaceEntity = EntityTable<WorkspaceEntry, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class IndexDB extends Dexie {
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
