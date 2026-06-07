import type { BankAccountTransactionsGroup } from '@models/BankAccountTypes'

export const data_sortTransactionsGroupByStartDateAscending_unordered_input: BankAccountTransactionsGroup[] =
    [
        {
            name: 'Group 1',
            id: '1',
            dateStart: new Date('2022-04-01T00:00:00Z'),
            dateEnd: new Date()
        },
        {
            name: 'Group 2',
            id: '2',
            dateStart: new Date('2022-01-01T00:00:00Z'),
            dateEnd: new Date()
        },
        {
            name: 'Group 3',
            id: '3',
            dateStart: new Date('2022-03-01T00:00:00Z'),
            dateEnd: new Date()
        },
        {
            name: 'Group 4',
            id: '4',
            dateStart: new Date('2022-01-04T00:00:00Z'),
            dateEnd: new Date()
        }
    ]

export const data_sortTransactionsGroupByStartDateAscending_ordered_result: BankAccountTransactionsGroup[] =
    [
        {
            name: 'Group 2',
            id: '2',
            dateStart: new Date('2022-01-01T00:00:00Z'),
            dateEnd: new Date()
        },
        {
            name: 'Group 4',
            id: '4',
            dateStart: new Date('2022-01-04T00:00:00Z'),
            dateEnd: new Date()
        },
        {
            name: 'Group 3',
            id: '3',
            dateStart: new Date('2022-03-01T00:00:00Z'),
            dateEnd: new Date()
        },
        {
            name: 'Group 1',
            id: '1',
            dateStart: new Date('2022-04-01T00:00:00Z'),
            dateEnd: new Date()
        }
    ]
