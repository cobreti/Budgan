import 'reflect-metadata'

import { inject, injectable } from 'inversify'
import type {
    BankAccount,
    BankAccountTransaction,
    BankAccountTransactionsGroup
} from '@engine/models/BankAccountTypes'
import { ReaderFactory } from './FileReaderFactory'
import { parse } from 'csv-parse/browser/esm'
import { type CSVColumnContentMapping } from '@engine/models/csvDocument'
import type { CsvContent } from './CsvParser'
import { CsvColumnsToBankAccountTransactionMapper } from '@engine/services/CsvColumnsToBankAccountTransactionMapper'
import { IdGenerator } from './IdGenerator'
import {InversifyUtils} from "@/inversify/inversify-utils.ts";

export type TransactionsConvertionResult = {
    transactions: BankAccountTransaction[]
    transactionsGroup: BankAccountTransactionsGroup
}

export abstract class CsvToBankAccount {
    static readonly bindingTypeId: string = InversifyUtils.createBindingId('CsvToBankAccount');

    abstract loadCsvFile(file: File): Promise<BankAccount>
    abstract convertToBankAccountTransactionsGroup(
        csvContent: CsvContent,
        columnsMapping: CSVColumnContentMapping
    ): TransactionsConvertionResult | undefined
}

@injectable()
export class CsvToBankAccountImpl implements CsvToBankAccount {

    constructor(
        @inject(ReaderFactory.bindingTypeId) private fileReaderFactory: ReaderFactory,
        @inject(IdGenerator.bindingTypeId) private idGenerator: IdGenerator
    ) {}

    loadCsvFile(file: File): Promise<BankAccount> {
        return new Promise((resolve, reject) => {
            const reader = this.fileReaderFactory.createReader()

            reader.onload = () => {
                console.log(`File ${file.name} loaded.`)
                const text = reader.result as string
                if (text == null) {
                    reject('Unable to read file content as text')
                }
                const accountResult = this.convertCsvToBankAccount(text)
                if (!accountResult) {
                    reject()
                } else {
                    resolve(accountResult)
                }
            }

            reader.onerror = () => {
                console.log(`File ${file.name} could not be loaded.`)
                reject()
            }

            reader.readAsText(file)
        })
    }

    convertCsvToBankAccount(text: string): BankAccount | undefined {
        const parser = parse({
            delimiter: ','
        })

        parser.on('readable', () => {
            let record
            while ((record = parser.read()) !== null) {
                console.log(record)
            }
        })

        const lines = text.split(/\r?\n/)

        lines.forEach((line) => {
            const items = line.split(',')
            if (items.length > 3) {
                parser.write(line)
                parser.write('\n')
            }
        })

        parser.end()

        return undefined
    }

    convertToBankAccountTransactionsGroup(
        csvContent: CsvContent,
        columnsMapping: CSVColumnContentMapping
    ): TransactionsConvertionResult | undefined {
        const mapper = new CsvColumnsToBankAccountTransactionMapper(columnsMapping)

        const transactions: BankAccountTransaction[] = []

        const transactionGroupId = this.idGenerator.generateId()

        for (const row of csvContent.rows) {
            const transaction = mapper.mapCsvToTransaction(row, transactionGroupId)
            if (transaction) {
                transactions.push(transaction)
            }
        }

        if (transactions.length === 0) {
            return undefined
        }

        let dateStart: Date = transactions[0].dateInscription
        let dateEnd: Date = transactions[0].dateInscription

        for (const transaction of transactions) {
            if (transaction.dateInscription < dateStart) {
                dateStart = transaction.dateInscription
            }

            if (transaction.dateInscription > dateEnd) {
                dateEnd = transaction.dateInscription
            }
        }

        const name = `${dateStart.toDateString()} - ${dateEnd.toDateString()}`

        const transactionsGroup = {
            id: transactionGroupId,
            name,
            dateStart,
            dateEnd,
            transactions: []
        } as BankAccountTransactionsGroup

        return {
            transactions,
            transactionsGroup
        }
    }
}
