//
//  Simple case header and data
//

export const headerAndData =
  `
  Maxi-Carte,Type de transaction,Date d'inscription, Montant de la transaction,Description
  
  
  '0123456',DEBIT,20240719,-25.41,[CW]ROGERS 9 DGT
  '0123456',CREDIT,20240719,50.0,[CW] TF 12345
  `

export const headerAndDataHeaderExpected = {
  lineNumber: 1,
  records: ['Maxi-Carte', 'Type de transaction', 'Date d\'inscription', 'Montant de la transaction', 'Description']
}

export const headerAndDataRowsExpected = [
  {
    lineNumber: 4,
    records: ['\'0123456\'', 'DEBIT', '20240719', '-25.41', '[CW]ROGERS 9 DGT']
  },
  {
    lineNumber: 5,
    records: ['\'0123456\'', 'CREDIT', '20240719', '50.0', '[CW] TF 12345']
  }
];

//
//  case with invalid csv line at top
//

export const headerAndDataWithInvalidLinesAtTop =
  `
  Les données suivantes sont valables à compter du 20240803100847 (année/mois/jour/heure/minute/seconde)
  
  Maxi-Carte,Type de transaction,Date d'inscription, Montant de la transaction,Description
  
  
  '0123456',DEBIT,20240719,-25.41,[CW]ROGERS 9 DGT
  '0123456',CREDIT,20240719,50.0,[CW] TF 12345
  `

export const headerAndDataWithInvalidLinesAtTopHeaderExpected = {
  lineNumber: 3,
  records: ['Maxi-Carte', 'Type de transaction', 'Date d\'inscription', 'Montant de la transaction', 'Description']
};

export const headerAndDataWithInvalidLinesAtTopRowsExpected = [
  {
    lineNumber: 6,
    records: ['\'0123456\'', 'DEBIT', '20240719', '-25.41', '[CW]ROGERS 9 DGT']
  },
  {
    lineNumber: 7,
    records: ['\'0123456\'', 'CREDIT', '20240719', '50.0', '[CW] TF 12345']
  }
];

export const headerAndDataWithInvalidLinesAtTopIgnoredLinesExpected = [
  {
    lineNumber: 1,
    content: 'Les données suivantes sont valables à compter du 20240803100847 (année/mois/jour/heure/minute/seconde)'
  }
];


//
// case with different delimiter
//

export const headerAndDataWithDifferentDelimiter =
  `
  Maxi-Carte;Type de transaction;Date d'inscription; Montant de la transaction;Description
  
  
  '0123456';DEBIT;20240719;-25.41;[CW]ROGERS 9 DGT
  '0123456';CREDIT;20240719;50.0;[CW] TF 12345
  `
export const headerAndDataWithDifferentDelimiterHeaderExpected = {
  lineNumber: 1,
  records: ['Maxi-Carte', 'Type de transaction', 'Date d\'inscription', 'Montant de la transaction', 'Description']
};

export const headerAndDataWithDifferentDelimiterRowsExpected = [
  {
    lineNumber: 4,
    records: ['\'0123456\'', 'DEBIT', '20240719', '-25.41', '[CW]ROGERS 9 DGT']
  },
  {
    lineNumber: 5,
    records: ['\'0123456\'', 'CREDIT', '20240719', '50.0', '[CW] TF 12345']
  }
];
