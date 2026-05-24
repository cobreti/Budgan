import { inject, Injectable, InjectionToken } from '@angular/core';
import { IndexdbService } from './indexdb.service';
import { fileModel } from '@models/fileModel';
import { ID_GENERATOR_SERVICE, IdGeneratorService } from './id-generator.service';
import { Result } from '@app-types/result';

export interface FileService {
  getList(): Promise<fileModel[]>;
  create(filename: string, content: string, insertionDate: Date): Promise<Result<string>>;
  getById(id: string): Promise<fileModel>;
  delete(id: string): Promise<void>;
}

export const FILE_SERVICE = new InjectionToken<FileService>('FileService');

@Injectable({ providedIn: 'root' })
export class FileServiceImpl implements FileService {
  private readonly _indexDb = inject(IndexdbService);
  private readonly _idGenerator = inject<IdGeneratorService>(ID_GENERATOR_SERVICE);

  async getList(): Promise<fileModel[]> {
    return this._indexDb.filesTable.toArray();
  }

  async create(filename: string, content: string, insertionDate: Date): Promise<Result<string>> {
    const id = this._idGenerator.generateId();
    await this._indexDb.filesTable.add({ id, filename, content, insertionDate });
    return { success: true, value: id };
  }

  async getById(id: string): Promise<fileModel> {
    const entry = await this._indexDb.filesTable.get(id);
    if (!entry) {
      throw new Error('File not found');
    }
    return entry;
  }

  async delete(id: string): Promise<void> {
    await this._indexDb.filesTable.delete(id);
  }
}
