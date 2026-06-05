export interface AccountModel {
  id: string;
  name: string;
  columnsMappingId: string;
  referenceBalance?: AccountReferenceBalance;
}

export interface AccountReferenceBalance {
  date: string;
  balance: number;
}
