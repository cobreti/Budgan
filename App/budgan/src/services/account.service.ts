import { inject, Injectable, InjectionToken } from '@angular/core';
import { IndexdbService } from './indexdb.service';
import { accountModel } from '@models/accountModel';
import { ID_GENERATOR_SERVICE, IdGeneratorService } from './id-generator.service';
import { Result } from '@app-types/result';

export interface AccountService {
  getList(): Promise<accountModel[]>;
  create(name: string, columnsMappingId: string): Promise<Result<string>>;
  getById(id: string): Promise<accountModel>;
  delete(id: string): Promise<void>;
}

export const ACCOUNT_SERVICE = new InjectionToken<AccountService>('AccountService');

@Injectable({ providedIn: 'root' })
export class AccountServiceImpl implements AccountService {
  private readonly _indexDb = inject(IndexdbService);
  private readonly _idGenerator = inject<IdGeneratorService>(ID_GENERATOR_SERVICE);

  async getList(): Promise<accountModel[]> {
    return this._indexDb.accountsTable.toArray();
  }

  async create(name: string, columnsMappingId: string): Promise<Result<string>> {
    const existing = await this._indexDb.accountsTable.where('name').equals(name).count();
    if (existing > 0) return { success: false, error: 'name-exists' };

    const id = this._idGenerator.generateId();
    await this._indexDb.accountsTable.add({ id, name, columnsMappingId });
    return { success: true, value: id };
  }

  async getById(id: string): Promise<accountModel> {
    const entry = await this._indexDb.accountsTable.get(id);
    if (!entry) {
      throw new Error('Account not found');
    }
    return entry;
  }

  async delete(id: string): Promise<void> {
    await this._indexDb.transaction(
      'rw',
      [
        this._indexDb.accountsTable,
        this._indexDb.filesTable,
        this._indexDb.accountTransactionsTable,
      ],
      async () => {
        await this._indexDb.accountTransactionsTable.where('accountId').equals(id).delete();
        await this._indexDb.filesTable.where('accountId').equals(id).delete();
        await this._indexDb.accountsTable.delete(id);
      },
    );
  }
}
