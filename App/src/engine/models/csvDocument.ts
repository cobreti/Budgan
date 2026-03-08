export type CSVRawRow = {
  cardNumber: string;
  dateInscription: String;
  dateTransaction: string;
  amount: string;
  description: string;
};

export enum CSVColumnContent {
  CARD_NUMBER = 1,
  DATE_INSCRIPTION = 2,
  DATE_TRANSACTION = 3,
  AMOUNT = 4,
  DESCRIPTION = 5,
  TYPE = 6
}

export type CSVColumnContentMapping = {[index in CSVColumnContent]: number | null}

export type CSVSettings = {
  id: string;
  name: string;
  delimiter: string;
  columnsMapping: CSVColumnContentMapping;
};

export type CSVSettingsList = CSVSettings[];


