import { AmountOperationType, ColumnHeaders, ColumnsType, type StatementByColumns, type TransactionDescription } from './types.ts'
import { cardNumbers } from '../data/card-numbers.ts'
import { transactionDescriptions } from '../data/transaction-descriptions.ts'
import { promises as fs } from 'fs'
import path from 'node:path'

export class StatementGenerator {

    //
    //  Statement generation parameters
    //
    private startDate: Date = new Date(Date.now());
    private endDate: Date = new Date(Date.now());
    private minAmount?: number = 10;
    private maxAmount?: number = 1000;
    private columns: ColumnsType[] = [];
    private randomLinesCount: number = 10;
    private totalLinesCount: number = 0;
    private includeHeader: boolean = false;

    //
    //  Generated statement data
    //
    private dates: Date[] = [];
    private cardNumber: string = '';
    private descriptions: TransactionDescription[] = [];
    private amounts: number[] = [];
    private statementByColumns: StatementByColumns = undefined;

    public setDateRange(startDate: Date, endDate: Date): StatementGenerator {
        this.startDate = startDate;
        this.endDate = endDate;
        return this;
    }

    public setAmountRange(min: number, max: number): StatementGenerator {
        this.minAmount = min;
        this.maxAmount = max;
        return this;
    }

    public setColumns(columns: ColumnsType[]): StatementGenerator {
        this.columns = columns;
        return this;
    }

    public setRandomLinesCount(count: number): StatementGenerator {
        this.randomLinesCount = count;
        return this;
    }

    public setIncludeHeader(include: boolean): StatementGenerator {
        this.includeHeader = include;
        return this;
    }

    public generateRandomDates(): StatementGenerator {
        const startTime = this.startDate.getTime()
        const endTime = this.endDate.getTime()

        this.dates = [];

        for (let i = 0; i < this.randomLinesCount; i++) {
            const randomTime = startTime + Math.random() * (endTime - startTime)
            const tempDate = new Date(randomTime)
            tempDate.setHours(0, 0, 0, 0)
            this.dates.push(tempDate)
        }

        return this;
    }

    public selectRandomCardNumber(): StatementGenerator {
        this.cardNumber = cardNumbers[Math.floor(Math.random() * cardNumbers.length)]
        return this;
    }

    public selectRandomDescriptions(excludeDescriptions?: string[]): StatementGenerator {

        this.descriptions = [];

        const excludeSet = new Set((excludeDescriptions ?? []).map((s) => s.trim()))
        const pool = transactionDescriptions.filter((td) => !excludeSet.has(td.description.trim()))
        const effectivePool = pool.length > 0 ? pool : transactionDescriptions

        for (let i = 0; i < this.randomLinesCount; i++) {
            const randomIndex = Math.floor(Math.random() * effectivePool.length)
            this.descriptions.push(effectivePool[randomIndex])
        }

        return this;
    }

    public generateAmounts(): StatementGenerator {
        const min = this.minAmount ?? 0
        const max = this.maxAmount ?? Number.MAX_SAFE_INTEGER

        this.amounts = [];

        for (let i = 0; i < this.randomLinesCount; i++) {
            const randomAmount = Math.random() * (max - min) + min
            this.amounts.push(Math.round(randomAmount * 100) / 100)
        }

        return this;
    }

