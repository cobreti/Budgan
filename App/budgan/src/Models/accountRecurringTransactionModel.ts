export interface AccountRecurringTransactionModel {
  id: string; // equals AccountTransactionModel.recurringId
  accountId: string;
  periodInDays: number;
}
