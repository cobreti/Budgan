import 'reflect-metadata'
import { injectable, inject } from 'inversify'
import { InversifyUtils } from '@inversify/inversify-utils.ts'
import { CsvContentExtractor } from '@engine/modules/csv-import/csv-content-extractor'
import { CsvColumns, type CsvColumnMapping } from '@engine/modules/csv-import/csv-column-content'
import { BdgAccountSegmentImpl, type BdgAccountSegment, type BdgAccountSegmentRow } from '@engine/modules/bdg-workspace/bdg-account-segment'
import { ReaderFactory } from '@engine/services/FileReaderFactory'
import { IdGenerator } from '@engine/services/IdGenerator'
import type { ResultWithError } from '@engine/types/result-pattern'

export abstract class CsvContentImporter {
  static readonly bindingTypeId: string = InversifyUtils.createBindingId('csv-content-importer')

  abstract import(
    file: File,
    columnMapping: CsvColumnMapping,
  ): Promise<ResultWithError<BdgAccountSegment, string>>
}

@injectable()
export class CsvContentImporterImpl extends CsvContentImporter {
  constructor(
    @inject(ReaderFactory.bindingTypeId) private readonly readerFactory: ReaderFactory,
    @inject(IdGenerator.bindingTypeId) private readonly idGenerator: IdGenerator,
  ) {
    super()
  }

  import(
    file: File,
    columnMapping: CsvColumnMapping,
  ): Promise<ResultWithError<BdgAccountSegment, string>> {
    return new Promise((resolve) => {
      const reader = this.readerFactory.createReader()

      reader.onerror = () => {
        resolve({ success: false, error: 'Failed to read the file' })
      }

      reader.onload = (event) => {
        const text = event.target?.result
        if (typeof text !== 'string') {
          resolve({ success: false, error: 'Failed to read file content' })
          return
        }

        try {
          const extraction = new CsvContentExtractor().extract(text)

          const rows: BdgAccountSegmentRow[] = extraction.rows.map((row) => {
            const getValue = (col: CsvColumns): string => {
              const idx = columnMapping[col]
              if (idx === undefined) return ''
              const key = extraction.header[idx]
              return key !== undefined ? (row[key] ?? '') : ''
            }

            const amountRaw = getValue(CsvColumns.amount)
            const amount = parseFloat(amountRaw.replace(',', '.')) || 0

            const segmentRow: BdgAccountSegmentRow = {
              cardNumber: getValue(CsvColumns.cardNumber),
              description: getValue(CsvColumns.description),
              dateTransactionAsString: getValue(CsvColumns.dateTransaction),
              amount,
            }

            const dateInscription = getValue(CsvColumns.dateInscription)
            if (dateInscription) {
              segmentRow.dateInscriptionAsString = dateInscription
            }

            return segmentRow
          })

          const segmentName = file.name.replace(/\.[^/.]+$/, '')
          const segment = new BdgAccountSegmentImpl(this.idGenerator.generateId(), segmentName, rows)

          resolve({ success: true, value: segment })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to process CSV content'
          resolve({ success: false, error: message })
        }
      }

      reader.readAsText(file)
    })
  }
}
