import { inject, Injectable, InjectionToken } from '@angular/core';
import { IndexdbService } from './indexdb.service';
import {
  AccountTransactionModel,
  AccountTransactionRecordType,
} from '@models/accountTransactionModel';
import { Result } from '@app-types/result';

export type TransactionPage = {
  transactions: AccountTransactionModel[];
  totalPages: number;
  page: number;
};

export interface AccountTransactionService {
  getList(): Promise<AccountTransactionModel[]>;
  getCountByAccount(accountId: string): Promise<number>;
  getPageByAccount(accountId: string, page: number, pageSize: number): Promise<TransactionPage>;
  create(
    fileId: string,
    accountId: string,
    cardNumber: string,
    dateInscriptionAsString: string,
    amount: number,
    description: string,
  ): Promise<Result<string>>;
  setSnapshot(accountId: string, dateAsString: string, amount: number): Promise<Result<string>>;
  getSnapshot(accountId: string): Promise<AccountTransactionModel | undefined>;
  deleteSnapshot(accountId: string): Promise<void>;
  getListByAccount(accountId: string): Promise<AccountTransactionModel[]>;
  getById(id: string): Promise<AccountTransactionModel>;
  delete(id: string): Promise<void>;
}

export const ACCOUNT_TRANSACTION_SERVICE = new InjectionToken<AccountTransactionService>(
  'AccountTransactionService',
);

@Injectable({ providedIn: 'root' })
export class AccountTransactionServiceImpl implements AccountTransactionService {
  private readonly _indexDb = inject(IndexdbService);

  async getList(): Promise<AccountTransactionModel[]> {
    return this._indexDb.accountTransactionsTable.toArray();
  }

  async getCountByAccount(accountId: string): Promise<number> {
    return this._indexDb.accountTransactionsTable.where('accountId').equals(accountId).count();
  }

  async getPageByAccount(
    accountId: string,
    page: number,
    pageSize: number,
  ): Promise<TransactionPage> {
    const total = await this._indexDb.accountTransactionsTable
      .where('accountId')
      .equals(accountId)
      .count();

    const totalPages = Math.ceil(total / pageSize);

    const transactions = await this._indexDb.accountTransactionsTable
      .where('accountId')
      .equals(accountId)
      .offset(page * pageSize)
      .limit(pageSize)
      .toArray();

    return { transactions, totalPages, page };
  }

  async create(
    fileId: string,
    accountId: string,
    cardNumber: string,
    dateInscriptionAsString: string,
    amount: number,
    description: string,
  ): Promise<Result<string>> {
    const id = `${cardNumber}|${dateInscriptionAsString}|${amount}|${description}`;
    await this._indexDb.accountTransactionsTable.add({
      id,
      fileId,
      accountId,
      cardNumber,
      dateInscriptionAsString,
      amount,
      calculatedAmount: 0,
      description,
      recordType: AccountTransactionRecordType.normal,
    });
    return { success: true, value: id };
  }

  private snapshotId(accountId: string): string {
    return `snapshot|${accountId}`;
  }

  async setSnapshot(
    accountId: string,
    dateAsString: string,
    amount: number,
  ): Promise<Result<string>> {
    const id = this.snapshotId(accountId);
    await this._indexDb.accountTransactionsTable.put({
      id,
      fileId: '',
      accountId,
      cardNumber: '',
      dateInscriptionAsString: dateAsString,
      amount,
      calculatedAmount: amount,
      description: '',
      recordType: AccountTransactionRecordType.snapshot,
    });
    return { success: true, value: id };
  }

  async getSnapshot(accountId: string): Promise<AccountTransactionModel | undefined> {
    return this._indexDb.accountTransactionsTable.get(this.snapshotId(accountId));
  }

  async deleteSnapshot(accountId: string): Promise<void> {
    await this._indexDb.accountTransactionsTable.delete(this.snapshotId(accountId));
  }

  async getListByAccount(accountId: string): Promise<AccountTransactionModel[]> {
    return this._indexDb.accountTransactionsTable.where('accountId').equals(accountId).toArray();
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
