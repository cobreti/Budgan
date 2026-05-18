import Dexie, { EntityTable } from 'dexie';
import { Injectable } from '@angular/core';
import { JournalModel } from '../Models/journalModel';

export type WorkspaceEntity = EntityTable<JournalModel, 'id'>;

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
