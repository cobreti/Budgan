import { inject, Injectable, InjectionToken } from '@angular/core';
import { COLUMNS_MAPPING_SERVICE, ColumnsMappingService } from './columns-mapping.service';
import { ACCOUNT_SERVICE, AccountService } from './account.service';
import { FILE_SERVICE, FileService } from './file.service';
import { ACCOUNT_TRANSACTION_SERVICE, AccountTransactionService } from './account-transaction.service';
import { ColumnsMapping } from '@models/columnsMappingModel';
import { accountModel } from '@models/accountModel';
import { fileModel } from '@models/fileModel';
import { AccountTransactionModel } from '@models/accountTransactionModel';

export interface AccountExportPayload {
  version: number;
  account: accountModel;
  columnsMapping: ColumnsMapping;
  files: fileModel[];
  transactions: AccountTransactionModel[];
}

export interface AllDataExportPayload {
  version: number;
  columnsMappings: ColumnsMapping[];
  accounts: accountModel[];
  files: fileModel[];
  transactions: AccountTransactionModel[];
}

export interface BudganExportService {
  pickSaveFile(suggestedName: string): Promise<FileSystemFileHandle | null>;
  writeJsonToFile(handle: FileSystemFileHandle, data: unknown): Promise<void>;
  buildAccountPayload(accountId: string): Promise<AccountExportPayload>;
  buildAllDataPayload(): Promise<AllDataExportPayload>;
}

export const BUDGAN_EXPORT_SERVICE = new InjectionToken<BudganExportService>('BudganExportService');

@Injectable({ providedIn: 'root' })
export class BudganExportServiceImpl implements BudganExportService {
  private readonly _columnsMappingService = inject<ColumnsMappingService>(COLUMNS_MAPPING_SERVICE);
  private readonly _accountService = inject<AccountService>(ACCOUNT_SERVICE);
  private readonly _fileService = inject<FileService>(FILE_SERVICE);
  private readonly _transactionService = inject<AccountTransactionService>(ACCOUNT_TRANSACTION_SERVICE);

  async pickSaveFile(suggestedName: string): Promise<FileSystemFileHandle | null> {
    const showSaveFilePicker = (window as unknown as {
      showSaveFilePicker: (opts: unknown) => Promise<FileSystemFileHandle>;
    }).showSaveFilePicker;
    try {
      return await showSaveFilePicker({
        suggestedName,
        types: [{ description: 'Budgan files', accept: { 'application/octet-stream': ['.bdg'] } }],
      });
    } catch {
      return null;
    }
  }

  async writeJsonToFile(handle: FileSystemFileHandle, data: unknown): Promise<void> {
    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
  }

  async buildAccountPayload(accountId: string): Promise<AccountExportPayload> {
    const account = await this._accountService.getById(accountId);
    const [columnsMapping, files, transactions] = await Promise.all([
      this._columnsMappingService.getById(account.columnsMappingId),
      this._fileService.getListByAccount(accountId),
      this._transactionService.getListByAccount(accountId),
    ]);
    return { version: 1, account, columnsMapping, files, transactions };
  }

  async buildAllDataPayload(): Promise<AllDataExportPayload> {
    const [columnsMappings, accounts, files, transactions] = await Promise.all([
      this._columnsMappingService.getList(),
      this._accountService.getList(),
      this._fileService.getList(),
      this._transactionService.getList(),
    ]);
    return { version: 1, columnsMappings, accounts, files, transactions };
  }
}
