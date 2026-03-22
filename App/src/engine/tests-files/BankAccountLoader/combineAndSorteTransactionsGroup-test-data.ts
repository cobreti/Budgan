import type { BankAccountsDictionary } from '@models/BankAccountTypes'

const startDates: Date[] = [
    new Date('2023-01-01'),
    new Date('2023-01-02'),
    new Date('2023-02-01'),
    new Date('2023-02-02'),
    new Date('2023-03-01'),
    new Date('2023-03-02')
]

const endDates: Date[] = [
    new Date('2023-01-31'),
    new Date('2023-02-01'),
    new Date('2023-03-03'),
    new Date('2023-03-04'),
    new Date('2023-04-01'),
    new Date('2023-04-02')
]

export const combineAndSortTransactionsGroup_success_expected: BankAccountsDictionary = {
    '123456789': {
        accountId: '123456789',
        name: 'Savings Account',
        accountType: 'SAVINGS',
        transactions: [
            {
                transactionId: 'trans1',
                transactionGroupId: 'group1',
                amount: 100,
                dateInscription: new Date('2023-01-01'),
                description: 'Deposit',
                type: 'DEPOSIT'
            },
            {
                transactionId: 'trans2',
                transactionGroupId: 'group1',
                amount: -50,
                dateInscription: new Date('2023-01-02'),
                description: 'Withdrawal',
                type: 'WITHDRAWAL'
            },
            {
                transactionId: 'trans3',
                transactionGroupId: 'group2',
                amount: 200,
                dateInscription: new Date('2023-02-01'),
                description: 'Deposit',
                type: 'DEPOSIT'
            },
            {
                transactionId: 'trans4',
                transactionGroupId: 'group2',
                amount: -100,
                dateInscription: new Date('2023-02-02'),
                description: 'Withdrawal',
                type: 'WITHDRAWAL'
            },
            {
                transactionId: 'trans5',
                transactionGroupId: 'group21',
                amount: 200,
                dateInscription: new Date('2023-02-01'),
                description: 'Deposit',
                type: 'DEPOSIT'
            },
            {
                transactionId: 'trans6',
                transactionGroupId: 'group21',
                amount: -100,
                dateInscription: new Date('2023-02-02'),
                description: 'Withdrawal',
                type: 'WITHDRAWAL'
            },
            {
                transactionId: 'trans7',
                transactionGroupId: 'group22',
                amount: 300,
                dateInscription: new Date('2023-03-01'),
                description: 'Deposit',
                type: 'DEPOSIT'
            },
            {
                transactionId: 'trans8',
                transactionGroupId: 'group22',
                amount: -150,
                dateInscription: new Date('2023-03-02'),
                description: 'Withdrawal',
                type: 'WITHDRAWAL'
            }
        ],
        transactionsGroups: [
            {
                id: 'group1',
                name: 'Savings Account',
                dateStart: startDates[0],
                dateEnd: endDates[0],
                filename: 'savings.ofx'
            },
            {
                id: 'group2',
                name: 'Checking Account',
                dateStart: startDates[1],
                dateEnd: endDates[1],
                filename: 'checking.ofx'
            },
            {
                id: 'group21',
                name: 'Savings Account 2',
                dateStart: startDates[2],
                dateEnd: endDates[2],
                filename: 'savings2.ofx'
            },
            {
                id: 'group22',
                name: 'Checking Account 2',
                dateStart: startDates[3],
                dateEnd: endDates[3],
                filename: 'checking2.ofx'
            }
        ]
    }
}
