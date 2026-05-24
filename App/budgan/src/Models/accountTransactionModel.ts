export interface AccountTransactionModel {
  id: string;
  fileId: string;
  accountId: string;
  cardNumber: string;
  dateInscriptionAsString: string;
  amount: number;
  duplicateOf?: string;
}
