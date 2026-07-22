export type AccountType = 'credit' | 'debit';

export interface AccountModel {
  id: string;
  name: string;
  columnsMappingId: string;
  referenceBalance?: AccountReferenceBalance;
  accountType?: AccountType;
}

export interface AccountReferenceBalance {
  date: string;
  balance: number;
}
