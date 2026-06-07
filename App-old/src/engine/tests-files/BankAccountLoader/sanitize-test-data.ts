import type { BankAccountsDictionary, BankAccountTransactionsGroup } from '@models/BankAccountTypes'

export const sanitizeNewAccounts_existingAccount: BankAccountsDictionary = {
    '123456789': {
        name: 'test',
        accountId: '123456789',
        accountType: 'checking',
        transactions: [
            {
                transactionId: '1',
                transactionGroupId: '1',
                dateInscription: new Date(),
                amount: 1,
                type: 'debit',
                description: 'test'
            }
        ],
        transactionsGroups: [
            {
                name: 'test',
                id: '1',
                dateStart: new Date('2023-01-01'),
                dateEnd: new Date('2023-01-31')
            }
        ]
    }
}

export const sanitizeNewAccounts_newAccounts: BankAccountsDictionary = {
    '987654321': {
        name: 'Account One',
        accountId: '987654321',
        accountType: 'savings',
        transactions: [
            {
                transactionId: 'trans1-1',
                transactionGroupId: 'group1-1',
                dateInscription: new Date('2023-01-10'),
                amount: 100,
                type: 'DEPOSIT',
                description: 'Initial Deposit'
            },
            {
                transactionId: 'trans1-2',
                transactionGroupId: 'group1-2',
                dateInscription: new Date('2023-02-15'),
                amount: 200,
                type: 'DEPOSIT',
                description: 'Monthly Deposit'
            }
        ],
        transactionsGroups: [
            {
                name: 'Group 1',
                id: 'group1-1',
                dateStart: new Date('2023-01-01'),
                dateEnd: new Date('2023-01-31')
            },
            {
                name: 'Group 2',
                id: 'group1-2',
                dateStart: new Date('2023-02-01'),
                dateEnd: new Date('2023-02-28')
            }
        ]
    },
    '123456789': {
        name: 'test',
        accountId: '123456789',
        accountType: 'checking',
        transactions: [
            {
                transactionId: 'trans2-1',
                transactionGroupId: 'group2-1',
                dateInscription: new Date('2023-03-10'),
                amount: -50,
                type: 'WITHDRAWAL',
                description: 'Utility Bill'
            },
            {
                transactionId: 'trans2-2',
                transactionGroupId: 'group2-2',
                dateInscription: new Date('2023-04-15'),
                amount: 150,
                type: 'DEPOSIT',
                description: 'Paycheck'
            }
        ],
        transactionsGroups: [
            {
                name: 'Group 1',
                id: 'group2-1',
                dateStart: new Date('2023-03-01'),
                dateEnd: new Date('2023-03-31')
            },
            {
                name: 'Group 2',
                id: 'group2-2',
                dateStart: new Date('2023-04-01'),
                dateEnd: new Date('2023-04-30')
            }
        ]
    }
}

export const sanitizeNewAccounts_transactionsGroups_account_123456789: BankAccountTransactionsGroup[] =
    [
        {
            name: 'test',
            id: '1',
            dateStart: new Date('2023-01-01'),
            dateEnd: new Date('2023-01-31')
        },
        {
            name: 'Group 1',
            id: 'group2-1',
            dateStart: new Date('2023-03-01'),
            dateEnd: new Date('2023-03-31')
        },
        {
            name: 'Group 2',
            id: 'group2-2',
            dateStart: new Date('2023-04-01'),
            dateEnd: new Date('2023-04-30')
        }
    ]

export const sanitizeNewAccounts_transactionsGroups_account_987654321: BankAccountTransactionsGroup[] =
    [
        {
            name: 'Group 1',
            id: 'group1-1',
            dateStart: new Date('2023-01-01'),
            dateEnd: new Date('2023-01-31')
        },
        {
            name: 'Group 2',
            id: 'group1-2',
            dateStart: new Date('2023-02-01'),
            dateEnd: new Date('2023-02-28')
        }
    ]

export const sanitizeNewAccounts_accountsById_expected_data: BankAccountsDictionary = {
    '987654321': {
        name: 'Account One',
        accountId: '987654321',
        accountType: 'savings',
        transactions: [
            {
                transactionId: 'trans1-1',
                transactionGroupId: 'group1-1',
                dateInscription: new Date('2023-01-10'),
                amount: 100,
                type: 'DEPOSIT',
                description: 'Initial Deposit'
            },
            {
                transactionId: 'trans1-2',
                transactionGroupId: 'group1-2',
                dateInscription: new Date('2023-02-15'),
                amount: 200,
                type: 'DEPOSIT',
                description: 'Monthly Deposit'
            }
        ],
        transactionsGroups: [
            {
                name: 'Group 1',
                id: 'group1-1',
                dateStart: new Date('2023-01-01'),
                dateEnd: new Date('2023-01-31')
            },
            {
                name: 'Group 2',
                id: 'group1-2',
                dateStart: new Date('2023-02-01'),
                dateEnd: new Date('2023-02-28')
            }
        ]
    },
    '123456789': {
        name: 'test',
        accountId: '123456789',
        accountType: 'checking',
        transactions: [
            {
                transactionId: '1',
                transactionGroupId: '1',
                dateInscription: new Date(),
                amount: 1,
                type: 'debit',
                description: 'test'
            },
            {
                transactionId: 'trans2-1',
                transactionGroupId: 'group2-1',
                dateInscription: new Date('2023-03-10'),
                amount: -50,
                type: 'WITHDRAWAL',
                description: 'Utility Bill'
            },
            {
                transactionId: 'trans2-2',
                transactionGroupId: 'group2-2',
                dateInscription: new Date('2023-04-15'),
                amount: 150,
                type: 'DEPOSIT',
                description: 'Paycheck'
            }
        ],
        transactionsGroups: [
            {
                name: 'test',
                id: '1',
                dateStart: new Date('2023-01-01'),
                dateEnd: new Date('2023-01-31')
            },
            {
                name: 'Group 1',
                id: 'group2-1',
                dateStart: new Date('2023-03-01'),
                dateEnd: new Date('2023-03-31')
            },
            {
                name: 'Group 2',
                id: 'group2-2',
                dateStart: new Date('2023-04-01'),
                dateEnd: new Date('2023-04-30')
            }
        ]
    }
}