    public generateStatement(): StatementGenerator {
        if (!this.statementByColumns) {
            this.statementByColumns = {}
        }

        const randomLinesCount = this.dates.length;

        this.columns.forEach((column) => {
            if (!this.statementByColumns![column]) {
                this.statementByColumns![column] = []
            }
            const arr = this.statementByColumns![column]!

            // Ensure array is padded to current totalLinesCount before appending random data
            while (arr.length < this.totalLinesCount) {
                arr.push('')
            }

            switch (column) {
                case ColumnsType.DATE_INSCRIPTION:
                    this.dates.forEach((date) =>
                        arr.push(date.toLocaleDateString('en-CA'))
                    )
                    break
                case ColumnsType.DATE_TRANSACTION:
                    this.dates.forEach((date) =>
                        arr.push(date.toLocaleDateString('en-CA'))
                    )
                    break
                case ColumnsType.CARD_NUMBER:
                    for (let i = 0; i < randomLinesCount; i++) {
                        arr.push(this.cardNumber)
                    }
                    break
                case ColumnsType.DESCRIPTION:
                    this.descriptions.forEach((d) => arr.push(d.description))
                    break
                case ColumnsType.AMOUNT: {
                    this.amounts.forEach((a, i) => {
                        const isExpense = this.descriptions[i]?.amountOperationType === AmountOperationType.Expanse
                        const signed = isExpense ? -Math.abs(a) : Math.abs(a)
                        arr.push(signed.toString())
                    })
                    break
                }
            }
        });

        this.totalLinesCount = this.statementByColumns[this.columns[0]]?.length ?? 0

        return this;
    }

