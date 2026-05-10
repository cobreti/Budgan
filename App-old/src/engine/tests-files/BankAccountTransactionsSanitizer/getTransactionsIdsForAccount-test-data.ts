import type { BankAccount, TransactionIdsTable } from '@models/BankAccountTypes'

export const getTransactionsIdsForAccount_success_input: BankAccount = {
    name: 'Sample Account',
    accountId: '123456',
    accountType: 'Checking',
    transactions: [
        {
            transactionId: '10',
            transactionGroupId: '1',
            dateInscription: new Date('2022-01-01'),
            amount: 100,
            type: 'Deposit',
            description: 'Deposit 1'
        },
        {
            transactionId: '11',
            transactionGroupId: '1',
            dateInscription: new Date('2022-01-02'),
            amount: 100,
            type: 'Deposit',
            description: 'Deposit 2'
        },
        {
            transactionId: '20',
            transactionGroupId: '2',
            dateInscription: new Date('2022-02-01'),
            amount: 200,
            type: 'Withdrawal',
            description: 'Withdrawal 1'
        },
        {
            transactionId: '21',
            transactionGroupId: '2',
            dateInscription: new Date('2022-02-02'),
            amount: 200,
            type: 'Withdrawal',
            description: 'Withdrawal 2'
        }
    ],
    transactionsGroups: [
        {
            name: 'Group 1',
            id: '1',
            dateStart: new Date('2022-01-01'),
            dateEnd: new Date('2022-01-31')
        },
        {
            name: 'Group 2',
            id: '2',
            dateStart: new Date('2022-02-01'),
            dateEnd: new Date('2022-02-28')
        }
    ]
}

export const getTransactionsIdsForAccount_expected_output: TransactionIdsTable = {
    '10': {},
    '11': {},
    '20': {},
    '21': {}
}
