import { describe, beforeEach, afterEach, vi, test, expect } from 'vitest'

import {
    headerAndData,
    headerAndDataHeaderExpected,
    headerAndDataRowsExpected,
    headerAndDataWithDifferentDelimiter,
    headerAndDataWithDifferentDelimiterHeaderExpected,
    headerAndDataWithDifferentDelimiterRowsExpected,
    headerAndDataWithInvalidLinesAtTop,
    headerAndDataWithInvalidLinesAtTopHeaderExpected,
    headerAndDataWithInvalidLinesAtTopIgnoredLinesExpected,
    headerAndDataWithInvalidLinesAtTopRowsExpected
} from '@engine/tests-files/CsvReader/samples'
import { CsvParser } from '@engine/services/CsvParser'

describe('CsvReader', () => {
    beforeEach(() => {})

    afterEach(() => {
        vi.resetAllMocks()
    })

    test('default construction', () => {
        const parser = new CsvParser()

        expect(parser.settings.delimiter).toBe(',')
        expect(parser.delimiter).toBe(',')
        expect(parser.settings.minimumColumnsCount).toBeUndefined()
    })

    test('set minimum columns count', () => {
        const parser = new CsvParser()
        parser.minimumColumnsCount = 3

        expect(parser.settings.minimumColumnsCount).toBe(3)
    })

    test('set delimiter', () => {
        const parser = new CsvParser()
        parser.delimiter = ';'

        expect(parser.settings.delimiter).toBe(';')
        expect(parser.delimiter).toBe(';')
    })

    test('successfully get header and rows', () => {
        const parser = new CsvParser()
        parser.minimumColumnsCount = 3

        const result = parser.parse(headerAndData)

        expect(result.content.header).toBeDefined()
        expect(result.content.header).toEqual(headerAndDataHeaderExpected)
        expect(result.content.rows).toEqual(headerAndDataRowsExpected)
    })

    test('skip invalid lines at top', () => {
        const parser = new CsvParser()
        parser.minimumColumnsCount = 3

        const result = parser.parse(headerAndDataWithInvalidLinesAtTop)

        expect(result.content.header).toBeDefined()
        expect(result.content.header).toEqual(headerAndDataWithInvalidLinesAtTopHeaderExpected)
        expect(result.content.rows).toEqual(headerAndDataWithInvalidLinesAtTopRowsExpected)
        expect(result.ignoredLines).toEqual(headerAndDataWithInvalidLinesAtTopIgnoredLinesExpected)
    })

    test('header and data with different delimiter', () => {
        const parser = new CsvParser()
        parser.delimiter = ';'
        parser.minimumColumnsCount = 3

        const result = parser.parse(headerAndDataWithDifferentDelimiter)

        expect(result.content.header).toBeDefined()
        expect(result.content.header).toEqual(headerAndDataWithDifferentDelimiterHeaderExpected)
        expect(result.content.rows).toEqual(headerAndDataWithDifferentDelimiterRowsExpected)
    })
})
