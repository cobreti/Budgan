import Dexie, { EntityTable, Table } from 'dexie';
import { Injectable } from '@angular/core';
import { JournalModel } from '../Models/journalModel';
import { ColumnsMapping } from '../Models/ColumnsMappingModel';

export type WorkspaceEntity = EntityTable<JournalModel, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class IndexdbService extends Dexie {
  workspaceTable!: WorkspaceEntity;
  columnsMappingTable!: Table<ColumnsMapping, string>;

  constructor() {
    super('budgan');
    this.version(1).stores({
      workspaces: '&id, &name'
    });
    this.version(2).stores({
      workspaces: '&id, &name',
      columnMappings: '&id, &name'
    });

    this.workspaceTable = this.table('workspaces');
    this.columnsMappingTable = this.table('columnMappings');

    this.open();
  }
}
