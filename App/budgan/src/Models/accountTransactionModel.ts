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
}

export enum AccountTransactionRecordType {
  normal = 'normal',
  snapshot = 'snapshot',
}
