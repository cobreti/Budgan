export const CsvColumns = {
  cardNumber: 'card-number',
  dateInscription: 'date-inscription',
  dateTransaction: 'date-transaction',
  amount: 'amount',
  description: 'description'
}

export type CsvColumns = (typeof CsvColumns)[keyof typeof CsvColumns]

export type CsvColumnMapping = { [key in CsvColumns]?: number }
