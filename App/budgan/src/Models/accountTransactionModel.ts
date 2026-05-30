export interface AccountTransactionModel {
  id: string;
  fileId: string;
  accountId: string;
  cardNumber: string;
  dateInscriptionAsString: string;
  amount: number;
  calculatedAmount: number;
  description: string;
}
