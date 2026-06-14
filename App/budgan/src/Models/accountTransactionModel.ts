export interface AccountTransactionModel {
  id: string;
  recurringId: string;
  fileId: string;
  accountId: string;
  cardNumber: string;
  dateInscriptionAsString: string;
  amount: number;
  balance?: number;
  balanceDateOffset?: number;
  description: string;
  recordType: AccountTransactionRecordType;
  recurring?: accountRecurringTransaction;
}

export enum AccountTransactionRecordType {
  normal = 'normal',
  snapshot = 'snapshot',
}


export interface accountRecurringTransaction {
  recurringPeriodInDays: number;
}
