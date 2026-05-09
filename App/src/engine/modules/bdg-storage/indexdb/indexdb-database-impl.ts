import Dexie, { type EntityTable } from 'dexie'
import type { CsvColumnMapping } from '@engine/modules/csv-import/csv-column-content.ts'

export interface ColumnMappingEntry {
  id: string
  name: string
  columnMapping: CsvColumnMapping
}

export type ColumnMappingEntity = EntityTable<ColumnMappingEntry, 'id'>;

export interface IndexDBDatabase {
  columnMapping: ColumnMappingEntity;
}

export class IndexdbDatabaseImpl extends Dexie implements IndexDBDatabase {
  columnMapping!: ColumnMappingEntity;

  constructor() {
    super('bdg-database')
    this.version(1).stores({
      columnMapping: 'id, name, columnMapping'
    })

    this.columnMapping = this.table('columnMapping');
    this.open();

    // this.columnMapping.add({
    //   id: '1',
    //   name: 'Default',
    //   columnMapping: {}
    // });
  }
}

