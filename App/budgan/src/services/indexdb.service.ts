import Dexie, { EntityTable, Table } from 'dexie';
import { Injectable } from '@angular/core';
import { JournalModel } from '@models/journalModel';
import { ColumnsMapping } from '@models/columnsMappingModel';
import { accountModel } from '@models/accountModel';

export type WorkspaceEntity = EntityTable<JournalModel, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class IndexdbService extends Dexie {
  workspaceTable!: WorkspaceEntity;
  columnsMappingTable!: Table<ColumnsMapping, string>;
  accountsTable!: EntityTable<accountModel, 'id'>;

  constructor() {
    super('budgan');
    this.version(1).stores({
      workspaces: '&id, &name',
    });
    this.version(2).stores({
      workspaces: '&id, &name',
      columnMappings: '&id, &name',
    });
    this.version(3).stores({
      workspaces: '&id, &name',
      columnMappings: '&id, &name, journalId',
    });
    this.version(4).stores({
      workspaces: '&id, &name',
      columnMappings: '&id, &name',
    });
    this.version(5).stores({
      workspaces: '&id, &name',
      columnMappings: '&id, &name',
      accounts: '&id, &name',
    });

    this.workspaceTable = this.table('workspaces');
    this.columnsMappingTable = this.table('columnMappings');
    this.accountsTable = this.table('accounts');

    this.open();
  }
}
