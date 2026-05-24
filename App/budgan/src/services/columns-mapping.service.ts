import { inject, Injectable, InjectionToken } from '@angular/core';
import { IndexdbService } from './indexdb.service';
import { ColumnsMapping } from '@models/columnsMappingModel';
import { ID_GENERATOR_SERVICE, IdGeneratorService } from './id-generator.service';
import { Result } from '@app-types/result';

export interface ColumnsMappingService {
  getList(): Promise<ColumnsMapping[]>;
  save(mapping: ColumnsMapping): Promise<Result<ColumnsMapping>>;
  getById(id: string): Promise<ColumnsMapping>;
  delete(id: string): Promise<void>;
}

export const COLUMNS_MAPPING_SERVICE = new InjectionToken<ColumnsMappingService>(
  'ColumnsMappingService',
);

@Injectable({ providedIn: 'root' })
export class ColumnsMappingServiceImpl implements ColumnsMappingService {
  private readonly _indexDb = inject(IndexdbService);
  private readonly _idGenerator = inject<IdGeneratorService>(ID_GENERATOR_SERVICE);

  async getList(): Promise<ColumnsMapping[]> {
    return this._indexDb.columnsMappingTable.toArray();
  }

  async save(mapping: ColumnsMapping): Promise<Result<ColumnsMapping>> {
    if (mapping.id) {
      const conflict = await this._indexDb.columnsMappingTable
        .where('name')
        .equals(mapping.name)
        .filter((r) => r.id !== mapping.id)
        .count();
      if (conflict > 0) return { success: false, error: 'name-exists' };
      await this._indexDb.columnsMappingTable.put(mapping);
      return { success: true, value: mapping };
    } else {
      const existing = await this._indexDb.columnsMappingTable
        .where('name')
        .equals(mapping.name)
        .count();
      if (existing > 0) return { success: false, error: 'name-exists' };
      const id = this._idGenerator.generateId();
      const record = { ...mapping, id };
      await this._indexDb.columnsMappingTable.add(record);
      return { success: true, value: record };
    }
  }

  async getById(id: string): Promise<ColumnsMapping> {
    const entry = await this._indexDb.columnsMappingTable.get(id);
    if (!entry) {
      throw new Error('Columns mapping not found');
    }
    return entry;
  }

  async delete(id: string): Promise<void> {
    await this._indexDb.columnsMappingTable.delete(id);
  }
}
