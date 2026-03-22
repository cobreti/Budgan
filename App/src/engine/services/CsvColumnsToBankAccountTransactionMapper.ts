import { CSVColumnContent, type CSVColumnContentMapping } from '@engine/models/csvDocument'
import type { CsvRow } from '@engine/services/CsvParser'
import type { BankAccountTransaction } from '@engine/models/BankAccountTypes'
import moment from 'moment'

export type CsvColumnsToBankAccountTransactionMapperOptions = {
    dateFormat?: string
}

export class CsvColumnsToBankAccountTransactionMapper {
    dateInscriptionColIndex: number | null
    dateTransactionColIndex: number | null
    amountColIndex: number | null
    cardNumberColIndex: number | null
    descriptionColIndex: number | null
    typeColIndex: number | null
    dateFormat: string = 'YYYYMMDD'

    constructor(
        private columnsMapping: CSVColumnContentMapping,
        options?: CsvColumnsToBankAccountTransactionMapperOptions
    ) {
        this.dateInscriptionColIndex = this.getColumnIndex(CSVColumnContent.DATE_INSCRIPTION)
        this.dateTransactionColIndex = this.getColumnIndex(CSVColumnContent.DATE_TRANSACTION)
        this.amountColIndex = this.getColumnIndex(CSVColumnContent.AMOUNT)
        this.cardNumberColIndex = this.getColumnIndex(CSVColumnContent.CARD_NUMBER)
        this.descriptionColIndex = this.getColumnIndex(CSVColumnContent.DESCRIPTION)
        this.typeColIndex = this.getColumnIndex(CSVColumnContent.TYPE)

        if (options) {
            if (options.dateFormat) {
                this.dateFormat = options.dateFormat
            }
        }
    }

    getColumnIndex(column: CSVColumnContent): number | null {
        if (column in this.columnsMapping) {
            return this.columnsMapping[column]
        }

        return null
    }

    get valid(): boolean {
        return (
            this.dateInscriptionColIndex !== null &&
            this.amountColIndex !== null &&
            this.descriptionColIndex !== null
        )
    }

    mapCsvToTransaction(row: CsvRow, transactionGroupId: string): BankAccountTransaction | null {
        if (!this.valid) {
            return null
        }

        let maxColIndex = Math.max(
            this.dateInscriptionColIndex!,
            this.amountColIndex!,
            this.descriptionColIndex!
        )

        if (this.typeColIndex !== null) {
            maxColIndex = Math.max(maxColIndex, this.typeColIndex!)
        }

        if (!(row.records.length > maxColIndex)) {
            return null
        }

        const dateInscription = row.records[this.dateInscriptionColIndex!]
        const amoount = row.records[this.amountColIndex!]
        const description = row.records[this.descriptionColIndex!]
        const type = this.typeColIndex !== null ? row.records[this.typeColIndex!] : ''
        const id = `${dateInscription}-${amoount}-${description}-${type}`

        return {
            transactionId: id,
            transactionGroupId,
            dateInscription: moment(dateInscription, this.dateFormat).toDate(),
            amount: parseFloat(amoount),
            description: description,
            type: type
        }
    }
}
