import { describe, beforeEach, afterEach, vi, test, expect } from 'vitest'
import { CSVColumnContent, type CSVColumnContentMapping } from '@engine/models/csvDocument'
import type { CsvContent } from '@engine/services/CsvParser'
import { CsvColumnsToBankAccountTransactionMapper } from '@engine/services/CsvColumnsToBankAccountTransactionMapper'
import moment from 'moment'

describe('CsvColumnsToBankAccountTransactionMapper', () => {
    const columnsMapping: CSVColumnContentMapping = {
        [CSVColumnContent.CARD_NUMBER]: 0,
        [CSVColumnContent.TYPE]: 1,
        [CSVColumnContent.DATE_INSCRIPTION]: 2,
        [CSVColumnContent.AMOUNT]: 3,
        [CSVColumnContent.DESCRIPTION]: 4,
        [CSVColumnContent.DATE_TRANSACTION]: null
    }

    const invalidColumnsMapping: CSVColumnContentMapping = {
        [CSVColumnContent.CARD_NUMBER]: 0,
        [CSVColumnContent.TYPE]: 1,
        [CSVColumnContent.DATE_INSCRIPTION]: 2,
        [CSVColumnContent.AMOUNT]: 3,
        [CSVColumnContent.DESCRIPTION]: null,
        [CSVColumnContent.DATE_TRANSACTION]: null
    }

    const OutofBoundColumnsMapping: CSVColumnContentMapping = {
        [CSVColumnContent.CARD_NUMBER]: 0,
        [CSVColumnContent.TYPE]: 1,
        [CSVColumnContent.DATE_INSCRIPTION]: 2,
        [CSVColumnContent.AMOUNT]: 5,
        [CSVColumnContent.DESCRIPTION]: 4,
        [CSVColumnContent.DATE_TRANSACTION]: 5
    }

    const sampleCsvContent: CsvContent = {
        header: { records: ['cardNumber', 'type', 'dateInscription', 'amount', 'description'] },
        rows: [
            { records: ['1234', 'debit', '20210101', '123.45', 'description 1'] },
            { records: ['1234', 'credit', '20210102', '234.56', 'description 2'] }
        ]
    }

    const sampleCsvContentWithAnotherDateFormat: CsvContent = {
        header: { records: ['cardNumber', 'type', 'dateInscription', 'amount', 'description'] },
        rows: [
            { records: ['1234', 'debit', '01/05/2021', '123.45', 'description 1'] },
            { records: ['1234', 'credit', '02/03/2021', '234.56', 'description 2'] }
        ]
    }

    beforeEach(() => {})

    afterEach(() => {
        vi.resetAllMocks()
    })

    test('construction', () => {
        const mapper = new CsvColumnsToBankAccountTransactionMapper(columnsMapping)

        expect(mapper.dateInscriptionColIndex).toBe(2)
        expect(mapper.dateTransactionColIndex).toBe(null)
        expect(mapper.amountColIndex).toBe(3)
        expect(mapper.cardNumberColIndex).toBe(0)
        expect(mapper.descriptionColIndex).toBe(4)
        expect(mapper.typeColIndex).toBe(1)
        expect(mapper.dateFormat).toBe('YYYYMMDD')

        expect(mapper.valid).toBe(true)
    })

    test('construction with options', () => {
        const mapper = new CsvColumnsToBankAccountTransactionMapper(columnsMapping, {
            dateFormat: 'YYYY-MM-DD'
        })

        expect(mapper.dateInscriptionColIndex).toBe(2)
        expect(mapper.dateTransactionColIndex).toBe(null)
        expect(mapper.amountColIndex).toBe(3)
        expect(mapper.cardNumberColIndex).toBe(0)
        expect(mapper.descriptionColIndex).toBe(4)
        expect(mapper.typeColIndex).toBe(1)
        expect(mapper.dateFormat).toBe('YYYY-MM-DD')

        expect(mapper.valid).toBe(true)
    })

    test('mapCsvToTransaction', () => {
        const mapper = new CsvColumnsToBankAccountTransactionMapper(columnsMapping)

        const transaction = mapper.mapCsvToTransaction(
            sampleCsvContent.rows[0],
            'transaction-group-id'
        )

        expect(transaction).toEqual({
            transactionId: '20210101-123.45-description 1-debit',
            transactionGroupId: 'transaction-group-id',
            type: 'debit',
            dateInscription: moment('20210101', 'YYYYMMDD').toDate(),
            amount: 123.45,
            description: 'description 1'
        })
    })

    test('mapCsvToTransaction with invalid columns', () => {
        const mapper = new CsvColumnsToBankAccountTransactionMapper(invalidColumnsMapping)

        const transaction = mapper.mapCsvToTransaction(
            sampleCsvContent.rows[0],
            'transaction-group-id'
        )

        expect(mapper.valid).toBe(false)
        expect(transaction).toBe(null)
    })

    test('mapCsvToTransaction with out of bound columns', () => {
        const mapper = new CsvColumnsToBankAccountTransactionMapper(OutofBoundColumnsMapping)

        const transaction = mapper.mapCsvToTransaction(
            sampleCsvContent.rows[0],
            'transaction-group-id'
        )

        expect(mapper.valid).toBe(true)
        expect(transaction).toBe(null)
    })

    test('mapCsvToTransaction with another date format', () => {
        const mapper = new CsvColumnsToBankAccountTransactionMapper(columnsMapping, {
            dateFormat: 'DD/MM/YYYY'
        })

        const transaction = mapper.mapCsvToTransaction(
            sampleCsvContentWithAnotherDateFormat.rows[0],
            'transaction-group-id'
        )

        expect(transaction).toEqual({
            transactionId: '01/05/2021-123.45-description 1-debit',
            transactionGroupId: 'transaction-group-id',
            type: 'debit',
            dateInscription: moment('01/05/2021', 'DD/MM/YYYY').toDate(),
            amount: 123.45,
            description: 'description 1'
        })
    })
})
