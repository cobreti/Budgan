import type { BankAccount } from '@/core/models/BankAccountTypes'

export const dateStart = [
    new Date(2021, 1, 1),
    new Date(2021, 1, 2),
    new Date(2021, 1, 3),
    new Date(2021, 1, 4),
    new Date(2021, 1, 5)
]

export const dateEnd = [
    new Date(2021, 1, 6),
    new Date(2021, 1, 7),
    new Date(2021, 1, 8),
    new Date(2021, 1, 9),
    new Date(2021, 1, 10)
]

export const LoadSingleFileTestSuccess_Input: BankAccount = {
    name: 'Sample Bank Account',
    accountId: '123456789',
    accountType: 'Checking',
    transactions: [],
    transactionsGroups: [
        {
            id: '123456789',
            name: 'Sample Transactions',
            dateStart: dateStart[0],
            dateEnd: dateEnd[0]
        }
    ]
}

export const LoadSingleFileTestSuccess_Expected: BankAccount = {
    name: 'Sample Bank Account',
    accountId: '123456789',
    accountType: 'Checking',
    transactions: [],
    transactionsGroups: [
        {
            id: '123456789',
            name: 'Sample Transactions',
            dateStart: dateStart[0],
            dateEnd: dateEnd[0],
            filename: 'test.ofx'
        }
    ]
}

export const LoadMultipleAccountsTest_Input: BankAccount[] = [
    {
        name: 'Sample Bank Account 1',
        accountId: '123456789',
        accountType: 'Checking',
        transactions: [],
        transactionsGroups: [
            {
                id: '123456789',
                name: 'Sample Transactions',
                dateStart: dateStart[0],
                dateEnd: dateEnd[0]
            }
        ]
    },
    {
        name: 'Sample Bank Account 2',
        accountId: '987654321',
        accountType: 'Savings',
        transactions: [],
        transactionsGroups: [
            {
                id: '987654321',
                name: 'Sample Transactions',
                dateStart: dateStart[1],
                dateEnd: dateEnd[1]
            }
        ]
    }
]

export const LoadMultipleAccountsTest_Expected: BankAccount[] = [
    {
        name: 'Sample Bank Account 1',
        accountId: '123456789',
        accountType: 'Checking',
        transactions: [],
        transactionsGroups: [
            {
                id: '123456789',
                name: 'Sample Transactions',
                dateStart: dateStart[0],
                dateEnd: dateEnd[0],
                filename: 'test.ofx'
            }
        ]
    },
    {
        name: 'Sample Bank Account 2',
        accountId: '987654321',
        accountType: 'Savings',
        transactions: [],
        transactionsGroups: [
            {
                id: '987654321',
                name: 'Sample Transactions',
                dateStart: dateStart[1],
                dateEnd: dateEnd[1],
                filename: 'test3.ofx'
            }
        ]
    }
]

export const LoadSortLoadedAccountByIdTest_Input: BankAccount[] = [
    {
        name: 'Account 1 - Checking',
        accountId: '123456789',
        accountType: 'Checking',
        transactions: [],
        transactionsGroups: [
            {
                id: '123456789',
                name: 'Sample Transactions',
                dateStart: dateStart[0],
                dateEnd: dateEnd[0]
            }
        ]
    },
    {
        name: 'Account 2 - Savings',
        accountId: '123456789',
        accountType: 'Savings',
        transactions: [],
        transactionsGroups: [
            {
                id: '123456789',
                name: 'Sample Transactions',
                dateStart: dateStart[1],
                dateEnd: dateEnd[1]
            }
        ]
    },
    {
        name: 'Account 3 - Checking',
        accountId: '987654321',
        accountType: 'Checking',
        transactions: [],
        transactionsGroups: [
            {
                id: '987654321',
                name: 'Sample Transactions',
                dateStart: dateStart[2],
                dateEnd: dateEnd[2]
            }
        ]
    },
    {
        name: 'Account 4 - Savings',
        accountId: '987654321',
        accountType: 'Savings',
        transactions: [],
        transactionsGroups: [
            {
                id: '987654321',
                name: 'Sample Transactions',
                dateStart: dateStart[3],
                dateEnd: dateEnd[3]
            }
        ]
    }
]

export const LoadSortLoadedAccountByIdTest_Expected: BankAccount[] = [
    {
        name: 'Account 1 - Checking',
        accountId: '123456789',
        accountType: 'Checking',
        transactions: [],
        transactionsGroups: [
            {
                id: '123456789',
                name: 'Sample Transactions',
                dateStart: dateStart[0],
                dateEnd: dateEnd[0],
                filename: 'test.ofx'
            }
        ]
    },
    {
        name: 'Account 2 - Savings',
        accountId: '123456789',
        accountType: 'Savings',
        transactions: [],
        transactionsGroups: [
            {
                id: '123456789',
                name: 'Sample Transactions',
                dateStart: dateStart[1],
                dateEnd: dateEnd[1],
                filename: 'test2.ofx'
            }
        ]
    },
    {
        name: 'Account 3 - Checking',
        accountId: '987654321',
        accountType: 'Checking',
        transactions: [],
        transactionsGroups: [
            {
                id: '987654321',
                name: 'Sample Transactions',
                dateStart: dateStart[2],
                dateEnd: dateEnd[2],
                filename: 'test3.ofx'
            }
        ]
    },
    {
        name: 'Account 4 - Savings',
        accountId: '987654321',
        accountType: 'Savings',
        transactions: [],
        transactionsGroups: [
            {
                id: '987654321',
                name: 'Sample Transactions',
                dateStart: dateStart[3],
                dateEnd: dateEnd[3],
                filename: 'test4.ofx'
            }
        ]
    }
]
