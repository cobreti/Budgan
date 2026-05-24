import { inject, Injectable, InjectionToken } from '@angular/core';
import { IndexdbService } from './indexdb.service';
import { AccountTransactionModel } from '@models/accountTransactionModel';
import { ID_GENERATOR_SERVICE, IdGeneratorService } from './id-generator.service';
import { Result } from '@app-types/result';

export interface AccountTransactionService {
  getList(): Promise<AccountTransactionModel[]>;
  create(
    fileId: string,
    accountId: string,
    cardNumber: string,
    dateInscriptionAsString: string,
    amount: number,
    duplicateOf?: string
  ): Promise<Result<string>>;
  getById(id: string): Promise<AccountTransactionModel>;
  delete(id: string): Promise<void>;
}

export const ACCOUNT_TRANSACTION_SERVICE = new InjectionToken<AccountTransactionService>('AccountTransactionService');

@Injectable({ providedIn: 'root' })
export class AccountTransactionServiceImpl implements AccountTransactionService {
  private readonly _indexDb = inject(IndexdbService);
  private readonly _idGenerator = inject<IdGeneratorService>(ID_GENERATOR_SERVICE);

  async getList(): Promise<AccountTransactionModel[]> {
    return this._indexDb.accountTransactionsTable.toArray();
  }

  async create(
    fileId: string,
    accountId: string,
    cardNumber: string,
    dateInscriptionAsString: string,
    amount: number,
    duplicateOf?: string
  ): Promise<Result<string>> {
    const id = this._idGenerator.generateId();
    await this._indexDb.accountTransactionsTable.add({
      id, fileId, accountId, cardNumber, dateInscriptionAsString, amount, duplicateOf,
    });
    return { success: true, value: id };
  }

  async getById(id: string): Promise<AccountTransactionModel> {
    const entry = await this._indexDb.accountTransactionsTable.get(id);
    if (!entry) {
      throw new Error('Account transaction not found');
    }
    return entry;
  }

  async delete(id: string): Promise<void> {
    await this._indexDb.accountTransactionsTable.delete(id);
  }
}
