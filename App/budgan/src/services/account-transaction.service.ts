import { inject, Injectable, InjectionToken } from '@angular/core';
import { IndexdbService } from './indexdb.service';
import { AccountTransactionModel } from '@models/accountTransactionModel';
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
    });
    return { success: true, value: id };
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