    public async saveStatement(filepath: string): Promise<StatementGenerator>
    {
        const escapeCsv = (val: string): string => {
            const needsQuoting = /[",\n\r]/.test(val) || val.startsWith(' ') || val.endsWith(' ')
            const escaped = val.replace(/"/g, '""')
            return needsQuoting ? `"${escaped}"` : escaped
        }

        const rowsCount = this.totalLinesCount
        const colOrder = this.columns

        // Build row objects to facilitate sorting
        const rows: string[][] = []
        for (let i = 0; i < rowsCount; i++) {
            const rowValues = colOrder.map((col) => {
                const colArray = this.statementByColumns[col] ?? []
                return colArray[i] ?? ''
            })
            // Only add rows that have at least one non-empty value
            if (rowValues.some(val => val !== '')) {
                rows.push(rowValues)
            }
        }

        // Sort rows by date if DATE_TRANSACTION column exists
        const dateColIndex = colOrder.indexOf(ColumnsType.DATE_TRANSACTION)
        if (dateColIndex !== -1) {
            rows.sort((a, b) => {
                const dateA = new Date(a[dateColIndex])
                const dateB = new Date(b[dateColIndex])
                return dateA.getTime() - dateB.getTime()
            })
        }

        // Build CSV lines with escaped values
        const lines = rows.map(row => row.map(val => escapeCsv(String(val))).join(','))

        // Add header row if enabled
        const csvLines: string[] = []
        if (this.includeHeader) {
            const headerRow = colOrder.map(col => escapeCsv(ColumnHeaders[col])).join(',')
            csvLines.push(headerRow)
        }
        csvLines.push(...lines)

        const csv = csvLines.join('\n') + '\n'

        // Ensure directory exists and write file
        await fs.mkdir(path.dirname(filepath), { recursive: true })
        await fs.writeFile(filepath, csv, { encoding: 'utf8' })

        return this;
    }

    //
    //  Manually add a statement row by specifying column/value pairs
    //
    //  Requirements from issue:
    //  - Method name: addStatementRow
    //  - Accept a single array of entries; each entry contains a column type and a value
    //  - Date columns must be stored using en-CA format
    //  - Amount must be auto-signed based on DESCRIPTION's amountOperationType
    //  - Throw on mismatch (e.g., AMOUNT requires DESCRIPTION context; unknown column; duplicate columns)
    //  - Append values into statementByColumns
    public addStatementRow(
        entries: Array<{ column: ColumnsType; value?: string | number | Date }>
    ): StatementGenerator {
        if (!Array.isArray(entries) || entries.length === 0) {
            throw new Error('addStatementRow: entries must be a non-empty array')
        }

        // Ensure the internal structure exists
        if (!this.statementByColumns) {
            this.statementByColumns = {}
        }

        // Track provided fields and detect duplicates
        const seen = new Set<ColumnsType>()

        // We'll need description metadata for amount signing logic
        let descriptionMeta: TransactionDescription | undefined
        let pendingAmount: number | string | Date | undefined

        // First pass: validate and capture metadata
        for (const e of entries) {
            const { column } = e
            if (seen.has(column)) {
                throw new Error(`addStatementRow: duplicate column provided: ${column}`)
            }
            seen.add(column)

            if (column === ColumnsType.DESCRIPTION) {
                const descText = String(e.value)
                const trimmed = descText.trim()
                descriptionMeta = transactionDescriptions.find(td => td.description.trim() === trimmed)
            } else if (column === ColumnsType.AMOUNT) {
                pendingAmount = e.value
            }
        }

        // Validate AMOUNT requires DESCRIPTION
        if (seen.has(ColumnsType.AMOUNT)) {
            if (!seen.has(ColumnsType.DESCRIPTION)) {
                throw new Error('addStatementRow: AMOUNT provided but DESCRIPTION is missing')
            }
            if (pendingAmount === undefined) {
                throw new Error('addStatementRow: AMOUNT value missing')
            }
            if (Number.isNaN(Number(pendingAmount))) {
                throw new Error('addStatementRow: AMOUNT must be a number')
            }
        }

        // Second pass: fill in the columns
        this.columns.forEach(col => {
            const arr = this.statementByColumns![col] ?? (this.statementByColumns![col] = [])
            
            // Ensure array is padded to current totalLinesCount if it was missing from previous manual additions
            while (arr.length < this.totalLinesCount) {
                arr.push('')
            }

            if (col === ColumnsType.AMOUNT && seen.has(ColumnsType.AMOUNT)) {
                const n = Number(pendingAmount)
                const isExpense = descriptionMeta?.amountOperationType === AmountOperationType.Expanse
                const signed = isExpense ? -Math.abs(n) : Math.abs(n)
                arr.push(signed.toString())
            } else if (col === ColumnsType.DATE_INSCRIPTION || col === ColumnsType.DATE_TRANSACTION) {
                const entry = entries.find(e => e.column === col)
                if (entry) {
                    const d = entry.value
                    const asString = d instanceof Date ? d.toLocaleDateString('en-CA') : String(d)
                    arr.push(asString)
                } else {
                    arr.push('')
                }
            } else if (col === ColumnsType.CARD_NUMBER) {
                const entry = entries.find(e => e.column === col)
                let value = entry?.value
                if (value === undefined || value === null || String(value).trim() === '') {
                    value = this.cardNumber
                }
                arr.push(String(value))
            } else if (col === ColumnsType.DESCRIPTION) {
                const entry = entries.find(e => e.column === col)
                arr.push(entry ? String(entry.value) : '')
            } else if (!seen.has(col)) {
                arr.push('')
            }
        })

        this.totalLinesCount++

        return this
    }

    /**
     * Adds a recurring transaction for each month within the generator's date range.
     * @param entries The transaction entries (similar to addStatementRow)
     * @param dayOfMonth The day of the month the transaction occurs (1-31)
     */
    public addRecurringTransactions(
        entries: Array<{ column: ColumnsType; value?: string | number | Date }>,
        dayOfMonth: number
    ): StatementGenerator {
        const current = new Date(this.startDate)
        current.setHours(0, 0, 0, 0)

        while (current <= this.endDate) {
            const transactionDate = new Date(current.getFullYear(), current.getMonth(), dayOfMonth)

            // Ensure transaction date is within the current month and the overall range
            if (
                transactionDate.getMonth() === current.getMonth() &&
                transactionDate >= this.startDate &&
                transactionDate <= this.endDate
            ) {
                // Create a copy of entries to avoid modifying the original array
                const rowEntries = [...entries]

                // Add or override date columns
                const dateCols = [ColumnsType.DATE_TRANSACTION, ColumnsType.DATE_INSCRIPTION]
                dateCols.forEach(col => {
                    const index = rowEntries.findIndex(e => e.column === col)
                    if (index !== -1) {
                        rowEntries[index] = { column: col, value: transactionDate }
                    } else {
                        rowEntries.push({ column: col, value: transactionDate })
                    }
                })

                this.addStatementRow(rowEntries)
            }

            // Move to the next month
            current.setMonth(current.getMonth() + 1)
        }

        return this
    }
}
